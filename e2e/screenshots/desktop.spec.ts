import { test } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("CHASHNI Desktop Screenshots (1440x1000)", () => {
  test("14 - Home page desktop", async ({ page }) => {
    await page.goto(`${BASE}/fa`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/14-home-desktop.png" });
  });

  test("15 - Menu page desktop", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/15-menu-desktop.png" });
  });

  test("16 - Admin page desktop", async ({ page }) => {
    await page.goto(`${BASE}/demo/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/16-admin-desktop.png" });
  });

  test("17 - Design system desktop", async ({ page }) => {
    await page.goto(`${BASE}/demo/design-system`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/17-design-system-desktop.png" });
  });
});
