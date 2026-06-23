const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
}));
const useParams = jest.fn(() => ({ id: 'test-product-123' }));
const useSearchParams = jest.fn(() => new URLSearchParams());
const usePathname = jest.fn(() => '/');

module.exports = { useRouter, useParams, useSearchParams, usePathname };
