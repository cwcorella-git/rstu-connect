const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3001/rstu-connect';
  const screenshotDir = '/home/user/Projects/rstu-connect/site-review';

  console.log('=== Testing Mobile Layout Fix ===\n');

  // 1. Mobile view - default (list view)
  console.log('1. Testing mobile view - list tab...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/mobile-fix-01-list.png`, fullPage: true });

  // Check for mobile toggle buttons
  const toggleButtons = await page.$$('button');
  console.log(`   Found ${toggleButtons.length} buttons`);

  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  console.log(`   Horizontal overflow: ${hasOverflow ? 'YES (still broken)' : 'NO (fixed!)'}`);

  // Get visible text to confirm we're seeing the list
  const visibleText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log(`   Content preview: ${visibleText.slice(0, 200).replace(/\n/g, ' ')}`);

  // 2. Click on Chat tab
  console.log('\n2. Testing mobile view - chat tab...');
  try {
    await page.click('button:has-text("Chat")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/mobile-fix-02-chat.png`, fullPage: true });
    console.log('   Clicked Chat tab successfully');
  } catch (e) {
    console.log(`   Could not click Chat tab: ${e.message}`);
  }

  // 3. Click back to Buildings tab
  console.log('\n3. Testing mobile view - back to list...');
  try {
    await page.click('button:has-text("Buildings")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotDir}/mobile-fix-03-back-to-list.png`, fullPage: true });
    console.log('   Clicked Buildings tab successfully');
  } catch (e) {
    console.log(`   Could not click Buildings tab: ${e.message}`);
  }

  // 4. Click on a building to auto-switch to chat
  console.log('\n4. Testing auto-switch to chat on building click...');
  try {
    // Find and click a building card
    const buildingCards = await page.$$('li, [class*="cursor-pointer"]');
    if (buildingCards.length > 0) {
      await buildingCards[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotDir}/mobile-fix-04-after-building-click.png`, fullPage: true });
      console.log('   Clicked building, should auto-switch to chat');
    }
  } catch (e) {
    console.log(`   Could not click building: ${e.message}`);
  }

  // 5. Desktop view for comparison
  console.log('\n5. Testing desktop view (should show both panels)...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screenshotDir}/mobile-fix-05-desktop.png`, fullPage: true });

  // Check that toggle is hidden on desktop
  const toggleVisible = await page.evaluate(() => {
    const toggleDiv = document.querySelector('.md\\:hidden');
    if (!toggleDiv) return 'no toggle div found';
    const style = window.getComputedStyle(toggleDiv);
    return style.display === 'none' ? 'hidden (correct)' : `visible: ${style.display}`;
  });
  console.log(`   Mobile toggle on desktop: ${toggleVisible}`);

  // 6. Tablet view
  console.log('\n6. Testing tablet view (768px)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/mobile-fix-06-tablet.png`, fullPage: true });

  await browser.close();

  console.log('\n=== Test Complete ===');
  console.log('Screenshots saved:');
  console.log('  - mobile-fix-01-list.png');
  console.log('  - mobile-fix-02-chat.png');
  console.log('  - mobile-fix-03-back-to-list.png');
  console.log('  - mobile-fix-04-after-building-click.png');
  console.log('  - mobile-fix-05-desktop.png');
  console.log('  - mobile-fix-06-tablet.png');
})();
