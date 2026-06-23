"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?per_page=1000");
      const result = await res.json();

      const data = result.data || result;
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // In this workspace they use a custom JWT so we have to attach it to the request
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok || result.success) {
        toast.success("Product deleted successfully");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filteredProducts = products.filter((p) => {
    const searchTarget = p.title || p.name || "";
    const matchesSearch = searchTarget.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;

    let matchesStock = true;
    if (stockStatus === "in_stock") {
      matchesStock = p.stock > 0;
    } else if (stockStatus === "low_stock") {
      matchesStock = p.stock > 0 && p.stock <= 10;
    } else if (stockStatus === "out_of_stock") {
      matchesStock = p.stock === 0 || !p.stock;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1a1d1f]">Products</h2>
          <p className="text-xs text-[#6d7175] mt-0.5">Manage your inventory, pricing, and catalog details.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xs overflow-hidden">

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-[#e1e3e5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#f6f6f7]/50">

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters Select boxes */}
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#6d7175] uppercase whitespace-nowrap">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-[#babfc3] rounded-lg px-2 py-1.5 text-xs text-[#1a1d1f] font-semibold outline-none focus:border-accent cursor-pointer"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock status filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#6d7175] uppercase whitespace-nowrap">Stock</span>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="bg-white border border-[#babfc3] rounded-lg px-2 py-1.5 text-xs text-[#1a1d1f] font-semibold outline-none focus:border-accent cursor-pointer"
              >
                <option value="">All</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Index Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f6f7] text-[#6d7175] border-b border-[#e1e3e5] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-bold">Product</th>
                <th className="px-5 py-3.5 font-bold">Category</th>
                <th className="px-5 py-3.5 font-bold">Price</th>
                <th className="px-5 py-3.5 font-bold">Stock</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e3e5]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#6d7175]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-semibold text-xs">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-[#6d7175] font-semibold">
                    No products found. Start by adding a new product.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#f6f6f7]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-[#1a1d1f] text-sm">{product.title || product.name}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-[#e4e6e7] text-[#1a1d1f] px-2 py-0.5 rounded text-[10px] font-bold">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#1a1d1f]">${Number(product.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={
                        product.stock > 10 ? 'badge-success' :
                          product.stock > 0 ? 'badge-warning' :
                            'badge-danger'
                      }>
                        {product.stock || 0} in stock
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 font-semibold text-[#1a1d1f]">
                        <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#008060]' : 'bg-[#d82c0d]'}`}></span>
                        {product.stock > 0 ? "Active" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-[#6d7175] hover:text-accent hover:bg-gray-100 rounded-md transition-all inline-block"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-[#6d7175] hover:text-[#d82c0d] hover:bg-red-50 rounded-md transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
