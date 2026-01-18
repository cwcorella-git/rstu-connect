const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  
  try {
    await page.goto('http://localhost:3000/rstu-connect');
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: '/tmp/s1-landing.png' });
    console.log('Screenshot 1: Landing');
    
    // Click "I Rent" button on landing page
    const iRentBtn = await page.locator('button:has-text("I Rent")').first();
    if (await iRentBtn.count() > 0) {
      await iRentBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: '/tmp/s2-after-irent.png' });
    console.log('Screenshot 2: After I Rent');
    
    // Try clicking Reading in the nav
    await page.click('text=Reading', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: '/tmp/s3-reading.png' });
    console.log('Screenshot 3: Reading');
    
    // Click on any document that looks like it has content
    const docBtns = await page.locator('button[class*="text-left"]');
    if (await docBtns.count() > 0) {
      await docBtns.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/s4-document.png' });
      console.log('Screenshot 4: Document');
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
  console.log('Done!');
})();
