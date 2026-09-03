import { test } from "@playwright/test";

const BASE = "http://localhost:3000";

async function addItemsToCart(page: import("@playwright/test").Page) {
  await page.goto(`${BASE}/fa/menu`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  const firstCard = page.locator('section[id^="category-"] .group.relative').first();
  await firstCard.click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /افزودن به سبد|Add to Cart/ }).click();
  await page.waitForTimeout(500);

  const secondCard = page.locator('section[id^="category-"] .group.relative').nth(1);
  await secondCard.click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /افزودن به سبد|Add to Cart/ }).click();
  await page.waitForTimeout(500);
}

test.describe("CHASHNI Mobile Screenshots (390x844)", () => {
  test("01 - Home page", async ({ page }) => {
    await page.goto(`${BASE}/fa`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/01-home-mobile.png" });
  });

  test("02 - Menu page", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/02-menu-mobile.png" });
  });

  test("03 - Category navigation", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(500);
    await page.screenshot({ path: "public/readme/03-category-nav-mobile.png" });
  });

  test("04 - Product detail sheet", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const firstCard = page.locator('section[id^="category-"] .group.relative').first();
    await firstCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "public/readme/04-product-detail-mobile.png" });
  });

  test("05 - Product customization", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const firstCard = page.locator('section[id^="category-"] .group.relative').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    const optionButtons = page.locator(
      'button:has(> div > div.rounded-full.border-2)'
    );
    const count = await optionButtons.count();
    if (count >= 2) {
      await optionButtons.nth(1).click();
      await page.waitForTimeout(300);
    }

    const extraButtons = page.locator(
      'button:has(> div > div.rounded-lg.border-2)'
    );
    const extraCount = await extraButtons.count();
    if (extraCount > 0) {
      await extraButtons.first().click();
      await page.waitForTimeout(300);
    }

    await page.evaluate(() => {
      const sheet = document.querySelector(
        '[class*="fixed inset-x-0 bottom-0"][class*="overflow-y-auto"]'
      );
      if (sheet) sheet.scrollTop = 300;
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: "public/readme/05-product-customization-mobile.png" });
  });

  test("06 - Build burger page", async ({ page }) => {
    await page.goto(`${BASE}/fa/build-burger`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/06-build-burger-mobile.png" });
  });

  test("07 - Search overlay", async ({ page }) => {
    await page.goto(`${BASE}/fa/menu`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const headerButtons = page.locator("header .flex.items-center.gap-2 > button");
    await headerButtons.nth(1).click();
    await page.waitForTimeout(500);

    const searchInput = page.locator(
      'input[placeholder*="جستجو"], input[placeholder*="Search menu"]'
    );
    await searchInput.fill("ترافل");
    await page.waitForTimeout(1000);

    await page.screenshot({ path: "public/readme/07-search-mobile.png" });
  });

  test("08 - Cart page", async ({ page }) => {
    await addItemsToCart(page);
    await page.goto(`${BASE}/fa/cart`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/08-cart-mobile.png" });
  });

  test("09 - Checkout page", async ({ page }) => {
    await addItemsToCart(page);
    await page.goto(`${BASE}/fa/checkout`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/09-checkout-mobile.png" });
  });

  test("10 - Order success page", async ({ page }) => {
    await page.goto(`${BASE}/fa/order/success?id=CHS-DEMO-001&time=25`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/10-order-success-mobile.png" });
  });

  test("11 - Order tracking page", async ({ page }) => {
    await page.goto(`${BASE}/fa/order/demo-001`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/11-order-tracking-mobile.png" });
  });

  test("12 - Favorites page", async ({ page }) => {
    await page.goto(`${BASE}/fa/favorites`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "public/readme/12-favorites-mobile.png" });
  });

  test("13 - QR tables page", async ({ page }) => {
    await page.goto(`${BASE}/fa/qr-demo`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "public/readme/13-qr-tables-mobile.png" });
  });
});
