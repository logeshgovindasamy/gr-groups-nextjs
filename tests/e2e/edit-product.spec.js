// ============================================================
// E2E Tests — Edit Product (category + description update)
// Run: npm run test:e2e  (requires npm run dev on port 3000)
// ============================================================

const { test, expect } = require('@playwright/test');

const PRODUCT_ID = 'test-product-123';
const EDIT_URL = `/admin/products/${PRODUCT_ID}/edit`;

const mockCurrentProduct = {
  success: true,
  data: {
    id: PRODUCT_ID,
    name: 'Original Jacket',
    description: 'Original description.',
    price: 129.99,
    category: 'Outerwear',
    stock: 25,
    images: ['/products/jacket.jpg'],
    isNewArrival: true,
  },
};

test.describe('Edit Product — Category & Description Bug Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`/api/products/${PRODUCT_ID}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCurrentProduct),
        });
      } else {
        route.continue();
      }
    });
    await page.goto(EDIT_URL);
  });

  test('pre-fills form with current product data', async ({ page }) => {
    await expect(page.locator('input[name=name]')).toHaveValue('Original Jacket');
    await expect(page.locator('textarea[name=description]')).toHaveValue('Original description.');
    await expect(page.locator('input[name=category]')).toHaveValue('Outerwear');
    await expect(page.locator('input[name=price]')).toHaveValue('129.99');
  });

  test('🐛 FIX: category is included in PUT request body', async ({ page }) => {
    let capturedBody = null;

    await page.route(`/api/products/${PRODUCT_ID}`, (route) => {
      if (route.request().method() === 'PUT') {
        capturedBody = JSON.parse(route.request().postData());
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify(mockCurrentProduct) });
      }
    });

    await page.locator('input[name=category]').fill('Winter Wear');
    await page.click('button[type=submit]');
    await page.waitForURL('/admin/products', { timeout: 5000 });

    expect(capturedBody?.category).toBe('Winter Wear');
  });

  test('🐛 FIX: description is included in PUT request body', async ({ page }) => {
    let capturedBody = null;

    await page.route(`/api/products/${PRODUCT_ID}`, (route) => {
      if (route.request().method() === 'PUT') {
        capturedBody = JSON.parse(route.request().postData());
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify(mockCurrentProduct) });
      }
    });

    await page.locator('textarea[name=description]').fill('Updated description text.');
    await page.click('button[type=submit]');
    await page.waitForURL('/admin/products', { timeout: 5000 });

    expect(capturedBody?.description).toBe('Updated description text.');
  });
});

test.describe('Admin Products — List Page', () => {
  test('shows product table with correct headers', async ({ page }) => {
    await page.goto('/admin/products');
    const headers = page.locator('thead th');
    await expect(headers.first()).toContainText('Product');
  });

  test('Add Product button navigates to /admin/products/new', async ({ page }) => {
    await page.goto('/admin/products');
    await page.click('a[href="/admin/products/new"]');
    await expect(page).toHaveURL('/admin/products/new');
  });
});
