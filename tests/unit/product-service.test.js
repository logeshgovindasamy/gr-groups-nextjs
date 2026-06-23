// ============================================================
// Unit Tests — src/services/product.service.js
// All fetch() calls are mocked — no real network requests
// ============================================================

import {
  getAllProducts,
  getProductById,
  saveProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getNewArrivals,
} from '@/services/product.service';

import {
  mockProduct,
  mockProductB,
  mockProductList,
  mockWpGraphQLResponse,
  mockWpSingleProductResponse,
  mockWpMutationSuccess,
} from '../fixtures/products';

// ─── Setup global fetch mock ──────────────────────────────────
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

function mockFetchSuccess(payload) {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(payload),
  });
}

function mockFetchError(status = 500) {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status,
    text: () => Promise.resolve('Server Error'),
  });
}

// ─── getAllProducts ───────────────────────────────────────────
describe('getAllProducts()', () => {
  it('returns a mapped list of products on success', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));

    const products = await getAllProducts();

    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Test Sneakers');
    expect(products[0].category).toBe('Footwear');
  });

  it('maps WordPress "title" field to "name"', async () => {
    mockFetchSuccess(mockWpGraphQLResponse([mockProduct]));
    const [p] = await getAllProducts();
    expect(p.name).toBeDefined();
    expect(p.id).toBe('test-product-123');
  });

  it('returns empty array on fetch error (graceful)', async () => {
    mockFetchError();
    expect(await getAllProducts()).toEqual([]);
  });

  it('sorts results newest first by default', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));
    const products = await getAllProducts();
    expect(new Date(products[0].createdAt) >= new Date(products[1].createdAt)).toBe(true);
  });
});

// ─── getProductById ───────────────────────────────────────────
describe('getProductById()', () => {
  it('returns a mapped product when found', async () => {
    mockFetchSuccess(mockWpSingleProductResponse(mockProduct));

    const product = await getProductById('test-product-123');

    expect(product).not.toBeNull();
    expect(product.id).toBe('test-product-123');
    expect(product.name).toBe('Test Jacket');
    expect(product.category).toBe('Outerwear');
    expect(product.price).toBe(129.99);
  });

  it('returns null when product does not exist', async () => {
    mockFetchSuccess({ data: { grGroupProduct: null } });
    expect(await getProductById('nonexistent')).toBeNull();
  });

  it('returns null on fetch error', async () => {
    mockFetchError();
    expect(await getProductById('test-product-123')).toBeNull();
  });
});

// ─── saveProduct ──────────────────────────────────────────────
describe('saveProduct()', () => {
  it('saves a product and returns mapped data', async () => {
    mockFetchSuccess(mockWpMutationSuccess);

    const product = await saveProduct({
      name: 'New Hoodie',
      description: 'Warm hoodie',
      price: 59.99,
      category: 'Tops',
      stock: 10,
      images: [],
      isNewArrival: false,
    });

    expect(product.name).toBe('New Hoodie');
    expect(product.category).toBe('Tops');
    expect(product.price).toBe(59.99);
  });

  it('sends the correct GraphQL mutation payload', async () => {
    mockFetchSuccess(mockWpMutationSuccess);

    await saveProduct({
      name: 'Test Item',
      category: 'Electronics',
      price: 199,
      stock: 5,
    });

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.query).toContain('createGrGroupProduct');
    expect(body.variables.input.title).toBe('Test Item');
    expect(body.variables.input.category).toBe('Electronics');
  });

  it('throws when mutation returns success=false', async () => {
    mockFetchSuccess({ data: { createGrGroupProduct: { success: false } } });
    await expect(saveProduct({ name: 'X', price: 1, category: 'Y', stock: 1 })).rejects.toThrow();
  });
});

// ─── updateProduct ────────────────────────────────────────────
describe('updateProduct() — BUG REGRESSION TESTS', () => {
  it('🐛 FIX: updates category correctly (was silently ignored)', async () => {
    mockFetchSuccess(mockWpSingleProductResponse(mockProduct)); // getProductById
    mockFetchSuccess(mockWpMutationSuccess);                    // mutation

    const result = await updateProduct('test-product-123', { category: 'Winter Wear' });

    // Check the mutation was sent with the NEW category
    const mutationBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(mutationBody.variables.input.category).toBe('Winter Wear');
    expect(result).not.toBeNull();
  });

  it('🐛 FIX: updates description correctly (was silently ignored)', async () => {
    mockFetchSuccess(mockWpSingleProductResponse(mockProduct));
    mockFetchSuccess(mockWpMutationSuccess);

    await updateProduct('test-product-123', { description: 'Brand new description' });

    const mutationBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(mutationBody.variables.input.description).toBe('Brand new description');
  });

  it('preserves unchanged fields when updating just one field', async () => {
    mockFetchSuccess(mockWpSingleProductResponse(mockProduct));
    mockFetchSuccess(mockWpMutationSuccess);

    await updateProduct('test-product-123', { stock: 50 });

    const input = JSON.parse(global.fetch.mock.calls[1][1].body).variables.input;
    expect(input.title).toBe('Test Jacket');    // unchanged
    expect(input.category).toBe('Outerwear');   // unchanged
    expect(input.price).toBe(129.99);           // unchanged
    expect(input.stock).toBe(50);              // updated
  });

  it('allows setting stock to 0 (falsy value must be preserved)', async () => {
    mockFetchSuccess(mockWpSingleProductResponse(mockProduct));
    mockFetchSuccess(mockWpMutationSuccess);

    await updateProduct('test-product-123', { stock: 0 });

    const input = JSON.parse(global.fetch.mock.calls[1][1].body).variables.input;
    expect(input.stock).toBe(0);
  });

  it('returns null when product is not found', async () => {
    mockFetchSuccess({ data: { grGroupProduct: null } });
    const result = await updateProduct('nonexistent', { price: 99 });
    expect(result).toBeNull();
  });
});

// ─── deleteProduct ────────────────────────────────────────────
describe('deleteProduct()', () => {
  it('returns true (soft delete)', async () => {
    expect(await deleteProduct('test-product-123')).toBe(true);
  });

  it('does not call the WordPress API (not yet implemented)', async () => {
    await deleteProduct('test-product-123');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ─── searchProducts ──────────────────────────────────────────
describe('searchProducts()', () => {
  it('returns products matching the search term in name', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));
    const results = await searchProducts('jacket');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('jacket');
  });

  it('returns products matching the search term in category', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));
    const results = await searchProducts('footwear');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category.toLowerCase()).toContain('footwear');
  });

  it('returns empty array when no match', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));
    const results = await searchProducts('zzz_no_match');
    expect(results).toHaveLength(0);
  });

  it('returns empty array on fetch error', async () => {
    mockFetchError();
    expect(await searchProducts('jacket')).toEqual([]);
  });
});

// ─── getNewArrivals ──────────────────────────────────────────
describe('getNewArrivals()', () => {
  it('returns products marked as isNewArrival=true', async () => {
    mockFetchSuccess(mockWpGraphQLResponse(mockProductList));
    const arrivals = await getNewArrivals();
    expect(arrivals.length).toBeGreaterThan(0);
    arrivals.forEach((p) => expect(p.isNewArrival).toBe(true));
  });

  it('falls back to all products when none are marked as new arrivals', async () => {
    const noArrivals = mockProductList.map((p) => ({ ...p, isNewArrival: false }));
    mockFetchSuccess(mockWpGraphQLResponse(noArrivals));
    const arrivals = await getNewArrivals();
    // Should return all products as fallback
    expect(arrivals.length).toBeGreaterThan(0);
  });

  it('returns a max of 12 products', async () => {
    const bigList = Array.from({ length: 20 }, (_, i) => ({
      ...mockProduct,
      id: `prod_${i}`,
      name: `Product ${i}`,
      isNewArrival: true,
    }));
    mockFetchSuccess(mockWpGraphQLResponse(bigList));
    const arrivals = await getNewArrivals();
    expect(arrivals.length).toBeLessThanOrEqual(12);
  });
});
