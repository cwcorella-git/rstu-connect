import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// Mobile viewport (iPhone 13)
const mobileViewport = { width: 390, height: 844 }

// Create persistent screenshot directory
const screenshotDir = path.join(process.cwd(), 'mobile-screenshots')
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true })
}

test.describe('Canvassing Mobile UI Flow', () => {
  test.use({ viewport: mobileViewport })

  test('screenshot canvassing interface flow', async ({ page, baseURL }) => {
    // Set up a test profile with organizer role before navigating
    await page.goto(baseURL || '/')
    await page.waitForLoadState('domcontentloaded')

    // Inject a test profile into localStorage to get access to Tools
    // The app uses 'rstu_profile_data' key with ProfileState structure
    await page.evaluate(() => {
      const testProfile = {
        id: 'test-organizer-001',
        nickname: 'Test Organizer',
        role: 'organizer',
        email: 'test@example.com',
        trustLevel: 'verified',
        createdAt: Date.now(),
        lastActive: Date.now()
      }
      const profileState = {
        currentProfile: testProfile,
        storedProfiles: [testProfile],
        inviteCodes: {},
        lastModified: Date.now()
      }
      localStorage.setItem('rstu_profile_data', JSON.stringify(profileState))
    })

    // Reload to apply the profile
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Screenshot 1: Landing page on mobile (logged in)
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-01-landing.png'),
      fullPage: false
    })

    // On mobile, we need to open the hamburger menu first
    const hamburgerBtn = page.locator('button[aria-label*="menu" i], button:has(svg path[d*="M4 6h16"])')
    if (await hamburgerBtn.first().isVisible()) {
      await hamburgerBtn.first().click()
      await page.waitForTimeout(500)

      // Screenshot: Hamburger menu open
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-01b-hamburger-menu.png'),
        fullPage: false
      })

      // Click Tools in the menu using JavaScript to bypass visibility checks
      await page.evaluate(() => {
        const toolsBtn = document.querySelector('nav button') as HTMLElement | null
        const buttons = document.querySelectorAll('nav button')
        buttons.forEach((btn) => {
          if (btn.textContent?.trim() === 'Tools') {
            (btn as HTMLElement).click()
          }
        })
      })
      await page.waitForTimeout(500)
    } else {
      // Desktop fallback - click Tools tab directly
      const toolsTab = page.getByRole('button', { name: /tools/i }).first()
      await toolsTab.click()
      await page.waitForTimeout(500)
    }

    // Screenshot 2: Tools page with tabs (Canvassing, Power Map, Tasks)
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-02-tools-tabs.png'),
      fullPage: false
    })

    // We're already on Canvassing tab - take screenshot of building list
    // Screenshot 3: Canvassing building list
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-03-canvassing-list.png'),
      fullPage: false
    })

    // Click on a building if available
    const buildingCard = page.locator('[class*="cursor-pointer"]').first()
    if (await buildingCard.isVisible()) {
      await buildingCard.click()
      await page.waitForTimeout(500)

      // Screenshot 4: Building detail / Unit tracker
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-04-building-detail.png'),
        fullPage: false
      })

      // Look for "Add Unit" or unit intake button
      const addUnitBtn = page.getByRole('button', { name: /add unit|new unit|\+/i }).first()
      if (await addUnitBtn.isVisible()) {
        await addUnitBtn.click()
        await page.waitForTimeout(500)

        // Screenshot 5: Unit intake form
        await page.screenshot({
          path: path.join(screenshotDir, 'mobile-05-unit-intake.png'),
          fullPage: false
        })

        // Close the form if there's a cancel/close button
        const cancelBtn = page.getByRole('button', { name: /cancel|close|back/i }).first()
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click()
          await page.waitForTimeout(300)
        }
      }

      // Go back to building list
      const backBtn = page.getByRole('button', { name: /back/i }).first()
      if (await backBtn.isVisible()) {
        await backBtn.click()
        await page.waitForTimeout(300)
      }
    }

    // Screenshot 6: Power Map tab - use JavaScript click to bypass visibility issues
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      buttons.forEach((btn) => {
        if (btn.textContent?.includes('Power Map')) {
          (btn as HTMLElement).click()
        }
      })
    })
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-06-powermap.png'),
      fullPage: false
    })

    // Click on a landlord if available
    const landlordCard = page.locator('[class*="cursor-pointer"]').first()
    if (await landlordCard.isVisible()) {
      await landlordCard.click()
      await page.waitForTimeout(500)

      // Screenshot 7: Landlord detail
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-07-landlord-detail.png'),
        fullPage: false
      })

      // Go back
      const backBtn = page.getByRole('button', { name: /back/i }).first()
      if (await backBtn.isVisible()) {
        await backBtn.click()
        await page.waitForTimeout(300)
      }
    }

    // Screenshot 8: Tasks tab - use JavaScript click to bypass visibility issues
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      buttons.forEach((btn) => {
        if (btn.textContent?.trim() === 'Tasks') {
          (btn as HTMLElement).click()
        }
      })
    })
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-08-tasks.png'),
      fullPage: false
    })

    // Check for task board columns
    const taskBoard = page.locator('[class*="grid"]').first()
    if (await taskBoard.isVisible()) {
      // Screenshot 9: Task board (may need horizontal scroll)
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-09-task-board.png'),
        fullPage: false
      })
    }

    // Try to add a task if button exists
    const addTaskBtn = page.getByRole('button', { name: /add task/i }).first()
    if (await addTaskBtn.isVisible()) {
      await addTaskBtn.click()
      await page.waitForTimeout(500)

      // Screenshot 10: Task form
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-10-task-form.png'),
        fullPage: false
      })
    }

    console.log('All screenshots saved to test-results/')
  })

  test('measure tab button layout', async ({ page, baseURL }) => {
    // Set up a test profile with organizer role
    await page.goto(baseURL || '/')
    await page.waitForLoadState('domcontentloaded')

    await page.evaluate(() => {
      const testProfile = {
        id: 'test-organizer-001',
        nickname: 'Test Organizer',
        role: 'organizer',
        email: 'test@example.com',
        trustLevel: 'verified',
        createdAt: Date.now(),
        lastActive: Date.now()
      }
      const profileState = {
        currentProfile: testProfile,
        storedProfiles: [testProfile],
        inviteCodes: {},
        lastModified: Date.now()
      }
      localStorage.setItem('rstu_profile_data', JSON.stringify(profileState))
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // On mobile, we need to open the hamburger menu first
    const hamburgerBtn = page.locator('button[aria-label*="menu" i], button:has(svg path[d*="M4 6h16"])')
    if (await hamburgerBtn.first().isVisible()) {
      await hamburgerBtn.first().click()
      await page.waitForTimeout(500)

      // Click Tools in the menu using JavaScript to bypass visibility checks
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('nav button')
        buttons.forEach((btn) => {
          if (btn.textContent?.trim() === 'Tools') {
            (btn as HTMLElement).click()
          }
        })
      })
      await page.waitForTimeout(500)
    } else {
      // Desktop fallback
      const toolsTab = page.getByRole('button', { name: /tools/i }).first()
      await toolsTab.click()
      await page.waitForTimeout(500)
    }

    // Find the tab container and measure
    const tabContainer = page.locator('.flex.gap-1.bg-gray-100.rounded-lg.p-1').first()

    if (await tabContainer.isVisible()) {
      const box = await tabContainer.boundingBox()
      console.log('Tab container dimensions:', box)

      // Get all tab buttons
      const tabs = tabContainer.locator('button')
      const tabCount = await tabs.count()

      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i)
        const tabBox = await tab.boundingBox()
        const tabText = await tab.textContent()
        console.log(`Tab ${i + 1} "${tabText?.trim()}":`, tabBox)
      }

      // Check if tabs are wrapping (container height > single row)
      if (box && box.height > 50) {
        console.log('WARNING: Tabs are wrapping to multiple rows!')
      }
    }
  })
})
