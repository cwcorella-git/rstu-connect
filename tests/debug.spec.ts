import { test, expect } from '@playwright/test';

// Bootstrap code for tests - read from environment variable
const BOOTSTRAP_CODE = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_CODE || 'TEST-BOOTSTRAP-CODE';

test('debug - examine live site with iframe', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(5000); // Wait for iframe to load

  console.log('=== Page loaded ===');
  console.log('URL:', page.url());

  // Check for iframe
  const iframeElement = page.locator('iframe#app-frame');
  const iframeExists = await iframeElement.count() > 0;
  console.log('Iframe exists:', iframeExists);

  if (iframeExists) {
    const iframeSrc = await iframeElement.getAttribute('src');
    console.log('Iframe src:', iframeSrc);

    // Get the frame
    const frame = page.frameLocator('#app-frame');

    // Get all buttons in the iframe
    const buttons = await frame.locator('button').all();
    console.log('\n=== Buttons in iframe ===');
    console.log('Count:', buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`Button ${i}: visible=${isVisible}, text="${text?.trim().substring(0, 50)}"`);
    }

    // Get all inputs in the iframe
    const inputs = await frame.locator('input').all();
    console.log('\n=== Inputs in iframe ===');
    console.log('Count:', inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const maxLength = await inputs[i].getAttribute('maxLength');
      const isVisible = await inputs[i].isVisible();
      console.log(`Input ${i}: visible=${isVisible}, placeholder="${placeholder}", maxLength=${maxLength}`);
    }

    // Get nav items
    const navButtons = await frame.locator('nav button').all();
    console.log('\n=== Nav Buttons in iframe ===');
    for (const item of navButtons) {
      const text = await item.textContent();
      console.log(`Nav: "${text?.trim()}"`);
    }
  }
});

test('debug - click Join tab and check inputs', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(5000);

  const frame = page.frameLocator('#app-frame');

  // Click on Join button in nav
  console.log('Looking for Join button...');
  const joinButton = frame.locator('button:has-text("Join")');
  const joinCount = await joinButton.count();
  console.log('Join button count:', joinCount);

  if (joinCount > 0) {
    await joinButton.click();
    console.log('Clicked Join button');
    await page.waitForTimeout(2000);

    // Now check for inputs
    const inputs = await frame.locator('input').all();
    console.log('\n=== Inputs after clicking Join ===');
    console.log('Count:', inputs.length);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const maxLength = await input.getAttribute('maxLength');
      const isVisible = await input.isVisible();
      console.log(`Input ${i}: visible=${isVisible}, placeholder="${placeholder}", maxLength=${maxLength}`);

      // Test typing bootstrap code if this looks like invite input
      if (placeholder?.toLowerCase().includes('invite') || placeholder?.toLowerCase().includes('code')) {
        console.log(`  >>> Found invite/code input, testing with ${BOOTSTRAP_CODE}`);
        await input.fill(BOOTSTRAP_CODE);
        const value = await input.inputValue();
        console.log(`  >>> Result: "${value}" (length: ${value.length})`);

        if (value.length < 15) {
          console.log('  >>> PROBLEM: maxLength is truncating the bootstrap code!');
        } else {
          console.log('  >>> SUCCESS: Input accepts full bootstrap code');
        }
      }
    }
  } else {
    console.log('Join button not found');
  }
});

test('debug - test bootstrap URL param', async ({ page }) => {
  // Clear storage first
  await page.goto('/');
  await page.waitForTimeout(3000);

  const frame = page.frameLocator('#app-frame');

  // Clear localStorage in iframe context
  await frame.locator('body').evaluate(() => {
    localStorage.clear();
  }).catch(() => console.log('Could not clear localStorage'));

  // Now navigate with bootstrap param
  await page.goto(`/?bootstrap=${BOOTSTRAP_CODE}`);
  await page.waitForTimeout(5000);

  // Check localStorage
  const profileData = await frame.locator('body').evaluate(() => {
    return localStorage.getItem('rstu_profile_data');
  }).catch(() => null);

  console.log('Profile data from localStorage:', profileData);

  if (profileData) {
    const parsed = JSON.parse(profileData);
    console.log('Profile role:', parsed?.currentProfile?.role);
    console.log('Profile nickname:', parsed?.currentProfile?.nickname);
  } else {
    console.log('No profile data found - bootstrap may not have worked');
  }
});
