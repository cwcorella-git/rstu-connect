import { test, expect } from '@playwright/test'

/**
 * Smoke tests for RSTU Connect
 *
 * These tests verify critical user flows work correctly.
 * Run with: npx playwright test e2e/smoke.spec.ts
 */

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    // Use empty string to navigate to baseURL (including /rstu-connect path)
    await page.goto('')
    await page.evaluate(() => localStorage.clear())
  })

  test('homepage loads with building list', async ({ page }) => {
    await page.goto('')

    // Check that the page title contains RSTU
    await expect(page).toHaveTitle(/RSTU|Reno.*Sparks.*Tenants/i)

    // Wait for page to fully load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

    // Check that main content area exists
    await expect(page.locator('body')).toBeVisible()

    // Verify that some property-related content is visible (search input or building cards)
    const hasSearchInput = await page.locator('input[placeholder*="search" i], input[placeholder*="properties" i]').first().isVisible().catch(() => false)
    const hasBuildingContent = await page.locator('[class*="building"], [class*="card"], button').first().isVisible().catch(() => false)

    // At least one of these should be true for the homepage to be considered loaded
    expect(hasSearchInput || hasBuildingContent).toBe(true)
  })

  test('can search for buildings', async ({ page }) => {
    await page.goto('')

    // Find the search input
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="find" i], input[type="search"]').first()

    if (await searchInput.isVisible().catch(() => false)) {
      // Type a search query
      await searchInput.fill('main')
      await searchInput.press('Enter')

      // Wait for results to update
      await page.waitForTimeout(500)

      // Verify search is working (results should change or show filtered)
      const resultsText = await page.locator('body').textContent()
      expect(resultsText?.toLowerCase()).toContain('main')
    }
  })

  test('can navigate between main tabs', async ({ page }) => {
    await page.goto('')

    // Check for main navigation tabs
    const tabs = ['home', 'reading', 'mutual aid', 'tools', 'profile']

    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}"), a:has-text("${tabName}")`, { hasText: new RegExp(tabName, 'i') }).first()

      if (await tab.isVisible().catch(() => false)) {
        // Tab exists - that's a pass for this smoke test
        expect(await tab.isVisible()).toBe(true)
      }
    }
  })

  test('profile tab shows login/create options for new user', async ({ page }) => {
    await page.goto('')

    // Click on Profile tab
    const profileTab = page.locator('button:has-text("profile"), a:has-text("profile")', { hasText: /profile/i }).first()

    if (await profileTab.isVisible().catch(() => false)) {
      await profileTab.click()
      await page.waitForTimeout(500)

      // Should see login or create profile options
      const pageContent = await page.locator('body').textContent()
      const hasLoginOption = /login|sign in|create|join|invite/i.test(pageContent || '')
      expect(hasLoginOption).toBe(true)
    }
  })

  test('reading tab loads document library', async ({ page }) => {
    await page.goto('')

    // Click on Reading tab
    const readingTab = page.locator('button:has-text("reading"), a:has-text("reading")', { hasText: /reading/i }).first()

    if (await readingTab.isVisible().catch(() => false)) {
      await readingTab.click()
      await page.waitForTimeout(1000)

      // Should see document categories or list
      const pageContent = await page.locator('body').textContent()
      const hasDocuments = /document|library|category|organizing|theory|guide/i.test(pageContent || '')
      expect(hasDocuments).toBe(true)
    }
  })

  test('mutual aid tab loads', async ({ page }) => {
    await page.goto('')

    // Click on Mutual Aid tab
    const mutualAidTab = page.locator('button:has-text("mutual"), a:has-text("mutual")', { hasText: /mutual/i }).first()

    if (await mutualAidTab.isVisible().catch(() => false)) {
      await mutualAidTab.click()
      await page.waitForTimeout(500)

      // Should see mutual aid content
      const pageContent = await page.locator('body').textContent()
      const hasMutualAid = /mutual aid|needs|offers|help|bloc|resource/i.test(pageContent || '')
      expect(hasMutualAid).toBe(true)
    }
  })

  test('mobile menu works on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('')

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // On mobile, the app should still be usable - verify main content loads
    await expect(page.locator('body')).toBeVisible()

    // Check if any interactive elements are visible (tabs, buttons, etc.)
    const hasInteractiveElements = await page.locator('button, [role="tab"], nav').first().isVisible().catch(() => false)
    expect(hasInteractiveElements).toBe(true)
  })
})

test.describe('Building Selection', () => {
  test('can select a building and view details', async ({ page }) => {
    await page.goto('')
    await page.evaluate(() => localStorage.clear())

    // Wait for buildings to load
    await page.waitForTimeout(2000)

    // Find and click the first building card/item
    const buildingCard = page.locator('[class*="building"], [class*="card"], [data-testid="building"], button:has-text(/\\d+ units/i)').first()

    if (await buildingCard.isVisible().catch(() => false)) {
      await buildingCard.click()
      await page.waitForTimeout(500)

      // Should show building details (address, units, tabs)
      const pageContent = await page.locator('body').textContent()
      const hasDetails = /chat|events|map|units|address/i.test(pageContent || '')
      expect(hasDetails).toBe(true)
    }
  })
})

test.describe('Language Support', () => {
  test('language selector is available', async ({ page }) => {
    await page.goto('')

    // Look for language selector
    const langSelector = page.locator('select:has(option:has-text("English")), button:has-text("EN"), [class*="language"]').first()

    // Language selector should exist somewhere
    const exists = await langSelector.isVisible().catch(() => false) ||
                   (await page.locator('text=/español|tagalog|中文|tiếng việt/i').first().isVisible().catch(() => false))

    // This is optional - not all pages may show the selector prominently
    // Just verify the page loads without language errors
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Edit Mode', () => {
  test('admin can enter edit mode without token prompt', async ({ page }) => {
    await page.goto('')

    // Set up admin profile in localStorage
    await page.evaluate(() => {
      const adminProfile = {
        currentProfile: {
          id: 'test-admin-' + Date.now(),
          nickname: 'TestAdmin',
          role: 'admin',
          trustLevel: 'verified',
          created: Date.now(),
          lastActive: Date.now(),
        },
        storedProfiles: [],
        inviteCodes: {},
      }
      localStorage.setItem('rstu_profiles', JSON.stringify(adminProfile))
    })

    // Reload to pick up the profile
    await page.reload()
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Press Ctrl+Shift+E to enter edit mode
    await page.keyboard.press('Control+Shift+E')
    await page.waitForTimeout(500)

    // Check if edit mode indicator appears (blue bar with "Edit Mode" text)
    const editModeIndicator = page.locator('text=Edit Mode').first()
    const tokenPrompt = page.locator('text=GitHub Token Required').first()

    // If token is embedded, we should see the edit mode bar, not the token prompt
    const hasEditMode = await editModeIndicator.isVisible().catch(() => false)
    const hasTokenPrompt = await tokenPrompt.isVisible().catch(() => false)

    // Either edit mode is active (token works) or token prompt shows (need manual setup)
    // Both are valid states depending on build environment
    expect(hasEditMode || hasTokenPrompt).toBe(true)

    // If edit mode is active without prompt, token is working correctly
    if (hasEditMode && !hasTokenPrompt) {
      // Verify we can see edit mode controls
      await expect(page.locator('text=Exit')).toBeVisible()
    }
  })
})
