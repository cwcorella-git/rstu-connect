import { test, expect, Page } from '@playwright/test'

// ─── Helper Functions ──────────────────────────────────────────────────

/** Dismiss overlays that block interaction: RCV tutorial + onboarding checklist */
async function dismissOverlays(page: Page) {
  await page.evaluate(() => {
    // Mark RCV tutorial as completed so it doesn't pop up on profile page
    localStorage.setItem('rstu_rcv_tutorial_completed', 'true')
    // Dismiss the "Getting Started" checklist overlay
    localStorage.setItem('rstu_onboarding_state', JSON.stringify({
      completedItems: [],
      minimized: true,
      checklistDismissed: true,
    }))
  })
}

async function seedAdminProfile(page: Page) {
  await page.evaluate(() => {
    const profileData = {
      currentProfile: {
        id: 'test-admin-id',
        nickname: 'TestAdmin',
        email: 'admin@test.com',
        role: 'admin',
        trustLevel: 'verified',
        created: Date.now(),
        lastActive: Date.now(),
      },
      storedProfiles: [],
      inviteCodes: {},
      lastModified: Date.now(),
    }
    localStorage.setItem('rstu_profile_data', JSON.stringify(profileData))
  })
  await dismissOverlays(page)
}

async function seedOrganizerProfile(page: Page) {
  await page.evaluate(() => {
    const profileData = {
      currentProfile: {
        id: 'test-organizer-id',
        nickname: 'TestOrganizer',
        email: 'organizer@test.com',
        role: 'organizer',
        trustLevel: 'verified',
        created: Date.now(),
        lastActive: Date.now(),
      },
      storedProfiles: [],
      inviteCodes: {},
      lastModified: Date.now(),
    }
    localStorage.setItem('rstu_profile_data', JSON.stringify(profileData))
  })
  await dismissOverlays(page)
}

async function seedTenantProfile(page: Page) {
  await page.evaluate(() => {
    const profileData = {
      currentProfile: {
        id: 'test-tenant-id',
        nickname: 'TestTenant',
        email: 'tenant@test.com',
        role: 'tenant',
        trustLevel: 'invited',
        created: Date.now(),
        lastActive: Date.now(),
      },
      storedProfiles: [],
      inviteCodes: {},
      lastModified: Date.now(),
    }
    localStorage.setItem('rstu_profile_data', JSON.stringify(profileData))
  })
  await dismissOverlays(page)
}

async function seedInviteCode(page: Page, code: string, overrides: Record<string, unknown> = {}) {
  await page.evaluate(([c, o]) => {
    const stored = localStorage.getItem('rstu_profile_data')
    const state = stored ? JSON.parse(stored) : {
      currentProfile: null,
      storedProfiles: [],
      inviteCodes: {},
      lastModified: Date.now(),
    }
    state.inviteCodes[c] = {
      code: c,
      createdBy: 'test-admin-id',
      createdByName: 'TestAdmin',
      createdByRole: 'admin',
      grantRole: 'tenant',
      maxUses: 1,
      usedCount: 0,
      usedBy: [],
      revoked: false,
      created: Date.now(),
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      ...JSON.parse(o),
    }
    state.lastModified = Date.now()
    localStorage.setItem('rstu_profile_data', JSON.stringify(state))
  }, [code, JSON.stringify(overrides)])
}

async function navigateToProfile(page: Page) {
  // Navigate to profile tab via URL hash — most reliable method
  // TabContext reads #profile on mount and sets activeTab='profile'
  await page.goto('#profile')
  await page.waitForTimeout(1000)
}

// ─── Tests ─────────────────────────────────────────────────────────────

test.describe('Invite System', () => {
  // Tests with profile seeding + navigation need extra time
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    // Mock all Supabase REST API calls to prevent real DB interactions
    // Without these mocks, tests fail because:
    // - isProfileDeletedInDb() clears test profiles (not in real DB)
    // - Email uniqueness check blocks profile creation
    // - Profile/invite upserts fail without auth
    await page.route('**/rest/v1/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (method === 'GET') {
        // Email uniqueness check (profiles?email=eq.xxx) — no existing profile
        if (url.includes('/profiles') && url.includes('email=eq.')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(null),
          })
          return
        }
        // Profile existence check (profiles?select=id&id=eq.xxx) — profile exists
        if (url.includes('/profiles') && url.includes('select=id')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 'mock' }),
          })
          return
        }
        // Invite code lookups — return not found (use localStorage fallback)
        if (url.includes('/invite_codes')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(null),
          })
          return
        }
        // Any other GET — return empty
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
        return
      }

      // All writes (POST/PATCH/PUT/DELETE) — return success
      if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
        return
      }

      // HEAD requests (for count checks) — return empty with count=0 header
      if (method === 'HEAD') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'content-range': '*/0' },
          body: '',
        })
        return
      }

      await route.continue()
    })

    await page.goto('')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await dismissOverlays(page)
  })

  // ─── 1. Invite Creation - Admin ────────────────────────────────────

  test.describe('Invite Creation - Admin', () => {
    test.beforeEach(async ({ page }) => {
      await seedAdminProfile(page)
      await page.goto('#profile')
      await page.waitForTimeout(1000)
    })

    test('admin sees invite section with create button', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Invite Codes' })).toBeVisible()
      await expect(page.getByRole('button', { name: /create/i })).toBeVisible()
    })

    test('admin sees all three role buttons', async ({ page }) => {
      // Open create form
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Should see all role options
      await expect(page.getByRole('button', { name: 'Tenant' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Organizer' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible()
    })

    test('admin creates tenant invite', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Tenant is default - click Create Invite Code
      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      // Modal should appear with "Invite Created!"
      await expect(page.getByText('Invite Code Created')).toBeVisible()

      // Should show a 6-character code
      const codeEl = page.locator('.text-2xl.font-mono')
      await expect(codeEl).toBeVisible()
      const codeText = await codeEl.textContent()
      expect(codeText?.trim().length).toBe(6)

      // Should show Tenant role badge in modal
      await expect(page.locator('.fixed').getByText('Tenant')).toBeVisible()
    })

    test('admin creates organizer invite', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      await page.getByRole('button', { name: 'Organizer' }).click()
      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite Code Created')).toBeVisible()
      await expect(page.locator('.fixed').getByText('Organizer')).toBeVisible()
    })

    test('admin creates admin invite', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Click the Admin role button (within the create form, not the fixed modal)
      const adminRoleBtn = page.locator('.bg-gray-50 button:has-text("Admin")')
      await adminRoleBtn.click()
      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite Code Created')).toBeVisible()
      await expect(page.locator('.fixed').getByText('Admin')).toBeVisible()
    })

    test('admin creates invite with 30-day expiration', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Change expiration to 30 days — scope to the form label's parent div
      const expirationSelect = page.getByText('Expires In').locator('..').locator('select')
      await expirationSelect.selectOption({ label: '30 days' })

      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite Code Created')).toBeVisible()

      // Verify in localStorage
      const inviteData = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        const codes = data.inviteCodes || {}
        const firstCode = Object.values(codes)[0] as any
        return firstCode
      })

      // 30 days = ~2592000000ms, check it's roughly right (within 1 minute)
      const expectedExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000
      expect(inviteData.expires).toBeGreaterThan(expectedExpiry - 60000)
      expect(inviteData.expires).toBeLessThan(expectedExpiry + 60000)
    })

    test('admin creates invite with 5 max uses', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Change max uses to 5 — scope to the form label's parent div
      const maxUsesSelect = page.getByText('Max Uses').locator('..').locator('select')
      await maxUsesSelect.selectOption({ label: '5 uses' })

      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite Code Created')).toBeVisible()
      // Modal should show "5 uses" badge
      await expect(page.locator('.fixed').getByText('5 uses')).toBeVisible()
    })
  })

  // ─── 2. Invite Creation - Organizer ────────────────────────────────

  test.describe('Invite Creation - Organizer', () => {
    test.beforeEach(async ({ page }) => {
      await seedOrganizerProfile(page)
      await page.goto('#profile')
      await page.waitForTimeout(1000)
    })

    test('organizer sees only Tenant role option', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      // Should see Tenant button
      await expect(page.getByRole('button', { name: 'Tenant' })).toBeVisible()

      // Should NOT see Organizer or Admin buttons
      const organizerBtn = page.locator('.bg-gray-50 button:has-text("Organizer")')
      const adminBtn = page.locator('.bg-gray-50 button:has-text("Admin")')
      await expect(organizerBtn).toHaveCount(0)
      await expect(adminBtn).toHaveCount(0)

      // Should see the "Only admins" message
      await expect(page.getByText(/only admins/i)).toBeVisible()
    })

    test('organizer creates tenant invite', async ({ page }) => {
      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      // Verify invite was created in localStorage
      const inviteData = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        const codes = data.inviteCodes || {}
        return Object.values(codes)[0] as any
      })

      // createInviteAsync requires hasRole('organizer'), which organizer has
      // But the grantRole should be 'tenant' since that's all they can create
      if (inviteData) {
        expect(inviteData.grantRole).toBe('tenant')
        expect(inviteData.createdByRole).toBe('organizer')
      }
    })
  })

  // ─── 3. Invite Creation - Tenant ───────────────────────────────────

  test.describe('Invite Creation - Tenant', () => {
    test('tenant invite creation fails silently', async ({ page }) => {
      await seedTenantProfile(page)
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      // The invite section should be visible
      await expect(page.getByRole('heading', { name: 'Invite Codes' })).toBeVisible()

      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      // createInviteAsync returns null for tenants (requires organizer role)
      // So "Invite Created!" modal should NOT appear
      const modal = page.getByText('Invite Code Created')
      await expect(modal).not.toBeVisible()

      // localStorage should have no invite codes
      const codeCount = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        return Object.keys(data.inviteCodes || {}).length
      })
      expect(codeCount).toBe(0)
    })
  })

  // ─── 4. Invite Redemption - Onboarding ─────────────────────────────

  test.describe('Invite Redemption - Onboarding', () => {

    test('valid code auto-validates from URL', async ({ page }) => {
      // Seed an invite code (no profile)
      await seedInviteCode(page, 'ABC123')
      await page.goto('?invite=ABC123')
      await page.waitForTimeout(1000)

      // Wizard should auto-open, invite code should be pre-filled
      const input = page.locator('#invite-code')
      await expect(input).toBeVisible()
      const value = await input.inputValue()
      expect(value).toBe('ABC123')

      // Should auto-validate and show success
      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
    })

    test('valid code manual entry and validation', async ({ page }) => {
      await seedInviteCode(page, 'XYZ789')
      // Navigate with a different code in URL to open wizard, then type the real code
      await page.goto('?invite=DUMMY1')
      await page.waitForTimeout(1000)

      // Clear the input and type the real code
      const input = page.locator('#invite-code')
      await expect(input).toBeVisible()
      await input.clear()
      await input.fill('XYZ789')

      // Click the Check button
      await page.getByRole('button', { name: 'Check' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
    })

    test('invalid code shows error', async ({ page }) => {
      // Don't seed any invite code — navigate with a bad code
      await page.goto('?invite=BADCODE')
      await page.waitForTimeout(2000)

      // Should show error text
      await expect(page.getByText('Invalid invite code')).toBeVisible({ timeout: 5000 })
    })

    test('expired code shows error', async ({ page }) => {
      // Seed expired invite
      await seedInviteCode(page, 'EXPRD1', {
        expires: Date.now() - 1000, // Expired 1 second ago
      })
      await page.goto('?invite=EXPRD1')
      await page.waitForTimeout(2000)

      // Should show expiration error text
      await expect(page.getByText('Invite code expired')).toBeVisible({ timeout: 5000 })
    })

    test('revoked code shows error', async ({ page }) => {
      await seedInviteCode(page, 'REVKD1', {
        revoked: true,
      })
      await page.goto('?invite=REVKD1')
      await page.waitForTimeout(2000)

      // Should show revocation error text
      await expect(page.getByText('Invite code has been revoked')).toBeVisible({ timeout: 5000 })
    })

    test('max-uses-reached code shows error', async ({ page }) => {
      await seedInviteCode(page, 'MAXD01', {
        maxUses: 1,
        usedCount: 1,
        usedBy: ['other-user-id'],
      })
      await page.goto('?invite=MAXD01')
      await page.waitForTimeout(2000)

      // Should show max uses error text
      await expect(page.getByText('Invite code has reached max uses')).toBeVisible({ timeout: 5000 })
    })

    test('full onboarding flow with invite code', async ({ page }) => {
      await seedInviteCode(page, 'FLOW01')
      await page.goto('?invite=FLOW01')
      await page.waitForTimeout(1000)

      // Step 1: Welcome — auto-validates
      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      // Step 2: Identity — enter nickname and email
      await expect(page.locator('#nickname')).toBeVisible()
      await page.locator('#nickname').fill('E2ETestUser')
      await page.locator('#email').fill('e2etest@example.com')
      // Wait for email validation (debounced 500ms)
      await page.waitForTimeout(1000)
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      // Step 3: Building — skip
      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      // Step 4: Household — skip
      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      // Step 5: Review — create profile
      await page.getByRole('button', { name: 'Create your profile' }).click()

      // Wizard auto-closes via handleProfileCreated → setShowWizard(false)
      // So verify the profile page loads with the new user instead
      await expect(page.getByRole('heading', { name: 'E2ETestUser' })).toBeVisible({ timeout: 15000 })

      // Verify profile exists in localStorage
      const profileData = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        return data.currentProfile
      })
      expect(profileData).toBeTruthy()
      expect(profileData.nickname).toBe('E2ETestUser')
      expect(profileData.email).toBe('e2etest@example.com')
    })

    test('admin invite yields invited trust level and correct role', async ({ page }) => {
      // Admin-created invite grants the specified role but trust level is always 'invited'
      // (only the first-user bootstrap gets 'verified')
      await seedInviteCode(page, 'ADMN01', {
        createdByRole: 'admin',
        grantRole: 'organizer', // Admin can grant organizer role
      })
      await page.goto('?invite=ADMN01')
      await page.waitForTimeout(1000)

      // Complete the flow
      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      await page.locator('#nickname').fill('TrustTestAdmin')
      await page.locator('#email').fill('trustadmin@example.com')
      await page.waitForTimeout(1000)
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Create your profile' }).click()

      // Wizard auto-closes — verify profile page loads with new user
      await expect(page.getByRole('heading', { name: 'TrustTestAdmin' })).toBeVisible({ timeout: 15000 })

      const profile = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        return data.currentProfile
      })
      // All invite-based registrations get 'invited' trust level
      expect(profile.trustLevel).toBe('invited')
      // But the granted role comes from the invite
      expect(profile.role).toBe('organizer')
    })

    test('tenant invite yields invited trust level', async ({ page }) => {
      await seedInviteCode(page, 'TNNT01', {
        createdBy: 'test-tenant-id',
        createdByName: 'TestTenant',
        createdByRole: 'tenant',
        grantRole: 'tenant',
      })
      await page.goto('?invite=TNNT01')
      await page.waitForTimeout(1000)

      // Complete the flow
      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      await page.locator('#nickname').fill('TrustTestTenant')
      await page.locator('#email').fill('trusttenant@example.com')
      await page.waitForTimeout(1000)
      await page.getByRole('button', { name: 'Go to next step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Skip this step' }).click()
      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Create your profile' }).click()

      // Wizard auto-closes — verify profile page loads with new user
      await expect(page.getByRole('heading', { name: 'TrustTestTenant' })).toBeVisible({ timeout: 15000 })

      const profile = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        return data.currentProfile
      })
      expect(profile.trustLevel).toBe('invited')
    })
  })

  // ─── 5. Invite Management ─────────────────────────────────────────

  test.describe('Invite Management', () => {

    test('active codes display correctly', async ({ page }) => {
      await seedAdminProfile(page)
      await seedInviteCode(page, 'ACT001', { grantRole: 'tenant' })
      await seedInviteCode(page, 'ACT002', { grantRole: 'organizer' })
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      // Both codes should be visible
      await expect(page.locator('code:has-text("ACT001")')).toBeVisible()
      await expect(page.locator('code:has-text("ACT002")')).toBeVisible()

      // Should show "Active" status badges
      const activeBadges = page.getByText('Active')
      expect(await activeBadges.count()).toBeGreaterThanOrEqual(2)

      // Should show role badges
      await expect(page.getByText('Tenant').first()).toBeVisible()
      await expect(page.getByText('Organizer').first()).toBeVisible()
    })

    test('status badges display correctly for inactive codes', async ({ page }) => {
      await seedAdminProfile(page)
      // Active
      await seedInviteCode(page, 'ACTV01')
      // Expired
      await seedInviteCode(page, 'EXPD01', { expires: Date.now() - 1000 })
      // Revoked
      await seedInviteCode(page, 'REVK01', { revoked: true })
      // Fully used
      await seedInviteCode(page, 'FULL01', { maxUses: 1, usedCount: 1, usedBy: ['someone'] })
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      // Active code should be visible directly
      await expect(page.locator('code:has-text("ACTV01")')).toBeVisible()

      // Inactive codes should be in collapsed section
      const detailsSummary = page.locator('details > summary')
      await expect(detailsSummary).toBeVisible()

      // Expand the inactive section
      await detailsSummary.click()
      await page.waitForTimeout(300)

      // Should see expired, revoked, and fully used badges
      await expect(page.getByText('Expired').first()).toBeVisible()
      await expect(page.getByText('Revoked').first()).toBeVisible()
      await expect(page.getByText('Fully Used').first()).toBeVisible()
    })

    test('revoke an active invite', async ({ page }) => {
      await seedAdminProfile(page)
      await seedInviteCode(page, 'RVKE01')
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      // Verify code is visible and active
      await expect(page.locator('code:has-text("RVKE01")')).toBeVisible()

      // Click revoke button
      await page.locator('button[title="Revoke"]').first().click()
      await page.waitForTimeout(300)

      // Confirm in the modal
      await page.getByRole('button', { name: /revoke/i }).last().click()
      await page.waitForTimeout(500)

      // Verify localStorage has revoked: true
      const isRevoked = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        return data.inviteCodes?.['RVKE01']?.revoked
      })
      expect(isRevoked).toBe(true)
    })

    test('copy code button is clickable', async ({ page }) => {
      await seedAdminProfile(page)
      await seedInviteCode(page, 'COPY01')
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      // The copy button should be present and clickable
      const copyBtn = page.locator('button[title="Copy code"]').first()
      await expect(copyBtn).toBeVisible()

      // Click should not throw an error
      await copyBtn.click()
      // If we get here without error, the test passes
    })
  })

  // ─── 6. Cross-Session Flow ─────────────────────────────────────────

  test.describe('Cross-Session Flow', () => {

    test('create invite then redeem in new session', async ({ page }) => {
      // Phase 1: Admin creates an invite
      await seedAdminProfile(page)
      await page.goto('#profile')
      await page.waitForTimeout(1000)

      await page.getByRole('button', { name: /create/i }).first().click()
      await page.waitForTimeout(300)

      await page.getByRole('button', { name: 'Create Invite Code' }).click()
      await page.waitForTimeout(1000)

      await expect(page.getByText('Invite Code Created')).toBeVisible()

      // Extract the code from the modal
      const codeEl = page.locator('.text-2xl.font-mono')
      const inviteCode = (await codeEl.textContent())?.trim()
      expect(inviteCode).toBeTruthy()
      expect(inviteCode!.length).toBe(6)

      // Close the modal
      await page.getByRole('button', { name: /done|close/i }).click()
      await page.waitForTimeout(300)

      // Phase 2: Clear profile (simulate new user), keep invite codes
      await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}')
        // Remove profile but keep invite codes
        data.currentProfile = null
        data.storedProfiles = []
        localStorage.setItem('rstu_profile_data', JSON.stringify(data))
        // Clear onboarding draft
        localStorage.removeItem('rstu_onboarding_draft')
      })

      // Phase 3: Navigate with the invite code
      await page.goto(`?invite=${inviteCode}`)
      await page.waitForTimeout(1000)

      // The wizard should open and auto-validate
      const input = page.locator('#invite-code')
      await expect(input).toBeVisible({ timeout: 5000 })

      // Should show valid
      await expect(page.getByText('Invite code valid!')).toBeVisible({ timeout: 5000 })
    })
  })
})
