const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'https://rstu-connect.neocities.org';
  const screenshotDir = '/home/user/Projects/rstu-connect/site-review';

  console.log('=== RSTU Connect Site Review ===\n');

  // 1. Desktop view - Homepage
  console.log('1. Loading page...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check for iframe
  const iframe = await page.$('iframe#app-frame');
  if (iframe) {
    console.log('   Site uses an iframe to load content');
    const iframeSrc = await iframe.getAttribute('src');
    console.log(`   Iframe src: ${iframeSrc}`);

    // Try to get the frame content
    const frames = page.frames();
    console.log(`   Total frames: ${frames.length}`);

    for (const frame of frames) {
      const frameUrl = frame.url();
      console.log(`   Frame URL: ${frameUrl}`);
    }

    // If iframe src is available, go directly to it
    if (iframeSrc) {
      console.log(`\n   Navigating directly to iframe content: ${iframeSrc}`);
      await page.goto(iframeSrc, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
    }
  }

  // Now analyze the actual content
  console.log('\n2. Analyzing page content...');
  await page.screenshot({ path: `${screenshotDir}/01-desktop-homepage.png`, fullPage: true });

  const title = await page.title();
  console.log(`   Title: ${title}`);

  // Get body content
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log(`   Body HTML length: ${bodyHTML.length} chars`);

  // Get visible text
  const visibleText = await page.evaluate(() => document.body.innerText);
  console.log('\n   Visible text preview:');
  console.log('   ---');
  const textLines = visibleText.split('\n').filter(l => l.trim()).slice(0, 30);
  textLines.forEach(l => console.log(`   ${l}`));
  console.log('   ---');

  // Get all links
  const navLinks = await page.$$eval('a[href]', links =>
    links.map(l => ({ text: l.textContent?.trim() || '', href: l.href })).filter(l => l.text)
  );
  console.log(`\n   Links found: ${navLinks.length}`);
  navLinks.slice(0, 20).forEach(l => console.log(`     - "${l.text}": ${l.href}`));

  // Element counts
  const tagCounts = await page.evaluate(() => {
    const counts = {};
    document.querySelectorAll('*').forEach(el => {
      const tag = el.tagName.toLowerCase();
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  });
  console.log('\n   Element counts (top 20):');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([tag, count]) => console.log(`     ${tag}: ${count}`));

  // 3. Check for specific components
  console.log('\n3. Component analysis...');

  const componentChecks = {
    'header': 'header, [class*="header"], [class*="Header"]',
    'navigation': 'nav, [class*="nav"], [class*="Nav"]',
    'main content': 'main, [class*="main"], [class*="Main"]',
    'footer': 'footer, [class*="footer"], [class*="Footer"]',
    'sidebar': 'aside, [class*="sidebar"], [class*="Sidebar"]',
    'building list': '[class*="building"], [class*="Building"], [class*="property"]',
    'building cards': '[class*="card"], [class*="Card"]',
    'chat area': '[class*="chat"], [class*="Chat"]',
    'message list': '[class*="message"], [class*="Message"]',
    'search input': 'input[type="search"], [class*="search"], [class*="Search"]',
    'buttons': 'button, [role="button"]',
    'form inputs': 'input, textarea',
    'forms': 'form'
  };

  for (const [name, selector] of Object.entries(componentChecks)) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      console.log(`   ✓ ${name}: ${elements.length} element(s)`);
    } else {
      console.log(`   ✗ ${name}: not found`);
    }
  }

  // 4. Get all CSS classes
  console.log('\n4. CSS classes found...');
  const allClasses = await page.evaluate(() => {
    const classes = new Set();
    document.querySelectorAll('*').forEach(el => {
      if (el.className && typeof el.className === 'string') {
        el.className.split(' ').forEach(c => {
          if (c && !c.startsWith('_')) classes.add(c);
        });
      }
    });
    return Array.from(classes).sort();
  });
  console.log(`   Total unique classes: ${allClasses.length}`);

  // Show key class matches
  const keyTerms = ['build', 'chat', 'message', 'card', 'list', 'nav', 'header', 'footer', 'search', 'input', 'button', 'panel', 'sidebar', 'main', 'container', 'flex', 'grid', 'bg-', 'text-', 'hover', 'p-', 'm-', 'w-', 'h-'];
  console.log('   Key class patterns:');
  keyTerms.forEach(term => {
    const matches = allClasses.filter(c => c.toLowerCase().includes(term.toLowerCase()));
    if (matches.length > 0 && matches.length < 20) {
      console.log(`     "${term}": ${matches.slice(0, 10).join(', ')}${matches.length > 10 ? '...' : ''}`);
    } else if (matches.length >= 20) {
      console.log(`     "${term}": ${matches.length} classes (Tailwind utility)`);
    }
  });

  // 5. DOM structure
  console.log('\n5. DOM structure outline...');
  const structure = await page.evaluate(() => {
    function getOutline(el, depth = 0) {
      if (depth > 5) return '';
      const tag = el.tagName?.toLowerCase();
      if (!tag || ['script', 'style', 'svg', 'path', 'noscript', 'link'].includes(tag)) return '';

      const id = el.id ? `#${el.id}` : '';
      const cls = el.className && typeof el.className === 'string'
        ? '.' + el.className.split(' ').filter(c => c && !c.match(/^(p|m|w|h|text|bg|border|rounded|flex|grid|gap|space|min|max)-/)).slice(0, 3).join('.')
        : '';

      const indent = '  '.repeat(depth);
      let result = `${indent}<${tag}${id}${cls}>\n`;

      const importantTags = ['header', 'nav', 'main', 'aside', 'section', 'footer', 'div', 'article', 'ul', 'form'];
      if (importantTags.includes(tag) || depth < 3) {
        for (const child of el.children) {
          result += getOutline(child, depth + 1);
        }
      }
      return result;
    }
    return getOutline(document.body);
  });
  console.log(structure.slice(0, 5000));

  // 6. Interactive elements detail
  console.log('\n6. Interactive elements detail...');

  const buttons = await page.$$eval('button', btns =>
    btns.map(b => ({
      text: b.textContent?.trim(),
      className: b.className?.split(' ').slice(0, 3).join(' ')
    })).filter(b => b.text)
  );
  if (buttons.length > 0) {
    console.log('   Buttons:');
    buttons.slice(0, 10).forEach(b => console.log(`     - "${b.text}" (${b.className})`));
  }

  const inputs = await page.$$eval('input, textarea', els =>
    els.map(el => ({
      type: el.type || 'textarea',
      placeholder: el.placeholder,
      className: el.className?.split(' ').slice(0, 3).join(' ')
    }))
  );
  if (inputs.length > 0) {
    console.log('   Inputs:');
    inputs.slice(0, 10).forEach(i => console.log(`     - ${i.type}: "${i.placeholder || 'no placeholder'}" (${i.className})`));
  }

  // 7. Mobile view
  console.log('\n7. Capturing mobile view (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/02-mobile-homepage.png`, fullPage: true });

  // Check for responsive issues
  const mobileOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  console.log(`   Horizontal overflow on mobile: ${mobileOverflow ? 'YES (problem!)' : 'No'}`);

  // 8. Tablet view
  console.log('8. Capturing tablet view (768x1024)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/03-tablet-homepage.png`, fullPage: true });

  // 9. Wide desktop
  console.log('9. Capturing wide desktop view (1920x1080)...');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${screenshotDir}/04-wide-desktop.png`, fullPage: true });

  // 10. Layout metrics
  console.log('\n10. Layout metrics...');
  await page.setViewportSize({ width: 1440, height: 900 });

  const layoutMetrics = await page.evaluate(() => {
    const results = {};

    // Find main containers
    const containers = document.querySelectorAll('main, [class*="container"], [class*="wrapper"], #__next > div');
    containers.forEach((el, i) => {
      if (i < 5) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        results[`container_${i}`] = {
          tag: el.tagName,
          className: el.className?.split(' ').slice(0, 2).join(' '),
          width: rect.width,
          height: rect.height,
          display: style.display,
          flexDirection: style.flexDirection
        };
      }
    });

    // Check for two-column layout
    const flexContainers = document.querySelectorAll('[class*="flex"]');
    results.flexContainers = flexContainers.length;

    // Check grid containers
    const gridContainers = document.querySelectorAll('[class*="grid"]');
    results.gridContainers = gridContainers.length;

    return results;
  });

  console.log('   Container metrics:');
  Object.entries(layoutMetrics).forEach(([key, val]) => {
    if (typeof val === 'object') {
      console.log(`     ${key}: ${val.tag}.${val.className} - ${val.width}x${val.height} (${val.display} ${val.flexDirection || ''})`);
    } else {
      console.log(`     ${key}: ${val}`);
    }
  });

  // 11. Try clicking on a building to see chat interaction
  console.log('\n11. Testing interactions...');
  const clickableCards = await page.$$('[class*="cursor-pointer"], [class*="hover"], button, [role="button"]');
  console.log(`   Clickable elements found: ${clickableCards.length}`);

  if (clickableCards.length > 0) {
    console.log('   Attempting to click first interactive element...');
    try {
      await clickableCards[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screenshotDir}/05-after-click.png`, fullPage: true });
      console.log('   Screenshot after click saved');
    } catch (e) {
      console.log(`   Click failed: ${e.message}`);
    }
  }

  await browser.close();

  console.log('\n=== Review Complete ===');
  console.log(`Screenshots saved to: ${screenshotDir}/`);
  console.log('\nScreenshots:');
  console.log('  - 01-desktop-homepage.png');
  console.log('  - 02-mobile-homepage.png');
  console.log('  - 03-tablet-homepage.png');
  console.log('  - 04-wide-desktop.png');
  console.log('  - 05-after-click.png');
})();
