// ============================================================
// Shared fixtures — mock data matching this project's schema
// ============================================================

export const mockProduct = {
  id: 'test-product-123',
  name: 'Test Jacket',
  title: 'Test Jacket',
  description: 'A premium test jacket.',
  price: 129.99,
  category: 'Outerwear',
  stock: 25,
  images: ['/products/jacket.jpg'],
  image: '/products/jacket.jpg',
  isNewArrival: true,
  rating: 0,
  numReviews: 0,
  createdAt: '2024-01-15T10:00:00.000Z',
};

export const mockProductB = {
  id: 'test-product-456',
  name: 'Test Sneakers',
  title: 'Test Sneakers',
  description: 'Comfortable everyday sneakers.',
  price: 79.99,
  category: 'Footwear',
  stock: 0,
  images: ['/products/sneakers.jpg'],
  image: '/products/sneakers.jpg',
  isNewArrival: false,
  rating: 0,
  numReviews: 0,
  createdAt: '2024-02-10T08:00:00.000Z',
};

export const mockProductList = [mockProduct, mockProductB];

export const mockWpGraphQLResponse = (products) => ({
  data: {
    grGroupProducts: products.map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock,
      images: p.images,
      isNewArrival: p.isNewArrival,
      createdAt: p.createdAt,
    })),
  },
});

export const mockWpSingleProductResponse = (product) => ({
  data: {
    grGroupProduct: {
      id: product.id,
      title: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images,
      isNewArrival: product.isNewArrival,
      createdAt: product.createdAt,
    },
  },
});

export const mockWpMutationSuccess = {
  data: {
    createGrGroupProduct: { success: true, productId: 'test-product-123' },
  },
};
