const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = 'http://localhost:3000/rstu-connect'
const LOCALES = ['en', 'es', 'tl', 'zh', 'vi']
const OUT_DIR = path.join(__dirname, '..', 'audit-screenshots')

async function ensureProfile(page) {
  await page.evaluate(() => {
    const profile = {
      id: 'audit-user',
      nickname: 'Audit User',
      email: 'audit@test.com',
      role: 'admin',
      building: null,
      joinedAt: new Date().toISOString(),
      isVerified: true,
      inviteCode: 'ADMIN',
    }
    localStorage.setItem('rstu_profile_state', JSON.stringify({
      currentProfile: profile,
      profiles: { 'audit-user': profile },
      currentProfileId: 'audit-user',
    }))
    // Dismiss notification prompt
    localStorage.setItem('rstu-notification-prompt-dismissed', 'true')
    // Dismiss onboarding
    localStorage.setItem('rstu-onboarding-dismissed', 'true')
    localStorage.setItem('rstu-onboarding-complete', 'true')
  })
}

async function setLocale(page, locale) {
  await page.evaluate((loc) => {
    localStorage.setItem('rstu-locale', loc)
  }, locale)
}

async function dismissOverlays(page) {
  // Press Escape a few times to dismiss any modals/overlays
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  // Click away from any overlay
  try {
    const overlays = await page.$$('.fixed.inset-0')
    for (const overlay of overlays) {
      try { await overlay.click({ force: true }) } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }
  await page.waitForTimeout(300)
}

async function clickNavButton(page, text) {
  try {
    await dismissOverlays(page)
    // Find nav buttons in the desktop nav
    const buttons = await page.$$('nav button')
    for (const btn of buttons) {
      const btnText = await btn.textContent()
      if (btnText && btnText.trim().toLowerCase().includes(text.toLowerCase())) {
        await btn.click({ force: true, timeout: 5000 })
        await page.waitForTimeout(2000)
        return true
      }
    }
    // Fallback: click by index in nav
    return false
  } catch (e) {
    console.log(`    Warning: Could not click nav "${text}": ${e.message.substring(0, 80)}`)
    return false
  }
}

async function clickNavByIndex(page, index) {
  try {
    await dismissOverlays(page)
    const buttons = await page.$$('nav button')
    if (buttons[index]) {
      await buttons[index].click({ force: true, timeout: 5000 })
      await page.waitForTimeout(2000)
      return true
    }
    return false
  } catch (e) {
    console.log(`    Warning: nav index ${index} failed: ${e.message.substring(0, 80)}`)
    return false
  }
}

async function screenshot(page, filePath) {
  try {
    await page.screenshot({ path: filePath, fullPage: true })
    console.log(`    Saved: ${path.basename(filePath)}`)
  } catch (e) {
    console.log(`    Error saving ${path.basename(filePath)}: ${e.message.substring(0, 80)}`)
  }
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  for (const locale of LOCALES) {
    console.log(`\n=== LOCALE: ${locale.toUpperCase()} ===`)
    const localeDir = path.join(OUT_DIR, locale)
    if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    // Initial load with profile + locale
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
    await ensureProfile(page)
    await setLocale(page, locale)
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2500)
    await dismissOverlays(page)

    // === 1. LANDING PAGE ===
    console.log(`  [1] Landing page`)
    await screenshot(page, path.join(localeDir, '01-landing.png'))

    // === 2. HOME / ORGANIZE TAB ===
    console.log(`  [2] Home/Organize`)
    // Nav buttons: Home, Organize, Reading, Resources, Mutual Aid, Tools, Profile, Main Site
    // Index:       0     1         2        3          4           5      6        (link)
    await clickNavByIndex(page, 1) // Organize
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '02-organize.png'))

    // Try clicking first building in list
    try {
      const firstBuilding = await page.$('.space-y-1 > div:first-child, [class*="cursor-pointer"]:first-of-type')
      if (firstBuilding) {
        await firstBuilding.click({ force: true, timeout: 3000 })
        await page.waitForTimeout(1500)
        await dismissOverlays(page)
        await screenshot(page, path.join(localeDir, '02b-property-chat.png'))

        // Click through property sub-tabs (Events, Map)
        const propTabs = await page.$$('[role="tablist"] button')
        for (let i = 0; i < propTabs.length; i++) {
          try {
            const txt = await propTabs[i].textContent()
            await propTabs[i].click({ force: true, timeout: 3000 })
            await page.waitForTimeout(1000)
            const safeName = (txt || `tab${i}`).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
            await screenshot(page, path.join(localeDir, `02c-property-${safeName}.png`))
          } catch (e) { /* skip */ }
        }
      }
    } catch (e) {
      console.log(`    Warning: property view: ${e.message.substring(0, 80)}`)
    }

    // === 3. READING TAB ===
    console.log(`  [3] Reading`)
    await clickNavByIndex(page, 2) // Reading
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '03-reading.png'))

    // === 4. RESOURCES TAB ===
    console.log(`  [4] Resources`)
    await clickNavByIndex(page, 3) // Resources
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '04-resources.png'))

    // === 5. MUTUAL AID TAB ===
    console.log(`  [5] Mutual Aid`)
    await clickNavByIndex(page, 4) // Mutual Aid
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '05-mutualaid.png'))

    // Check for sub-tabs in mutual aid
    try {
      const maTabs = await page.$$('[role="tablist"] button, .border-b button')
      for (let i = 0; i < Math.min(maTabs.length, 6); i++) {
        const txt = await maTabs[i].textContent()
        await maTabs[i].click({ force: true, timeout: 3000 })
        await page.waitForTimeout(1000)
        const safeName = (txt || `ma${i}`).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
        await screenshot(page, path.join(localeDir, `05-mutualaid-${safeName}.png`))
      }
    } catch (e) { /* skip */ }

    // === 6. TOOLS TAB ===
    console.log(`  [6] Tools`)
    await clickNavByIndex(page, 5) // Tools
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '06-tools.png'))

    // Tools sub-tabs
    try {
      const toolTabs = await page.$$('[role="tablist"] button, .border-b button, .flex.gap-1 button, .flex.gap-2 button')
      const seen = new Set()
      for (let i = 0; i < Math.min(toolTabs.length, 10); i++) {
        const txt = (await toolTabs[i].textContent() || '').trim()
        if (seen.has(txt) || !txt) continue
        seen.add(txt)
        try {
          await toolTabs[i].click({ force: true, timeout: 3000 })
          await page.waitForTimeout(1200)
          const safeName = txt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
          await screenshot(page, path.join(localeDir, `06-tools-${safeName}.png`))
        } catch (e) { /* skip */ }
      }
    } catch (e) { /* skip */ }

    // === 7. PROFILE TAB ===
    console.log(`  [7] Profile`)
    await clickNavByIndex(page, 6) // Profile
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '07-profile.png'))

    // Profile sub-tabs/sections
    try {
      const profileTabs = await page.$$('[role="tablist"] button, .border-b button')
      const seen = new Set()
      for (let i = 0; i < Math.min(profileTabs.length, 6); i++) {
        const txt = (await profileTabs[i].textContent() || '').trim()
        if (seen.has(txt) || !txt) continue
        seen.add(txt)
        try {
          await profileTabs[i].click({ force: true, timeout: 3000 })
          await page.waitForTimeout(1200)
          const safeName = txt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
          await screenshot(page, path.join(localeDir, `07-profile-${safeName}.png`))
        } catch (e) { /* skip */ }
      }
    } catch (e) { /* skip */ }

    // === 8. MOBILE WIDTH ===
    console.log(`  [8] Mobile (375px)`)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500)

    // Go to landing
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await dismissOverlays(page)
    await screenshot(page, path.join(localeDir, '08-mobile-landing.png'))

    // Open hamburger menu
    try {
      const hamburger = await page.$('button[aria-label="Open menu"]')
      if (hamburger) {
        await hamburger.click({ force: true, timeout: 3000 })
        await page.waitForTimeout(800)
        await screenshot(page, path.join(localeDir, '08-mobile-menu.png'))
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
      }
    } catch (e) { /* skip */ }

    // Mobile: navigate to key tabs
    const mobileTabs = ['home', 'reading', 'profile']
    for (const tab of mobileTabs) {
      try {
        // Set tab via evaluate since hamburger menu nav is complex
        await page.evaluate((t) => {
          // Dispatch a custom event or use localStorage
          window.__RSTU_SET_TAB?.(t)
        }, tab)
        // Fallback: open hamburger and click
        const hamburger = await page.$('button[aria-label="Open menu"]')
        if (hamburger) {
          await hamburger.click({ force: true, timeout: 3000 })
          await page.waitForTimeout(500)
          // Click the tab link in the drawer
          const menuButtons = await page.$$('.fixed button, [class*="drawer"] button')
          for (const mb of menuButtons) {
            const txt = (await mb.textContent() || '').trim().toLowerCase()
            if (txt.includes(tab)) {
              await mb.click({ force: true, timeout: 3000 })
              await page.waitForTimeout(1500)
              break
            }
          }
        }
        await dismissOverlays(page)
        await screenshot(page, path.join(localeDir, `08-mobile-${tab}.png`))
      } catch (e) { /* skip */ }
    }

    await context.close()
    console.log(`  Done with ${locale.toUpperCase()}`)
  }

  await browser.close()

  // Count screenshots
  let total = 0
  for (const locale of LOCALES) {
    const dir = path.join(OUT_DIR, locale)
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'))
      total += files.length
      console.log(`  ${locale}: ${files.length} screenshots`)
    }
  }
  console.log(`\nTotal: ${total} screenshots in ${OUT_DIR}`)
}

run().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
