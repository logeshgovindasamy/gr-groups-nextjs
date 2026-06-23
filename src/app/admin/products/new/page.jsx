"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "0",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json();
          imageUrl = uploadResult.data?.url || uploadResult.url || "";
        } else {
          toast.error("Failed to upload image. Please try again.");
          setLoading(false);
          return;
        }
      }

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          stock: Number(formData.stock),
          images: imageUrl ? [imageUrl] : [],
          isNewArrival: true
        }),
      });

      const result = await res.json();

      if (res.ok || result.success) {
        toast.success("Product created successfully!");
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      toast.error("An error occurred while creating the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      {/* Page Header */}
      <div className="flex items-center gap-3.5">
        <Link 
          href="/admin/products" 
          className="p-1.5 bg-white border border-[#babfc3] rounded-lg text-[#1a1d1f] hover:bg-[#f6f6f7] transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1a1d1f]">Add Product</h2>
          <p className="text-xs text-[#6d7175] mt-0.5">Create a new product listing in your catalog database.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Product Name <span className="text-[#d82c0d]">*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] placeholder:text-[#babfc3]"
                  placeholder="e.g. Luxe Cashmere Overcoat"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Category <span className="text-[#d82c0d]">*</span></label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] placeholder:text-[#babfc3]"
                  placeholder="e.g. Outerwear"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Price ($) <span className="text-[#d82c0d]">*</span></label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] placeholder:text-[#babfc3] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Stock Quantity <span className="text-[#d82c0d]">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] placeholder:text-[#babfc3] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] placeholder:text-[#babfc3] resize-none"
                  placeholder="Detailed product description..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Product Image (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] file:mr-3.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#e4e6e7] file:text-[#1a1d1f] hover:file:bg-[#d0d3d5]"
                />
                {imagePreview && (
                  <div className="mt-3.5">
                    <p className="text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Image Preview:</p>
                    <img src={imagePreview} alt="Preview" className="h-24 w-auto object-cover rounded-md border border-[#e1e3e5] shadow-xs" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-[#e1e3e5] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
