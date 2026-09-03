import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: "list",
  timeout: 90000,
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: "Mobile",
      testMatch: /screenshots\/mobile\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "Desktop",
      testMatch: /screenshots\/desktop\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "Smoke",
      testMatch: /smoke\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev -- -p 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
