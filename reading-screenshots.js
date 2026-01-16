const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  
  try {
    await page.goto('http://localhost:3000/rstu-connect');
    await page.waitForTimeout(3000);
    
    // Click "Enter" or similar to get past landing
    const enterBtn = await page.locator('button:has-text("Enter"), button:has-text("Start"), button:has-text("Continue")').first();
    if (await enterBtn.count() > 0) {
      await enterBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Go to Reading
    await page.locator('button:has-text("Reading")').first().click();
    await page.waitForTimeout(2000);
    
    // Expand Housing category
    await page.locator('button:has-text("Housing")').first().click();
    await page.waitForTimeout(1000);
    
    // Click on first housing document
    const housingDocs = await page.locator('button').filter({ hasText: /tenant|rent|eviction|lease/i });
    if (await housingDocs.count() > 0) {
      await housingDocs.first().click();
      await page.waitForTimeout(2000);
      
      // Scroll through document
      await page.screenshot({ path: '/tmp/doc-top.png' });
      console.log('Screenshot: Doc top');
      
      // Scroll to middle of content area
      await page.evaluate(() => {
        const containers = document.querySelectorAll('.overflow-y-auto');
        containers.forEach(c => {
          if (c.scrollHeight > c.clientHeight) {
            c.scrollTop = c.scrollHeight * 0.4;
          }
        });
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/doc-middle.png' });
      console.log('Screenshot: Doc middle');
      
      // Scroll more
      await page.evaluate(() => {
        const containers = document.querySelectorAll('.overflow-y-auto');
        containers.forEach(c => {
          if (c.scrollHeight > c.clientHeight) {
            c.scrollTop = c.scrollHeight * 0.8;
          }
        });
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/doc-bottom.png' });
      console.log('Screenshot: Doc bottom');
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
  console.log('Done!');
})();
