const { chromium } = require('playwright');

// Full signup flow test function
async function testFullSignupFlow(page) {
  // Step 1: Click Next after invite validation
  console.log('\n--- Step 2: Identity ---');
  const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  await nextButton.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'signup-flow-2-identity.png', fullPage: true });
  console.log('Screenshot: signup-flow-2-identity.png');

  // Fill nickname
  const nicknameInput = page.locator('input#nickname, input[placeholder*="call you" i]').first();
  if (await nicknameInput.isVisible().catch(() => false)) {
    const testNickname = 'TestUser' + Date.now().toString().slice(-4);
    await nicknameInput.fill(testNickname);
    console.log(`Filled nickname: ${testNickname}`);
  } else {
    console.log('>>> Nickname input not found!');
  }

  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    const testEmail = `test${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    console.log(`Filled email: ${testEmail}`);
  }

  await page.waitForTimeout(2000);

  // Wait for email validation
  for (let i = 0; i < 10; i++) {
    const nextEnabled = await nextButton.isEnabled().catch(() => false);
    console.log(`[${i}s] Next button enabled: ${nextEnabled}`);
    if (nextEnabled) break;
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'signup-flow-2b-identity-filled.png', fullPage: true });
  console.log('Screenshot: signup-flow-2b-identity-filled.png');

  // Click Next to step 3 (Building)
  console.log('\n--- Step 3: Building ---');
  if (await nextButton.isEnabled().catch(() => false)) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'signup-flow-3-building.png', fullPage: true });
    console.log('Screenshot: signup-flow-3-building.png');
  } else {
    console.log('>>> Cannot proceed: Next button not enabled after identity step');
    return;
  }

  // Click Skip to step 4 (Household)
  console.log('\n--- Step 4: Household ---');
  const skipButton = page.locator('button:has-text("Skip")').first();
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'signup-flow-4-household.png', fullPage: true });
    console.log('Screenshot: signup-flow-4-household.png');
  } else {
    // Try Next if Skip not available
    await nextButton.click();
    await page.waitForTimeout(1000);
  }

  // Click Skip to step 5 (Review)
  console.log('\n--- Step 5: Review ---');
  if (await skipButton.isVisible().catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'signup-flow-5-review.png', fullPage: true });
    console.log('Screenshot: signup-flow-5-review.png');
  }

  // Find and click Create Profile
  console.log('\n=== CRITICAL TEST: Create Profile ===');
  const createButton = page.locator('button:has-text("Create Profile")').first();
  if (await createButton.isVisible().catch(() => false)) {
    console.log('Clicking Create Profile...');
    const startTime = Date.now();

    await createButton.click();

    // Monitor for up to 40 seconds (past the 30 second timeout)
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      // Check for loading spinner
      const isLoading = await page.locator('text=Creating...').isVisible().catch(() => false);
      const spinnerVisible = await page.locator('svg.animate-spin').first().isVisible().catch(() => false);

      // Check for error
      const hasError = await page.locator('.bg-red-50, [role="alert"]').first().isVisible().catch(() => false);
      const errorText = hasError ? await page.locator('.text-red-700, .text-red-800').first().textContent().catch(() => '') : '';

      // Check for success
      const profileCreated = await page.locator('text=Profile Created').isVisible().catch(() => false);

      console.log(`[${elapsed}s] Loading: ${isLoading || spinnerVisible}, Error: ${hasError}, Success: ${profileCreated}`);

      if (hasError) {
        console.log(`   Error: ${errorText}`);
      }

      if (!(isLoading || spinnerVisible) || hasError || profileCreated) {
        await page.screenshot({ path: `signup-flow-6-result-${elapsed}s.png`, fullPage: true });
        console.log(`Screenshot: signup-flow-6-result-${elapsed}s.png`);

        if (profileCreated) {
          console.log('\n>>> SUCCESS: Profile created successfully!');
        } else if (hasError) {
          console.log(`\n>>> ERROR: ${errorText}`);
        }
        break;
      }

      if (i === 35) {
        console.log('\n!!! CRITICAL: Profile creation still loading after 35 seconds !!!');
        console.log('This confirms the bug: createProfileAsync has no effective timeout.');
        await page.screenshot({ path: 'signup-flow-TIMEOUT.png', fullPage: true });
      }
    }
  } else {
    console.log('>>> Create Profile button not found');
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== SIGNUP FLOW TEST ===\n');

  // Enable verbose console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('Supabase') || text.includes('invite') || text.includes('Profile')) {
      console.log(`[Console ${type}]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[Page Error]: ${err.message}`);
  });

  // First, navigate to the app and check Supabase status
  console.log('1. Checking Supabase configuration...');
  await page.goto('http://localhost:3000/rstu-connect/');
  await page.waitForLoadState('networkidle');

  // Check if Supabase is configured (based on environment variable presence)
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log(`Supabase env vars set: ${hasSupabaseUrl}`);

  // Create an admin profile with invite code in localStorage
  // This simulates an admin who already created an invite
  console.log('\n2. Setting up admin profile with invite code...');

  const inviteCode = 'TEST' + Math.random().toString(36).substring(2, 5).toUpperCase();

  // Create admin profile and invite code in localStorage
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
    inviteCodes: {
      [inviteCode]: {
        code: inviteCode,
        createdBy: 'admin-test-123',
        createdByName: 'TestAdmin',
        createdByRole: 'admin',
        createdAt: Date.now(),
        maxUses: 10,
        usedCount: 0,
        usedBy: [],
        grantRole: 'tenant',
        expires: 0,
        revoked: false
      }
    },
    lastModified: Date.now()
  };

  await page.evaluate((data) => {
    localStorage.setItem('rstu_profile_data', JSON.stringify(data.profile));
  }, { profile: adminProfile });

  console.log(`Created invite code: ${inviteCode}`);

  // Now simulate a NEW user by opening a new incognito context
  // But first, let's test with the SAME context to see if localStorage invite works
  console.log('\n3. Testing invite validation in SAME context (localStorage should work)...');

  // Clear current profile to simulate a new user (but keep invite codes)
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('rstu_profile_data') || '{}');
    data.currentProfile = null;
    localStorage.setItem('rstu_profile_data', JSON.stringify(data));
  });

  // Navigate with invite code
  const signupUrl = `http://localhost:3000/rstu-connect/?invite=${inviteCode}`;
  console.log(`Navigating to: ${signupUrl}`);

  await page.goto(signupUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'signup-1-initial.png', fullPage: true });
  console.log('Screenshot: signup-1-initial.png');

  // Check if we see the onboarding wizard
  let wizardVisible = await page.locator('text=Welcome').first().isVisible().catch(() => false);
  console.log(`Onboarding wizard visible: ${wizardVisible}`);

  // If wizard not visible, try clicking Profile tab
  if (!wizardVisible) {
    const profileTab = page.locator('button:has-text("Profile"), [data-tab="profile"]').first();
    if (await profileTab.isVisible().catch(() => false)) {
      console.log('Clicking Profile tab...');
      await profileTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'signup-1b-after-profile-click.png', fullPage: true });
      wizardVisible = await page.locator('text=Welcome').first().isVisible().catch(() => false);
      console.log(`Onboarding wizard visible after Profile click: ${wizardVisible}`);
    }
  }

  // Find the invite code input
  const inviteInput = page.locator('input[placeholder*="invite"]').first();
  const hasInviteInput = await inviteInput.isVisible().catch(() => false);
  console.log(`Invite code input visible: ${hasInviteInput}`);

  if (hasInviteInput) {
    // Check if invite code was auto-filled from URL
    const inputValue = await inviteInput.inputValue();
    console.log(`Invite input value: "${inputValue}"`);

    // Find the Check button
    const checkButton = page.locator('button:has-text("Check")').first();
    const hasCheckButton = await checkButton.isVisible().catch(() => false);
    console.log(`Check button visible: ${hasCheckButton}`);

    if (hasCheckButton) {
      console.log('\n4. Clicking Check button to validate invite...');
      const startTime = Date.now();

      // Check if button shows spinner (isValidating state)
      const checkButtonText = await checkButton.textContent();
      console.log(`Check button text: "${checkButtonText?.trim()}"`);

      await checkButton.click();

      // Monitor the validation process
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(1000);
        const elapsed = Math.round((Date.now() - startTime) / 1000);

        // Check for spinner in check button
        const isValidating = await checkButton.locator('svg.animate-spin').isVisible().catch(() => false);

        // Check for success message
        const successVisible = await page.locator('text=Invite code valid').isVisible().catch(() => false);

        // Check for error message
        const errorVisible = await page.locator('text=Invalid').isVisible().catch(() => false);
        const errorText = errorVisible ? await page.locator('.text-red-800').first().textContent().catch(() => '') : '';

        // Check if Next button is enabled
        const nextButton = page.locator('button:has-text("Next")').first();
        const nextVisible = await nextButton.isVisible().catch(() => false);
        const nextEnabled = nextVisible ? await nextButton.isEnabled().catch(() => false) : false;

        console.log(`[${elapsed}s] Validating: ${isValidating}, Success: ${successVisible}, Error: ${errorVisible}, NextEnabled: ${nextEnabled}`);

        if (errorVisible) {
          console.log(`   Error message: ${errorText}`);
        }

        if (!isValidating || successVisible || errorVisible) {
          // Wait a bit more for React state to propagate
          await page.waitForTimeout(500);

          // Re-check Next button after waiting
          const nextButtonFinal = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
          const nextEnabledFinal = await nextButtonFinal.isEnabled().catch(() => false);
          console.log(`[${elapsed}s] After wait - NextEnabled: ${nextEnabledFinal}`);

          await page.screenshot({ path: `signup-2-after-check-${elapsed}s.png`, fullPage: true });
          console.log(`Screenshot: signup-2-after-check-${elapsed}s.png`);

          if (successVisible && !nextEnabledFinal) {
            console.log('\n>>> BUG: Invite validated successfully but Next button is still disabled!');
            console.log('>>> This is likely a React state propagation issue.');
          }

          // If Next is enabled, continue to full signup flow
          if (nextEnabledFinal) {
            console.log('\n=== Continuing full signup flow ===');
            await testFullSignupFlow(page);
          }
          break;
        }

        if (i === 14) {
          console.log('\n!!! TIMEOUT: Still validating after 15 seconds !!!');
          console.log('This indicates Supabase is hanging without a timeout.');
          await page.screenshot({ path: 'signup-TIMEOUT.png', fullPage: true });
        }
      }
    }
  }

  // Now test with a NEW context (simulating different device)
  console.log('\n\n=== Testing with NEW browser context (simulating different device) ===');

  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();

  // Enable logging
  newPage.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('Supabase') || text.includes('invite') || text.includes('Profile')) {
      console.log(`[NewPage ${type}]: ${text}`);
    }
  });

  console.log('\n5. Navigating with invite code (new context, no localStorage)...');
  await newPage.goto(signupUrl);
  await newPage.waitForLoadState('networkidle');
  await newPage.waitForTimeout(1000);

  await newPage.screenshot({ path: 'signup-3-new-context.png', fullPage: true });
  console.log('Screenshot: signup-3-new-context.png');

  // Try clicking Profile tab if wizard not visible
  const newWizardVisible = await newPage.locator('text=Welcome').first().isVisible().catch(() => false);
  if (!newWizardVisible) {
    const profileTab = newPage.locator('button:has-text("Profile"), [data-tab="profile"]').first();
    if (await profileTab.isVisible().catch(() => false)) {
      console.log('Clicking Profile tab (new context)...');
      await profileTab.click();
      await newPage.waitForTimeout(1000);
    }
  }

  // Find and click Check button
  const newCheckButton = newPage.locator('button:has-text("Check")').first();
  const newHasCheckButton = await newCheckButton.isVisible().catch(() => false);

  if (newHasCheckButton) {
    console.log('\n6. Clicking Check button (new context - no local invite data)...');
    const startTime = Date.now();

    await newCheckButton.click();

    // Monitor the validation process
    for (let i = 0; i < 20; i++) {
      await newPage.waitForTimeout(1000);
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      // Check for spinner in check button
      const isValidating = await newCheckButton.locator('svg.animate-spin').isVisible().catch(() => false);

      // Check for success/error
      const successVisible = await newPage.locator('text=Invite code valid').isVisible().catch(() => false);
      const errorVisible = await newPage.locator('text=Invalid').isVisible().catch(() => false);

      console.log(`[${elapsed}s] Validating: ${isValidating}, Success: ${successVisible}, Error: ${errorVisible}`);

      if (!isValidating || successVisible || errorVisible) {
        await newPage.screenshot({ path: `signup-4-new-context-result-${elapsed}s.png`, fullPage: true });
        console.log(`Screenshot: signup-4-new-context-result-${elapsed}s.png`);

        if (errorVisible) {
          const errorText = await newPage.locator('.text-red-800').first().textContent().catch(() => 'Unknown error');
          console.log(`Error: ${errorText}`);
          console.log('\n>>> This is expected if Supabase doesn\'t have the invite code.');
          console.log('>>> Real users get stuck if Supabase hangs during validation.');
        }
        break;
      }

      if (i === 19) {
        console.log('\n!!! CRITICAL: Still spinning after 20 seconds !!!');
        console.log('This confirms the bug: Supabase calls have no timeout.');
        await newPage.screenshot({ path: 'signup-CRITICAL-TIMEOUT.png', fullPage: true });
      }
    }
  }

  console.log('\n=== Test Complete ===');
  await browser.close();
})().catch(console.error);
