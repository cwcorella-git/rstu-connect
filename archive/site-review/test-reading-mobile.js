const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3001/rstu-connect';
  const screenshotDir = '/home/user/Projects/rstu-connect/site-review';

  console.log('=== Testing Reading Page Mobile Layout ===\n');

  // 1. Go to page - mobile view
  console.log('1. Loading page on mobile...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 2. Click Reading in nav
  console.log('2. Switching to Reading tab...');
  try {
    await page.click('nav button:has-text("Reading")');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('   Failed to click nav Reading button, trying alternative...');
    await page.click('text=Reading');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: `${screenshotDir}/reading-mobile-01-list.png`, fullPage: true });

  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  console.log(`   Horizontal overflow: ${hasOverflow ? 'YES (problem!)' : 'NO (fixed!)'}`);

  // Check for mobile toggle
  const toggleButtons = await page.$$eval('button', btns =>
    btns.map(b => b.textContent).filter(t => t && (t.includes('Documents') || t.includes('Reader')))
  );
  console.log(`   Mobile toggle buttons: ${toggleButtons.length > 0 ? toggleButtons.join(', ') : 'NOT FOUND'}`);

  // Get visible content
  const visibleText = await page.evaluate(() => document.body.innerText.slice(0, 600));
  console.log('   Content preview (first 300 chars):');
  console.log('   ' + visibleText.slice(0, 300).replace(/\n+/g, ' | '));

  // 3. Click Reader tab
  console.log('\n3. Switching to Reader view...');
  try {
    await page.click('button:has-text("Reader")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/reading-mobile-02-reader.png`, fullPage: true });
    console.log('   Switched to Reader view');
  } catch (e) {
    console.log(`   Could not click Reader tab: ${e.message}`);
  }

  // 4. Click back to Documents
  console.log('\n4. Switching back to Documents...');
  try {
    await page.click('button:has-text("Documents")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotDir}/reading-mobile-03-back.png`, fullPage: true });
    console.log('   Switched back to Documents');
  } catch (e) {
    console.log(`   Could not click Documents tab: ${e.message}`);
  }

  // 5. Click a document to test auto-switch
  console.log('\n5. Testing document click auto-switch...');
  try {
    // Look for document items
    const docItems = await page.$$('li[class*="cursor"], [class*="hover:bg"]');
    console.log(`   Found ${docItems.length} potential document items`);
    if (docItems.length > 3) {
      await docItems[3].click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${screenshotDir}/reading-mobile-04-after-doc-click.png`, fullPage: true });
      console.log('   Clicked document, should auto-switch to Reader');
    }
  } catch (e) {
    console.log(`   Could not click document: ${e.message}`);
  }

  // 6. Desktop view for comparison
  console.log('\n6. Capturing desktop Reading view...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/reading-desktop.png`, fullPage: true });

  // Check that toggle is hidden on desktop
  const toggleHidden = await page.evaluate(() => {
    const toggle = document.querySelector('.md\\:hidden');
    if (!toggle) return 'no toggle found';
    return window.getComputedStyle(toggle).display === 'none' ? 'hidden (correct)' : 'visible';
  });
  console.log(`   Mobile toggle on desktop: ${toggleHidden}`);

  await browser.close();

  console.log('\n=== Test Complete ===');
  console.log('Screenshots:');
  console.log('  - reading-mobile-01-list.png');
  console.log('  - reading-mobile-02-reader.png');
  console.log('  - reading-mobile-03-back.png');
  console.log('  - reading-mobile-04-after-doc-click.png');
  console.log('  - reading-desktop.png');
})();
