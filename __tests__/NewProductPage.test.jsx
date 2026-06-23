import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewProductPage from '../src/app/admin/products/new/page';
import toast from 'react-hot-toast';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

describe('NewProductPage Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Mock document.cookie to supply auth token
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'auth-token=test-jwt-admin-token-12345',
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('renders form with all inputs and labels', () => {
    render(<NewProductPage />);

    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price \(\$\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stock Quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Product/i })).toBeInTheDocument();
  });

  test('submits form successfully to /api/products only, bypassing WordPress', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'prod-new-123' } }),
    });

    render(<NewProductPage />);

    // Fill the inputs
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Luxury Leather Wallet' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Accessories' } });
    fireEvent.change(screen.getByLabelText(/Price \(\$\)/i), { target: { value: '150.00' } });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A premium calfskin wallet.' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Assert it called /api/products
    expect(global.fetch).toHaveBeenCalledWith('/api/products', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-jwt-admin-token-12345'
      },
      body: JSON.stringify({
        title: 'Luxury Leather Wallet',
        description: 'A premium calfskin wallet.',
        price: 150,
        category: 'Accessories',
        stock: 25,
        images: [],
        isNewArrival: true
      })
    }));

    // Verify it completely bypassed WordPress/wp-json
    const calledUrls = global.fetch.mock.calls.map(call => call[0]);
    calledUrls.forEach(url => {
      expect(url).not.toContain('wordpress');
      expect(url).not.toContain('wp-json');
      expect(url).not.toContain('wp-admin');
    });

    expect(toast.success).toHaveBeenCalledWith('Product created successfully!');
    expect(mockPush).toHaveBeenCalledWith('/admin/products');
  });

  test('handles API errors gracefully when database drops', async () => {
    // Mock internal API failure (500 Internal Server Error)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Database connection failed' }),
    });

    render(<NewProductPage />);

    // Fill required inputs
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Broken DB Product' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Price \(\$\)/i), { target: { value: '9.99' } });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), { target: { value: '10' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Verify the error toast is triggered
    expect(toast.error).toHaveBeenCalledWith('Database connection failed');
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('proves NO calls are made to WordPress even during generic network failures', async () => {
    // Mock network crash / fetch rejection
    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    render(<NewProductPage />);

    // Fill required inputs
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Failed Network Item' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Hardware' } });
    fireEvent.change(screen.getByLabelText(/Price \(\$\)/i), { target: { value: '299.99' } });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/i), { target: { value: '5' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Verify it did not fall back to calling WordPress
    const calledUrls = global.fetch.mock.calls.map(call => call[0]);
    calledUrls.forEach(url => {
      expect(url).not.toContain('wordpress');
      expect(url).not.toContain('wp-json');
      expect(url).not.toContain('wp-admin');
    });

    expect(toast.error).toHaveBeenCalledWith('An error occurred while creating the product.');
  });
});
