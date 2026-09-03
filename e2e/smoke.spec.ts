import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("CHASHNI Smoke Tests", () => {
  test("main menu loads with category tabs and products", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");

    // Category tabs should be visible (sticky bar at top)
    const categoryTabs = page.locator('section[id^="category-"]');
    await expect(categoryTabs.first()).toBeVisible();

    // Product cards should be rendered inside category sections
    const productCards = page.locator('section[id^="category-"] .group.relative');
    await expect(productCards.first()).toBeVisible();

    // At least one product should exist
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("language switch changes locale in URL", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");

    // Click the language switch button (Globe icon)
    // Header buttons: [language, search, cart] in the right-side button group
    const headerButtons = page.locator("header .flex.items-center.gap-2 > button");
    await headerButtons.first().click();

    // Wait for navigation to English locale
    await page.waitForURL("**/en/**", { timeout: 5000 });
    expect(page.url()).toContain("/en/");
  });

  test("product detail sheet opens on card click", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click the first product card
    const firstCard = page.locator('section[id^="category-"] .group.relative').first();
    await firstCard.click();

    // The detail sheet should appear (fixed overlay with backdrop)
    const overlay = page.locator('.fixed.inset-0[class*="bg-black"]').first();
    await expect(overlay).toBeVisible({ timeout: 5000 });
  });

  test("adding item updates cart badge", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Cart badge should not be visible initially (item count is 0)
    const cartBadge = page.locator("header .absolute.-top-1");
    await expect(cartBadge).not.toBeVisible();

    // Click first product card to open detail
    const firstCard = page.locator('section[id^="category-"] .group.relative').first();
    await firstCard.click();
    await page.waitForTimeout(800);

    // Click "افزودن به سبد" (Add to Cart) in the detail sheet
    await page.getByRole("button", { name: /افزودن به سبد|Add to Cart/ }).click();
    await page.waitForTimeout(500);

    // Cart badge should now show count of 1
    await expect(cartBadge).toBeVisible({ timeout: 3000 });
    await expect(cartBadge).toHaveText("1");
  });

  test("build burger page loads with step 1", async ({ page }) => {
    await page.goto(`${BASE}/fa/build-burger`);
    await page.waitForLoadState("networkidle");

    // Step progress bar should be visible
    const progressBar = page.locator(".h-1.rounded-full.bg-amber-400").first();
    await expect(progressBar).toBeVisible();

    // Step 1 title should be visible (burger options)
    // The builder shows step name and "Step 1 of N"
    const stepText = page.locator("text=/مرحله 1|Step 1/");
    await expect(stepText).toBeVisible();

    // Option buttons for step 1 should be present
    const options = page.locator(
      'button:has(> div > div.rounded-full.border-2)'
    );
    await expect(options.first()).toBeVisible();
  });

  test("table query shows table badge in header", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu?table=07`);
    await page.waitForLoadState("networkidle");

    // Header should show a table badge with "میز ۰۷" or "Table 07"
    const tableBadge = page.locator(
      'header span[class*="bg-amber-500/15"]'
    );
    await expect(tableBadge).toBeVisible({ timeout: 5000 });
    await expect(tableBadge).toContainText(/07|۰۷/);
  });

  test("QR demo page loads with QR codes", async ({ page }) => {
    await page.goto(`${BASE}/fa/qr-demo`);
    await page.waitForLoadState("networkidle");

    // Page title should be visible
    await expect(page.locator("text=CHASHNI QR Tables")).toBeVisible();

    // QR code SVGs should be rendered (from qrcode.react)
    const qrCodes = page.locator("svg[role='img']");
    const count = await qrCodes.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Table number cards should be visible
    const tableCards = page.locator("text=/^0[137]$|^12$/");
    expect(await tableCards.count()).toBeGreaterThanOrEqual(4);
  });
});
