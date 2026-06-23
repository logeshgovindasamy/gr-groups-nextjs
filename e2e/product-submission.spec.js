const { test, expect } = require('@playwright/test');

test.describe('Headless E2E Product Creation & Isolation Tests', () => {
  test.beforeEach(async ({ context }) => {
    // 1. Mock logged in admin user by seeding the cookie
    await context.addCookies([
      {
        name: 'auth-token',
        value: 'test-jwt-admin-token-12345',
        domain: 'localhost',
        path: '/',
      }
    ]);
  });

  test('should submit product data to Next.js API only and block WordPress request leakage', async ({ page }) => {
    let internalApiCallCount = 0;
    let wordPressCallCount = 0;
    let requestPayload = null;

    // 2. Intercept internal API `/api/products` POST request
    await page.route('**/api/products', async (route) => {
      if (route.request().method() === 'POST') {
        internalApiCallCount++;
        requestPayload = JSON.parse(route.request().postData() || '{}');
        
        // Mock successful save response
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Seeded save successful' }),
        });
      } else {
        await route.continue();
      }
    });

    // 3. Monitor and block any accidental requests trying to reach WordPress
    await page.route(/(wordpress|wp-json|wp-admin)/, async (route) => {
      wordPressCallCount++;
      console.warn(`[WARNING] Blocked leaked request to WordPress: ${route.request().url()}`);
      await route.abort('failed');
    });

    // 4. Navigate to Add Product Page
    await page.goto('http://localhost:3000/admin/products/new');

    // 5. Fill out the form
    await page.fill('input[name="title"]', 'Bespoke Tweed Jacket');
    await page.fill('input[name="category"]', 'Outerwear');
    await page.fill('input[name="price"]', '850.50');
    await page.fill('input[name="stock"]', '12');
    await page.fill('textarea[name="description"]', 'Classic British tweed jacket hand-spun in Scotland.');

    // 6. Submit the form
    // Intercept navigation push to avoid premature route change failure in mock
    await page.route('**/admin/products', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Mock Admin Dashboard</h1>' });
    });

    await page.click('button[type="submit"]');

    // 7. Verify success toast message appears
    const successToast = page.locator('text=Product created successfully!');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // 8. Assertions
    // Verify our Next.js API was invoked exactly once with correct payload
    expect(internalApiCallCount).toBe(1);
    expect(requestPayload).toEqual({
      title: 'Bespoke Tweed Jacket',
      description: 'Classic British tweed jacket hand-spun in Scotland.',
      price: 850.5,
      category: 'Outerwear',
      stock: 12,
      images: [],
      isNewArrival: true
    });

    // Verify absolute zero data was leaked to WordPress/wp-json
    expect(wordPressCallCount).toBe(0);
  });
});
