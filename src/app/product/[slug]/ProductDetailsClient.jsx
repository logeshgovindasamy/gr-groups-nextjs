"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCartStore from "@/store/useCartStore";
import { ShoppingBag, Zap, Heart, Star, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

export default function ProductDetailsClient({ product, variations, relatedProducts }) {
  const router = useRouter();
  const addToCartStore = useCartStore((state) => state.addToCart);
  
  // Gallery index state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic selected attributes state
  const [selectedOpts, setSelectedOpts] = useState({});
  const [matchedVariation, setMatchedVariation] = useState(null);
  const [activePrice, setActivePrice] = useState(product?.price || 0);
  const [activeRegPrice, setActiveRegPrice] = useState(product?.regularPrice || product?.price || 0);
  const [activeStock, setActiveStock] = useState(product?.stock !== undefined ? product.stock : null);
  const [activeStockStatus, setActiveStockStatus] = useState(product?.stockStatus || "instock");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Initialize selected attributes with first options if variable product
  useEffect(() => {
    if (product?.attributes && product.attributes.length > 0) {
      const initialOpts = {};
      product.attributes.forEach((attr) => {
        if (attr && attr.name && attr.options && attr.options.length > 0) {
          initialOpts[attr.name] = attr.options[0];
        }
      });
      setSelectedOpts(initialOpts);
    }
  }, [product]);

  // Match selected attributes to a variation whenever choices change
  useEffect(() => {
    if (product && product.type === "variable" && variations && variations.length > 0) {
      const matched = variations.find((v) => {
        if (!v || !v.attributes) return false;
        return v.attributes.every((attr) => {
          if (!attr || !attr.name) return true;
          const selectedVal = selectedOpts[attr.name];
          // WooCommerce variation options can be empty/wildcard matching any value
          return !attr.option || selectedVal === attr.option;
        });
      });

      if (matched) {
        setMatchedVariation(matched);
        setActivePrice(matched.price || 0);
        setActiveRegPrice(matched.regularPrice || matched.price || 0);
        setActiveStock(matched.stock !== undefined ? matched.stock : null);
        setActiveStockStatus(matched.stockStatus || "instock");
        
        // If variation has a custom image, switch gallery index if found
        if (matched.image && product.images) {
          const imgIdx = product.images.findIndex((img) => img === matched.image);
          if (imgIdx !== -1) {
            setActiveImageIndex(imgIdx);
          }
        }
      } else {
        // Fallback to main product details if no variation matches
        setMatchedVariation(null);
        setActivePrice(product.price || 0);
        setActiveRegPrice(product.regularPrice || product.price || 0);
        setActiveStock(product.stock !== undefined ? product.stock : null);
        setActiveStockStatus(product.stockStatus || "instock");
      }
    } else if (product) {
      // Simple product values
      setActivePrice(product.price || 0);
      setActiveRegPrice(product.regularPrice || product.price || 0);
      setActiveStock(product.stock !== undefined ? product.stock : null);
      setActiveStockStatus(product.stockStatus || "instock");
    }
  }, [selectedOpts, product, variations]);

  // Fetch reviews on mount
  useEffect(() => {
    async function loadReviews() {
      try {
        setLoadingReviews(true);
        const res = await fetch(`/api/products/${product.id}/reviews`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.warn("Failed to fetch reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadReviews();
  }, [product.id]);

  const handleOptChange = (attrName, optionVal) => {
    setSelectedOpts((prev) => ({
      ...prev,
      [attrName]: optionVal
    }));
  };

  // Check if variation/product is in stock
  const isOutOfStock = activeStockStatus === "outofstock" || (activeStock !== null && activeStock <= 0);

  // Stock status text and color
  const getStockBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
        </span>
      );
    }
    if (activeStock !== null && activeStock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" /> Only {activeStock} Left!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" /> In Stock
      </span>
    );
  };

  // Calculate discount percentage reactively
  const activeDiscount = activeRegPrice > activePrice 
    ? Math.round(((activeRegPrice - activePrice) / activeRegPrice) * 100)
    : 0;

  // Handle Add to Cart action
  const handleAddToCart = (silent = false) => {
    if (isOutOfStock) return;

    const cartItem = {
      id: product.id,
      variationId: matchedVariation ? matchedVariation.id : null,
      name: product.name,
      image: product.image,
      price: activePrice,
      selectedAttributes: selectedOpts,
      qty: 1,
      stock: activeStock !== null ? activeStock : 99
    };

    addToCartStore(cartItem);
    if (!silent) {
      alert("Added to shopping cart successfully!");
    }
  };

  // Handle Buy Now action
  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart(true);
    router.push("/cart");
  };

  // CSS mapper for color attributes
  const getColorClass = (colorName) => {
    const map = {
      black: "bg-black",
      white: "bg-white border border-slate-300",
      red: "bg-red-500",
      blue: "bg-blue-600",
      green: "bg-emerald-500",
      yellow: "bg-yellow-400",
      orange: "bg-orange-500",
      purple: "bg-purple-600",
      pink: "bg-pink-400",
      grey: "bg-slate-400",
      gray: "bg-slate-400",
      silver: "bg-slate-300",
      gold: "bg-yellow-600",
    };
    return map[colorName.toLowerCase()] || "bg-slate-200";
  };

  // Breadcrumb rating value helper
  const renderStars = (ratingVal) => {
    const stars = [];
    const rounded = Math.round(ratingVal);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-panel bg-white/70 p-4 md:p-6 rounded-2xl border border-[#eae8e4]/60 shadow-luxury">
      {/* LEFT COLUMN: Gallery */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Main High-Res Viewer */}
        <div className="relative w-full aspect-square bg-white border border-[#eae8e4]/60 rounded-xl overflow-hidden group">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[activeImageIndex]}
              alt={product.name}
              fill
              priority
              className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6a7571] text-sm">
              No Product Image
            </div>
          )}
          {activeDiscount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1.5 rounded-md shadow-sm">
              {activeDiscount}% OFF
            </span>
          )}
        </div>

        {/* Thumbnails Row */}
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 bg-white border rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                  idx === activeImageIndex 
                    ? "border-[#b89d70] ring-2 ring-[#b89d70]/20" 
                    : "border-[#eae8e4] hover:border-[#b89d70]/40"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-1 mix-blend-multiply"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Details & Actions */}
      <div className="lg:col-span-7 flex flex-col">
        {/* Brand & Name */}
        <div className="mb-4">
          {product.brand && (
            <span className="text-sm font-semibold text-[#b89d70] uppercase tracking-wide font-serif">
              {product.brand}
            </span>
          )}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#123026] font-serif mt-1">
            {product.name}
          </h1>
          
          {/* Rating & Reviews Summarized */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center bg-[#123026]/10 text-[#123026] border border-[#123026]/20 text-xs font-bold px-2 py-0.5 rounded-md gap-0.5">
              <span>{Number(product?.rating || 0).toFixed(1)}</span>
              <Star className="w-3 h-3 fill-[#123026] text-[#123026]" />
            </div>
            <span className="text-sm text-[#6a7571] font-medium">
              {product?.numReviews || 0} Ratings & {reviews.length} Reviews
            </span>
          </div>
        </div>

        <hr className="border-[#eae8e4]/60 my-4" />

        {/* Price Box */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#123026]">
              ${Number(activePrice || 0).toFixed(2)}
            </span>
            {activeDiscount > 0 && (
              <>
                <span className="text-base text-[#6a7571]/60 line-through">
                  ${Number(activeRegPrice || 0).toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {activeDiscount}% Off
                </span>
              </>
            )}
          </div>
          <div className="mt-3">{getStockBadge()}</div>
        </div>

        {/* Dynamic Attribute Selectors */}
        {product?.attributes && product.attributes.length > 0 && (
          <div className="mb-6 p-4 bg-[#f4f2ee]/40 rounded-xl border border-[#eae8e4]/60">
            {product.attributes.map((attr) => {
              if (!attr) return null;
              const name = attr.name || "";
              const isColor = name.toLowerCase() === "color" || attr.slug === "pa_color";
              const isSize = name.toLowerCase() === "size" || attr.slug === "pa_size";
 
              return (
                <div key={attr.id || name} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#123026] uppercase tracking-wider">
                      Select {name}
                    </span>
                    <span className="text-xs font-bold text-[#123026] bg-white/50 px-2 py-1 border border-[#eae8e4] rounded-md shadow-xs">
                      {selectedOpts[name] || "None"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {(attr.options || []).map((opt) => {
                      if (!opt) return null;
                      const isSelected = selectedOpts[name] === opt;
                      if (isColor) {
                        return (
                          <button
                            key={opt}
                            onClick={() => handleOptChange(name, opt)}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-[#123026] scale-110 shadow-sm"
                                : "border-transparent hover:scale-105"
                            }`}
                            title={opt}
                            type="button"
                          >
                            <span className={`w-7 h-7 rounded-full shadow-inner ${getColorClass(opt)}`} />
                          </button>
                        );
                      } else if (isSize) {
                        return (
                          <button
                            key={opt}
                            onClick={() => handleOptChange(name, opt)}
                            className={`min-w-[44px] px-3.5 py-2 border rounded-lg text-sm font-bold transition-all ${
                              isSelected
                                ? "border-[#123026] bg-[#123026]/5 text-[#123026] shadow-xs"
                                : "border-[#eae8e4] bg-white/50 text-[#123026]/80 hover:bg-[#123026]/5"
                            }`}
                            type="button"
                          >
                            {opt}
                          </button>
                        );
                      } else {
                        // Custom Attribute style
                        return (
                          <button
                            key={opt}
                            onClick={() => handleOptChange(name, opt)}
                            className={`px-3 py-1.5 border rounded-full text-xs font-bold transition-all ${
                              isSelected
                                ? "border-[#123026] bg-[#123026]/5 text-[#123026] shadow-xs"
                                : "border-[#eae8e4] bg-white/50 text-[#123026]/80 hover:bg-[#123026]/5"
                            }`}
                            type="button"
                          >
                            {opt}
                          </button>
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleAddToCart(false)}
            disabled={isOutOfStock}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
              isOutOfStock
                ? "bg-[#f4f2ee] border-[#eae8e4] text-[#6a7571] cursor-not-allowed"
                : "bg-white border-[#123026] text-[#123026] hover:bg-[#123026]/5 active:scale-[0.98]"
            }`}
            type="button"
          >
            <ShoppingBag className="w-5 h-5" /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white ${
              isOutOfStock
                ? "bg-[#f4f2ee] text-[#6a7571] cursor-not-allowed"
                : "bg-[#b89d70] hover:bg-[#c9b083] active:scale-[0.98] shadow-luxury"
            }`}
            type="button"
          >
            <Zap className="w-5 h-5 fill-white text-white" /> Buy Now
          </button>
        </div>
 
        {/* Description Section */}
        {product.description && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#123026] font-serif mb-2">Product Description</h2>
            <div className="text-sm text-[#6a7571] leading-relaxed pr-2">
              {product.description}
            </div>
          </div>
        )}

        {/* Specifications Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#123026] font-serif mb-3">Specifications</h2>
          <div className="border border-[#eae8e4]/60 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-sm text-left border-collapse">
              <tbody>
                <tr className="border-b border-[#eae8e4]/60 hover:bg-[#f4f2ee]/30">
                  <td className="w-1/3 p-3 font-semibold text-[#6a7571] bg-[#f4f2ee]/40">SKU</td>
                  <td className="p-3 text-[#123026] font-medium">{product.sku || "N/A"}</td>
                </tr>
                <tr className="border-b border-[#eae8e4]/60 hover:bg-[#f4f2ee]/30">
                  <td className="w-1/3 p-3 font-semibold text-[#6a7571] bg-[#f4f2ee]/40">Product Type</td>
                  <td className="p-3 text-[#123026] font-medium capitalize">{product.type}</td>
                </tr>
                {product.attributes && product.attributes.map((attr) => (
                  <tr key={attr.id || attr.name} className="border-b border-[#eae8e4]/60 last:border-0 hover:bg-[#f4f2ee]/30">
                    <td className="w-1/3 p-3 font-semibold text-[#6a7571] bg-[#f4f2ee]/40">{attr.name}</td>
                    <td className="p-3 text-[#123026] font-medium">
                      {attr.options ? attr.options.join(", ") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
 
        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#123026] font-serif mb-3">Customer Reviews</h2>
          {loadingReviews ? (
            <div className="flex items-center gap-2 text-[#6a7571] text-sm py-4">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading reviews...
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#f4f2ee]/40 rounded-xl border border-[#eae8e4]/60">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-[#123026]">{rev.reviewer}</span>
                    <span className="text-xs text-[#6a7571]/60">{new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(rev.rating)}
                  </div>
                  <p className="text-sm text-[#6a7571] leading-normal">{rev.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[#6a7571] italic py-4 bg-[#f4f2ee]/40 text-center rounded-xl border border-dashed border-[#eae8e4]">
              No Reviews Yet
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#123026] font-serif mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => {
                if (!p) return null;
                const discount = p.regularPrice > p.price
                  ? Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100)
                  : 0;
                return (
                  <Link
                    href={`/product/${p.slug}`}
                    key={p.id}
                    className="product-card group flex flex-col p-3 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative w-full aspect-square bg-white border border-[#eae8e4]/60 rounded-lg overflow-hidden mb-3">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name || "Product Image"}
                          fill
                          className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 50vw, 20vw"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6a7571]/60 text-[10px]">
                          No Image
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6a7571] uppercase font-semibold block mb-0.5 truncate">{p.brand || "Brand"}</span>
                    <h3 className="text-xs font-bold text-[#123026] font-serif group-hover:text-[#b89d70] transition-colors line-clamp-2 min-h-[32px] mb-2 leading-snug">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-auto">
                      <span className="text-sm font-extrabold text-[#123026]">${Number(p.price || 0).toFixed(2)}</span>
                      {discount > 0 && (
                        <span className="text-[10px] text-[#6a7571]/60 line-through">${Number(p.regularPrice || 0).toFixed(2)}</span>
                      )}
                    </div>
                    {Number(p.rating || 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] bg-[#123026]/10 text-[#123026] border border-[#123026]/20 font-bold px-1 py-0.25 rounded flex items-center gap-0.5">
                          {Number(p.rating || 0).toFixed(1)} <Star className="w-2 h-2 fill-[#123026] text-[#123026]" />
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
