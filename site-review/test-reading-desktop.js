const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3001/rstu-connect';
  const screenshotDir = '/home/user/Projects/rstu-connect/site-review';

  console.log('=== Testing Reading Page Desktop Layout ===\n');

  // Desktop view
  console.log('1. Loading desktop view and switching to Reading...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click Reading tab
  await page.click('button:has-text("Reading")');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: `${screenshotDir}/reading-desktop-fix.png`, fullPage: false });

  // Check if document list fills the panel
  const listInfo = await page.evaluate(() => {
    const listContainer = document.querySelector('[class*="overflow-y-auto"]');
    const listItems = document.querySelectorAll('li');
    return {
      containerHeight: listContainer?.getBoundingClientRect().height || 0,
      itemCount: listItems.length,
      firstItemVisible: listItems[0]?.getBoundingClientRect().top > 0
    };
  });

  console.log(`   Document list container height: ${listInfo.containerHeight}px`);
  console.log(`   Document items visible: ${listInfo.itemCount}`);

  // Check panel heights
  const panelInfo = await page.evaluate(() => {
    const mainContainer = document.querySelector('[style*="calc(100vh"]');
    const panels = mainContainer?.querySelectorAll(':scope > div');
    return {
      containerHeight: mainContainer?.getBoundingClientRect().height,
      panelCount: panels?.length,
      panel1Height: panels?.[1]?.getBoundingClientRect().height, // Skip mobile toggle (index 0 is hidden)
      panel2Height: panels?.[2]?.getBoundingClientRect().height
    };
  });

  console.log(`   Main container height: ${panelInfo.containerHeight}px`);
  console.log(`   Left panel height: ${panelInfo.panel1Height}px`);
  console.log(`   Right panel height: ${panelInfo.panel2Height}px`);

  // Test resize handle
  console.log('\n2. Testing resize handle...');
  const resizeHandle = await page.$('.cursor-col-resize');
  if (resizeHandle) {
    console.log('   Resize handle found');
    const handleBox = await resizeHandle.boundingBox();
    console.log(`   Handle position: x=${handleBox?.x}, y=${handleBox?.y}, h=${handleBox?.height}`);
  } else {
    console.log('   Resize handle NOT found');
  }

  await browser.close();

  console.log('\n=== Test Complete ===');
  console.log('Screenshot: reading-desktop-fix.png');
})();
