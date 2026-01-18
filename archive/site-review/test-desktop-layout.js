const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3001/rstu-connect';
  const screenshotDir = '/home/user/Projects/rstu-connect/site-review';

  console.log('=== Testing Desktop Layout Fix ===\n');

  // Desktop view
  console.log('1. Loading desktop view...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: `${screenshotDir}/desktop-layout-fix.png`, fullPage: false });

  // Check if search is visible
  const searchVisible = await page.$eval('input[placeholder*="Search"]', el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }).catch(() => false);
  console.log(`   Search input visible: ${searchVisible ? 'YES' : 'NO'}`);

  // Check if chat header is visible
  const chatHeaderVisible = await page.$eval('h2', el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }).catch(() => false);
  console.log(`   Chat header visible: ${chatHeaderVisible ? 'YES' : 'NO'}`);

  // Check if message input is visible
  const inputVisible = await page.$eval('input[placeholder*="message"], input[placeholder*="Connecting"]', el => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  }).catch(() => false);
  console.log(`   Message input visible: ${inputVisible ? 'YES' : 'NO'}`);

  // Get layout info
  const layoutInfo = await page.evaluate(() => {
    const container = document.querySelector('[style*="calc(100vh"]');
    const leftPanel = container?.querySelector('div:first-of-type');
    const rightPanel = container?.querySelector('div:last-of-type');

    return {
      containerHeight: container?.getBoundingClientRect().height,
      leftPanelHeight: leftPanel?.getBoundingClientRect().height,
      rightPanelHeight: rightPanel?.getBoundingClientRect().height,
      viewportHeight: window.innerHeight
    };
  });
  console.log('\n   Layout metrics:');
  console.log(`   Container height: ${layoutInfo.containerHeight}`);
  console.log(`   Left panel height: ${layoutInfo.leftPanelHeight}`);
  console.log(`   Right panel height: ${layoutInfo.rightPanelHeight}`);
  console.log(`   Viewport height: ${layoutInfo.viewportHeight}`);

  await browser.close();

  console.log('\n=== Test Complete ===');
  console.log('Screenshot: desktop-layout-fix.png');
})();
