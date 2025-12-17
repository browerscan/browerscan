import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.1,
      threshold: 0.3
    }
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] }
    }
  ],
  webServer: {
    // Run against a production build to avoid dev-only overlays and ensure prod parity
    command: 'npm run build && HOSTNAME=127.0.0.1 PORT=3000 npm run start -- --hostname 127.0.0.1 --port 3000',
    port: 3000,
    timeout: 180000,
    reuseExistingServer: !process.env.CI
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ]
});
