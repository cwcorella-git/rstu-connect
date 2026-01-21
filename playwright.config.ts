import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E test configuration for RSTU Connect
 *
 * Runs tests against local dev server for CI/CD integration.
 * For production testing, override baseURL with PLAYWRIGHT_BASE_URL env var.
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL - use env var or default to local dev server
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000/rstu-connect',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure (useful for debugging)
    video: 'on-first-retry',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport for responsive testing
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Run local dev server before starting tests (skip if baseURL is external)
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000/rstu-connect',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global timeout for each test
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },
})
