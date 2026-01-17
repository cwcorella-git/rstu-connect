const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // First, create an admin profile and generate an invite code
  console.log('Setting up admin profile and invite code...');

  await page.goto('http://localhost:3000/rstu-connect/');
  await page.waitForLoadState('networkidle');

  // Set up an admin profile in localStorage
  const adminProfile = {
    currentProfile: {
      id: 'admin-test-123',
      nickname: 'TestAdmin',
      email: 'admin@test.com',
      role: 'admin',
      trustLevel: 'verified',
      created: Date.now(),
      lastActive: Date.now()
    },
    storedProfiles: [],
    inviteCodes: {},
    lastModified: Date.now()
  };

  // Create an invite code
  const inviteCode = 'TEST' + Math.random().toString(36).substring(2, 5).toUpperCase();
  adminProfile.inviteCodes[inviteCode] = {
    code: inviteCode,
    createdBy: 'admin-test-123',
    createdAt: Date.now(),
    maxUses: 10,
    usedCount: 0,
    usedBy: [],
    grantRole: 'tenant',
    expires: 0,
    revoked: false
  };

  await page.evaluate((data) => {
    localStorage.setItem('rstu_profile_data', JSON.stringify(data.profile));
  }, { profile: adminProfile });

  console.log(`Created invite code: ${inviteCode}`);

  // Now open a NEW context (simulating a different user/device)
  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();

  // Enable console logging
  newPage.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Profile') || msg.text().includes('Supabase')) {
      console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
    }
  });

  // Navigate with invite code
  const signupUrl = `http://localhost:3000/rstu-connect/?invite=${inviteCode}`;
  console.log(`\nNavigating to: ${signupUrl}`);

  await newPage.goto(signupUrl);
  await newPage.waitForLoadState('networkidle');

  // Take screenshot of initial state
  await newPage.screenshot({ path: 'signup-1-initial.png', fullPage: true });
  console.log('Screenshot saved: signup-1-initial.png');

  // Wait for the page to load and check what tab we're on
  await newPage.waitForTimeout(2000);

  // Check if we see the onboarding wizard
  const wizardVisible = await newPage.locator('text=Join RSTU Connect').isVisible().catch(() => false);
  console.log(`Onboarding wizard visible: ${wizardVisible}`);

  if (!wizardVisible) {
    // Maybe we need to click on Profile tab
    const profileTab = await newPage.locator('text=Profile').first();
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await newPage.waitForTimeout(1000);
    }
  }

  await newPage.screenshot({ path: 'signup-2-after-nav.png', fullPage: true });
  console.log('Screenshot saved: signup-2-after-nav.png');

  // Check if invite code input is visible
  const inviteInput = await newPage.locator('input[placeholder*="invite"]').first();
  const hasInviteInput = await inviteInput.isVisible().catch(() => false);
  console.log(`Invite code input visible: ${hasInviteInput}`);

  // Check for "Check" button to validate invite
  const checkButton = await newPage.locator('button:has-text("Check")').first();
  const hasCheckButton = await checkButton.isVisible().catch(() => false);
  console.log(`Check button visible: ${hasCheckButton}`);

  if (hasCheckButton) {
    console.log('\nClicking Check button to validate invite...');
    await checkButton.click();
    await newPage.waitForTimeout(3000);

    await newPage.screenshot({ path: 'signup-3-after-check.png', fullPage: true });
    console.log('Screenshot saved: signup-3-after-check.png');
  }

  // Look for Next/Continue button
  const nextButton = await newPage.locator('button:has-text("Next"), button:has-text("Continue")').first();
  const hasNextButton = await nextButton.isVisible().catch(() => false);
  console.log(`Next/Continue button visible: ${hasNextButton}`);

  if (hasNextButton) {
    console.log('\nClicking Next to proceed...');
    await nextButton.click();
    await newPage.waitForTimeout(2000);

    await newPage.screenshot({ path: 'signup-4-step2.png', fullPage: true });
    console.log('Screenshot saved: signup-4-step2.png');

    // Fill in nickname and email
    const nicknameInput = await newPage.locator('input[placeholder*="nickname"], input[name="nickname"]').first();
    if (await nicknameInput.isVisible()) {
      await nicknameInput.fill('TestUser' + Date.now().toString().slice(-4));
      console.log('Filled nickname');
    }

    const emailInput = await newPage.locator('input[type="email"], input[placeholder*="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(`test${Date.now()}@example.com`);
      console.log('Filled email');
    }

    await newPage.waitForTimeout(1500);
    await newPage.screenshot({ path: 'signup-5-identity-filled.png', fullPage: true });
    console.log('Screenshot saved: signup-5-identity-filled.png');

    // Click Next again
    const nextButton2 = await newPage.locator('button:has-text("Next")').first();
    if (await nextButton2.isVisible() && await nextButton2.isEnabled()) {
      console.log('\nClicking Next to Step 3 (Building)...');
      await nextButton2.click();
      await newPage.waitForTimeout(2000);

      await newPage.screenshot({ path: 'signup-6-building.png', fullPage: true });
      console.log('Screenshot saved: signup-6-building.png');

      // Skip building selection, click Next/Skip
      const skipButton = await newPage.locator('button:has-text("Skip"), button:has-text("Next")').first();
      if (await skipButton.isVisible()) {
        await skipButton.click();
        await newPage.waitForTimeout(2000);

        await newPage.screenshot({ path: 'signup-7-household.png', fullPage: true });
        console.log('Screenshot saved: signup-7-household.png');

        // Skip household, click Next/Skip
        const skipButton2 = await newPage.locator('button:has-text("Skip"), button:has-text("Next")').first();
        if (await skipButton2.isVisible()) {
          await skipButton2.click();
          await newPage.waitForTimeout(2000);

          await newPage.screenshot({ path: 'signup-8-review.png', fullPage: true });
          console.log('Screenshot saved: signup-8-review.png');

          // Now click "Create Profile"
          const createButton = await newPage.locator('button:has-text("Create Profile")').first();
          if (await createButton.isVisible()) {
            console.log('\n=== CRITICAL TEST: Clicking Create Profile ===');
            const startTime = Date.now();

            await createButton.click();

            // Monitor for up to 35 seconds (past the 30 second timeout)
            for (let i = 0; i < 35; i++) {
              await newPage.waitForTimeout(1000);
              const elapsed = Math.round((Date.now() - startTime) / 1000);

              // Check for loading state
              const isLoading = await newPage.locator('text=Creating...').isVisible().catch(() => false);
              const hasError = await newPage.locator('.text-red-600, .text-red-500, [role="alert"]').first().isVisible().catch(() => false);
              const profileCreated = await newPage.locator('text=Welcome').isVisible().catch(() => false);

              console.log(`[${elapsed}s] Loading: ${isLoading}, Error: ${hasError}, Success: ${profileCreated}`);

              if (!isLoading || hasError || profileCreated) {
                await newPage.screenshot({ path: `signup-9-result-${elapsed}s.png`, fullPage: true });
                console.log(`Screenshot saved: signup-9-result-${elapsed}s.png`);

                if (hasError) {
                  const errorText = await newPage.locator('.text-red-600, .text-red-500').first().textContent().catch(() => 'Unknown error');
                  console.log(`ERROR: ${errorText}`);
                }
                break;
              }

              if (i === 30) {
                console.log('\n!!! TIMEOUT: Still loading after 30 seconds !!!');
                await newPage.screenshot({ path: 'signup-TIMEOUT.png', fullPage: true });
              }
            }
          }
        }
      }
    }
  }

  console.log('\n=== Test Complete ===');
  await browser.close();
})().catch(console.error);
