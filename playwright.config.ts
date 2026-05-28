import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chrome-guest',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: ['--guest', '--no-first-run', '--no-default-browser-check'],
        },
      },
    },
  ],
});
