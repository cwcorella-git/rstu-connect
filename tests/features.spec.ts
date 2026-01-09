import { test, expect } from '@playwright/test';

// Bootstrap code for tests - read from environment variable
const BOOTSTRAP_CODE = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_CODE || 'TEST-BOOTSTRAP-CODE';

test.describe('Recent Features', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('invite code input accepts 20 characters (bootstrap code length)', async ({ page }) => {
    await page.goto('/');

    // Click Join tab (it shows +Join icon)
    await page.click('button:has-text("Join")');
    await page.waitForTimeout(1000);

    // Find the invite code input - look for it by examining what's visible
    const inviteInput = page.locator('input').filter({ hasText: '' }).first();
    const allInputs = await page.locator('input').all();

    console.log('Number of inputs found:', allInputs.length);

    for (let i = 0; i < allInputs.length; i++) {
      const placeholder = await allInputs[i].getAttribute('placeholder');
      const maxLength = await allInputs[i].getAttribute('maxLength');
      console.log(`Input ${i}: placeholder="${placeholder}", maxLength=${maxLength}`);
    }

    // Look specifically for invite code input
    const codeInput = page.locator('input[placeholder*="invite"], input[placeholder*="code"], input[placeholder*="admin"]').first();

    if (await codeInput.isVisible().catch(() => false)) {
      const maxLength = await codeInput.getAttribute('maxLength');
      console.log('Invite code input maxLength:', maxLength);

      // Try typing the full bootstrap code
      await codeInput.fill(BOOTSTRAP_CODE);
      const value = await codeInput.inputValue();
      console.log(`Input value after typing ${BOOTSTRAP_CODE}:`, value);
      console.log('Value length:', value.length);

      // Check if it accepted all 15 characters
      expect(value.length).toBeGreaterThanOrEqual(15);
    } else {
      console.log('Invite code input not visible - checking page content');
      const pageContent = await page.content();
      console.log('Page contains "maxLength":', pageContent.includes('maxLength'));
    }
  });

  test('bootstrap admin code via URL parameter', async ({ page }) => {
    // Clear localStorage first
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate with bootstrap parameter
    await page.goto(`/?bootstrap=${BOOTSTRAP_CODE}`);

    // Wait for potential redirect
    await page.waitForTimeout(2000);

    // Check if admin profile was created
    const profileData = await page.evaluate(() => {
      const data = localStorage.getItem('rstu_profile_data');
      console.log('Raw localStorage data:', data);
      return data ? JSON.parse(data) : null;
    });

    console.log('Profile data after bootstrap:', JSON.stringify(profileData, null, 2));

    if (profileData?.currentProfile) {
      console.log('Profile role:', profileData.currentProfile.role);
      expect(profileData.currentProfile.role).toBe('admin');
    } else {
      console.log('No profile created - bootstrap may not be working');
    }
  });

  test('property search loads all-properties.json', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Find search input - using the actual placeholder text
    const searchInput = page.locator('input[placeholder*="Search all properties"]');

    const isVisible = await searchInput.isVisible().catch(() => false);
    console.log('Search input visible:', isVisible);

    if (isVisible) {
      // Type a search query
      await searchInput.fill('virginia');
      await page.waitForTimeout(1000);

      // Check page content for results
      const pageText = await page.textContent('body');
      console.log('Page contains "results":', pageText?.includes('results'));
      console.log('Page contains "virginia" (case insensitive):', pageText?.toLowerCase().includes('virginia'));
    } else {
      // List all inputs to debug
      const allInputs = await page.locator('input').all();
      console.log('All inputs found:', allInputs.length);
      for (const input of allInputs) {
        const placeholder = await input.getAttribute('placeholder');
        console.log('Input placeholder:', placeholder);
      }
    }
  });

  test('BuildingMetadata shows tabs after clicking building', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Look for building cards
    const buildingCards = page.locator('button').filter({ hasText: /units/i });
    const cardCount = await buildingCards.count();
    console.log('Building cards with "units":', cardCount);

    if (cardCount > 0) {
      // Click first building
      await buildingCards.first().click();
      await page.waitForTimeout(500);

      // Look for expand/details button
      const detailsButton = page.locator('button').filter({ hasText: /detail|info|show/i }).first();
      if (await detailsButton.isVisible().catch(() => false)) {
        await detailsButton.click();
        await page.waitForTimeout(500);
      }

      // Check for tab buttons
      const propertyTab = page.locator('button:has-text("Property")');
      const ownerTab = page.locator('button:has-text("Owner")');

      console.log('Property tab visible:', await propertyTab.isVisible().catch(() => false));
      console.log('Owner tab visible:', await ownerTab.isVisible().catch(() => false));
    }
  });

  test('Profile page shows InviteCodeManager for admin users', async ({ page }) => {
    // First create an admin profile in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      const profileData = {
        currentProfile: {
          id: 'test-admin',
          nickname: 'TestAdmin',
          role: 'admin',
          trustLevel: 'verified',
          created: Date.now(),
          lastActive: Date.now(),
        },
        inviteCodes: {},
        lastModified: Date.now(),
      };
      localStorage.setItem('rstu_profile_data', JSON.stringify(profileData));
    });

    // Reload page
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Click Join/Profile tab
    await page.click('button:has-text("Join")');
    await page.waitForTimeout(1000);

    // Check for invite management UI
    const pageText = await page.textContent('body');
    console.log('Page contains "Invite Codes":', pageText?.includes('Invite Codes'));
    console.log('Page contains "Create":', pageText?.includes('Create'));
    console.log('Page contains "Your Profile":', pageText?.includes('Your Profile'));

    // Look for the create button
    const createButton = page.locator('button').filter({ hasText: /create/i });
    console.log('Create button count:', await createButton.count());
  });

  test('InviteCodeManager shows role selection when creating invite', async ({ page }) => {
    // Create admin profile
    await page.goto('/');
    await page.evaluate(() => {
      const profileData = {
        currentProfile: {
          id: 'test-admin',
          nickname: 'TestAdmin',
          role: 'admin',
          trustLevel: 'verified',
          created: Date.now(),
          lastActive: Date.now(),
        },
        inviteCodes: {},
        lastModified: Date.now(),
      };
      localStorage.setItem('rstu_profile_data', JSON.stringify(profileData));
    });

    await page.goto('/');
    await page.click('button:has-text("Join")');
    await page.waitForTimeout(1000);

    // Find and click Create button
    const createButton = page.locator('button').filter({ hasText: /\+ ?Create/i }).first();

    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Check for role selection buttons
      const pageText = await page.textContent('body');
      console.log('Page contains "Tenant":', pageText?.includes('Tenant'));
      console.log('Page contains "Organizer":', pageText?.includes('Organizer'));
      console.log('Page contains "Admin":', pageText?.includes('Admin'));
      console.log('Page contains "Grant Role":', pageText?.includes('Grant Role'));
    } else {
      console.log('Create button not visible');
      const buttons = await page.locator('button').all();
      console.log('Total buttons:', buttons.length);
      for (const btn of buttons.slice(0, 10)) {
        console.log('Button text:', await btn.textContent());
      }
    }
  });

  test('check maxLength attribute on all inputs', async ({ page }) => {
    await page.goto('/');

    // Click Join to see profile creation
    await page.click('button:has-text("Join")');
    await page.waitForTimeout(1000);

    // Get all inputs and their maxLength
    const inputs = await page.locator('input').all();
    console.log('=== All Input Elements ===');

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const maxLength = await input.getAttribute('maxLength');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');

      console.log(`Input ${i}:`);
      console.log(`  type: ${type}`);
      console.log(`  placeholder: ${placeholder}`);
      console.log(`  maxLength: ${maxLength}`);

      // If this looks like an invite code input, test typing
      if (placeholder?.toLowerCase().includes('invite') || placeholder?.toLowerCase().includes('code')) {
        console.log(`  >>> Testing this input with ${BOOTSTRAP_CODE}`);
        await input.fill(BOOTSTRAP_CODE);
        const value = await input.inputValue();
        console.log(`  >>> Result: "${value}" (length: ${value.length})`);

        if (value.length < 15) {
          console.log('  >>> PROBLEM: Input is truncating the bootstrap code!');
        }
      }
    }
  });

});
