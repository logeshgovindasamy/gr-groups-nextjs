"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Filter, SlidersHorizontal, Search, X, Check, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import useLanguageStore from "@/store/useLanguageStore";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguageStore();

  // API State
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters from WooCommerce API
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    colors: [],
    categories: [],
    tags: []
  });
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Mobile drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Client-side brand search state
  const [brandSearch, setBrandSearch] = useState("");

  // Extract current filters from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "popularity";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentAvailability = searchParams.get("availability") || "";
  const currentPage = Number(searchParams.get("page") || "1");

  // Selected Brands, Colors & Tags parsed from URL comma-separated values
  const currentBrands = searchParams.get("brand") ? searchParams.get("brand").split(",") : [];
  const currentColors = searchParams.get("color") ? searchParams.get("color").split(",") : [];
  const currentTags = searchParams.get("tag") ? searchParams.get("tag").split(",") : [];

  // Temporary inputs for pricing (to debounce updates)
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch filter options
  useEffect(() => {
    async function loadFilters() {
      try {
        setLoadingFilters(true);
        const res = await fetch("/api/attributes");
        const data = await res.json();
        if (data.success) {
          setFilterOptions({
            brands: data.brands || [],
            colors: data.colors || [],
            categories: data.categories || [],
            tags: data.tags || []
          });
        }
      } catch (err) {
        console.error("Failed to load WooCommerce filters:", err);
      } finally {
        setLoadingFilters(false);
      }
    }
    loadFilters();
  }, []);

  // Fetch products matching URL params
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(searchParams.toString());
      if (!query.has("page")) query.set("page", String(currentPage));
      if (!query.has("sort")) query.set("sort", currentSort);
      query.set("lang", locale);

      const res = await fetch(`/api/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const totalCount = Number(res.headers.get("X-Total-Count") || "0");
        const pages = Number(res.headers.get("X-Total-Pages") || "1");

        setProducts(data || []);
        setTotalProducts(totalCount);
        setTotalPages(pages);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage, currentSort, locale]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync inputs with URL changes
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
    setSearchInput(currentSearch);
  }, [currentMinPrice, currentMaxPrice, currentSearch]);

  // Debounced filter handler for text/range inputs
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      if (searchInput !== currentSearch) {
        if (searchInput) params.set("search", searchInput);
        else params.delete("search");
        params.set("page", "1");
        changed = true;
      }
      if (minPriceInput !== currentMinPrice) {
        if (minPriceInput) params.set("minPrice", minPriceInput);
        else params.delete("minPrice");
        params.set("page", "1");
        changed = true;
      }
      if (maxPriceInput !== currentMaxPrice) {
        if (maxPriceInput) params.set("maxPrice", maxPriceInput);
        else params.delete("maxPrice");
        params.set("page", "1");
        changed = true;
      }

      if (changed) {
        router.push(`/products?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, minPriceInput, maxPriceInput, currentSearch, currentMinPrice, currentMaxPrice, searchParams, router]);

  // General URL state update helper
  const updateURLParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === "") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });
    if (!updates.page) {
      params.set("page", "1");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Toggle brand selections
  const handleBrandToggle = (brandName) => {
    let nextBrands = [...currentBrands];
    if (nextBrands.includes(brandName)) {
      nextBrands = nextBrands.filter((b) => b !== brandName);
    } else {
      nextBrands.push(brandName);
    }
    updateURLParams({ brand: nextBrands.join(",") });
  };

  // Toggle color selections
  const handleColorToggle = (colorName) => {
    let nextColors = [...currentColors];
    if (nextColors.includes(colorName)) {
      nextColors = nextColors.filter((c) => c !== colorName);
    } else {
      nextColors.push(colorName);
    }
    updateURLParams({ color: nextColors.join(",") });
  };

  // Toggle tag selections
  const handleTagToggle = (tagName) => {
    let nextTags = [...currentTags];
    if (nextTags.includes(tagName)) {
      nextTags = nextTags.filter((t) => t !== tagName);
    } else {
      nextTags.push(tagName);
    }
    updateURLParams({ tag: nextTags.join(",") });
  };

  // Remove individual filter chip
  const removeChip = (key, value) => {
    if (key === "brand") {
      const next = currentBrands.filter((b) => b !== value);
      updateURLParams({ brand: next.join(",") });
    } else if (key === "color") {
      const next = currentColors.filter((c) => c !== value);
      updateURLParams({ color: next.join(",") });
    } else if (key === "tag") {
      const next = currentTags.filter((t) => t !== value);
      updateURLParams({ tag: next.join(",") });
    } else {
      updateURLParams({ [key]: "" });
    }
  };

  const clearAllFilters = () => {
    router.push("/products", { scroll: false });
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchInput("");
  };

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

  const filteredBrandsList = filterOptions.brands.filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const activeFiltersCount =
    currentBrands.length +
    currentColors.length +
    currentTags.length +
    (currentCategory ? 1 : 0) +
    (currentSearch ? 1 : 0) +
    (currentMinPrice ? 1 : 0) +
    (currentMaxPrice ? 1 : 0) +
    (currentRating ? 1 : 0) +
    (currentAvailability ? 1 : 0);

  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 animate-pulse">
        <div className="w-full aspect-square bg-slate-100 rounded-lg mb-4" />
        <div className="h-3 w-1/3 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-100 rounded mb-3" />
        <div className="h-4 w-1/4 bg-slate-100 rounded mb-2" />
        <div className="flex gap-2">
          <div className="h-3 w-10 bg-slate-100 rounded" />
          <div className="h-3 w-10 bg-slate-100 rounded" />
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top Navbar Header */}
      <div className="bg-white/50 backdrop-blur-md border-b border-[#eae8e4]/60 sticky top-0 z-20 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-[#123026] font-serif uppercase">CATALOG</h1>
            <span className="text-xs text-[#6a7571] font-bold bg-[#f4f2ee] px-2 py-0.5 rounded-full">
              {totalProducts} Products Found
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6a7571]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-[#eae8e4] rounded-lg text-sm bg-white/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b89d70]/20"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 glass-panel bg-white/70 p-5 rounded-2xl border border-[#eae8e4]/60 sticky top-24 shadow-luxury max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold text-[#123026] flex items-center gap-1.5 font-serif uppercase">
                <Filter className="w-4 h-4 text-[#b89d70]" /> Filters
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <hr className="border-[#eae8e4]/60 mb-5" />

            {/* Availability Filter */}
            <div className="mb-5">
              <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Availability</span>
              <label className="flex items-center gap-2 text-sm text-[#123026]/90 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentAvailability === "instock"}
                  onChange={(e) => updateURLParams({ availability: e.target.checked ? "instock" : "" })}
                  className="rounded text-[#123026] focus:ring-[#123026]/20 border-[#eae8e4] w-4 h-4"
                />
                Exclude Out of Stock
              </label>
            </div>

            {/* Dynamic Categories Section */}
            {filterOptions.categories.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Categories</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => updateURLParams({ category: "" })}
                    className={`w-full text-left text-sm py-1 px-2.5 rounded-lg font-bold transition-all ${currentCategory === ""
                      ? "bg-[#123026]/5 text-[#123026]"
                      : "text-[#123026]/80 hover:bg-[#123026]/5"
                      }`}
                  >
                    All Categories
                  </button>
                  {filterOptions.categories.map((cat) => {
                    const isSelected = currentCategory.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => updateURLParams({ category: cat.name })}
                        className={`w-full text-left text-sm py-1 px-2.5 rounded-lg font-bold transition-all ${isSelected
                          ? "bg-[#123026]/5 text-[#123026]"
                          : "text-[#123026]/80 hover:bg-[#123026]/5"
                          }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Tags Section */}
            {filterOptions.tags && filterOptions.tags.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Tags</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {filterOptions.tags.map((tag) => {
                    const isSelected = currentTags.some(t => t.toLowerCase() === tag.name.toLowerCase());
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.name)}
                        className={`w-full text-left text-sm py-1 px-2.5 rounded-lg font-bold transition-all flex items-center justify-between ${isSelected
                          ? "bg-[#123026]/5 text-[#123026]"
                          : "text-[#123026]/80 hover:bg-[#123026]/5"
                          }`}
                      >
                        <span>{tag.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#123026]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Brands Section */}
            {filterOptions.brands.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Brands</span>
                {filterOptions.brands.length > 5 && (
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-[#6a7571] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-[#eae8e4] rounded-md text-xs focus:outline-none"
                    />
                  </div>
                )}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {filteredBrandsList.map((brand) => {
                    const isChecked = currentBrands.includes(brand);
                    return (
                      <label key={brand} className="flex items-center gap-2 text-sm text-[#123026]/90 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand)}
                          className="rounded text-[#123026] focus:ring-[#123026]/20 border-[#eae8e4] w-4 h-4"
                        />
                        {brand}
                      </label>
                    );
                  })}
                  {filteredBrandsList.length === 0 && (
                    <span className="text-xs text-[#6a7571] italic">No brands matched</span>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Colors Section */}
            {filterOptions.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Colors</span>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.map((color) => {
                    const isSelected = currentColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorToggle(color)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                          ? "border-[#123026] scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                          }`}
                        title={color}
                        type="button"
                      >
                        <span className={`w-5 h-5 rounded-full shadow-inner ${getColorClass(color)}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Filter Section */}
            <div className="mb-6">
              <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Price Range</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#eae8e4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#b89d70]/20"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#eae8e4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#b89d70]/20"
                />
              </div>
            </div>

            {/* Rating Filter Section */}
            <div>
              <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Ratings</span>
              <div className="space-y-2">
                {[4, 3].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateURLParams({ rating: currentRating === String(stars) ? "" : String(stars) })}
                    className={`w-full text-left text-sm py-1.5 px-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${currentRating === String(stars)
                      ? "bg-[#123026]/5 text-[#123026]"
                      : "text-[#123026]/80 hover:bg-[#123026]/5"
                      }`}
                  >
                    <span>{stars}★ & Above</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT LIST LAYER */}
          <main className="lg:col-span-9 flex flex-col gap-6">
            {/* Header controls: Sort, Chips, Mobile filters trigger */}
            <div className="glass-panel bg-white/70 p-4 rounded-2xl border border-[#eae8e4]/60 shadow-luxury flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Mobile Filter buttons layout */}
                <div className="flex items-center gap-2 lg:hidden w-full sm:w-auto">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#eae8e4] rounded-xl text-sm font-bold text-[#123026]/90 bg-[#f4f2ee]/50 hover:bg-[#f4f2ee]"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#6a7571]" /> Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-[#123026] text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Desktop Sort dropdown */}
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                  <span className="text-xs font-bold text-[#6a7571] flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
                  </span>
                  <select
                    value={currentSort}
                    onChange={(e) => updateURLParams({ sort: e.target.value })}
                    className="text-sm font-bold text-[#123026] border border-[#eae8e4] rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:border-[#b89d70]/40 bg-white/50"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-extrabold text-[#6a7571] mr-1">ACTIVE:</span>

                  {currentCategory && (() => {
                    const matchedCat = filterOptions.categories.find(c => c.name.toLowerCase() === currentCategory.toLowerCase());
                    const displayLabel = matchedCat ? matchedCat.name : currentCategory;
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                        Category: {displayLabel}
                        <button onClick={() => removeChip("category")}><X className="w-3 h-3 hover:scale-110" /></button>
                      </span>
                    );
                  })()}
                  {currentSearch && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Search: {currentSearch}
                      <button onClick={() => removeChip("search")}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  )}
                  {currentBrands.map((brand) => (
                    <span key={brand} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Brand: {brand}
                      <button onClick={() => removeChip("brand", brand)}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  ))}
                  {currentColors.map((color) => (
                    <span key={color} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Color: {color}
                      <button onClick={() => removeChip("color", color)}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  ))}
                  {currentTags.map((tagCode) => {
                    const matchedTag = filterOptions.tags.find(t => t.name.toLowerCase() === tagCode.toLowerCase());
                    const displayLabel = matchedTag ? matchedTag.name : tagCode;
                    return (
                      <span key={tagCode} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                        Tag: {displayLabel}
                        <button onClick={() => removeChip("tag", tagCode)}><X className="w-3 h-3 hover:scale-110" /></button>
                      </span>
                    );
                  })}
                  {currentMinPrice && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Min Price: ${currentMinPrice}
                      <button onClick={() => removeChip("minPrice")}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  )}
                  {currentMaxPrice && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Max Price: ${currentMaxPrice}
                      <button onClick={() => removeChip("maxPrice")}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  )}
                  {currentRating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Rating: {currentRating}★+
                      <button onClick={() => removeChip("rating")}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  )}
                  {currentAvailability && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#123026]/5 text-[#123026] text-xs font-bold rounded-lg border border-[#123026]/10">
                      Availability: In Stock
                      <button onClick={() => removeChip("availability")}><X className="w-3 h-3 hover:scale-110" /></button>
                    </span>
                  )}

                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-extrabold text-red-500 hover:text-red-600 underline underline-offset-2 ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                renderSkeletons()
              ) : products.length > 0 ? (
                products.map((p) => {
                  const discount = p.regularPrice > p.price
                    ? Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100)
                    : 0;

                  const isOutOfStock = p.stockStatus === "outofstock" || p.stock <= 0;

                  return (
                    <Link
                      href={`/product/${p.slug}`}
                      key={p.id}
                      className="product-card group flex flex-col p-3 md:p-4 hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Image Preview Box */}
                      <div className="relative w-full aspect-square bg-white border border-[#eae8e4]/60 rounded-xl overflow-hidden mb-4">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-contain p-3 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                          loading="lazy"
                        />

                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-1 rounded shadow-xs">
                            {discount}% OFF
                          </span>
                        )}

                        {/* Out of Stock Ribbon */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Brand Label */}
                      {p.brand && (
                        <span className="text-[10px] font-bold text-[#6a7571] uppercase tracking-wider block mb-0.5 truncate">
                          {p.brand}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="text-sm font-bold text-[#123026] font-serif leading-snug group-hover:text-[#b89d70] transition-colors line-clamp-2 min-h-[36px] mb-2">
                        {p.name}
                      </h3>

                      {/* Rating Banner */}
                      {p.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-[10px] font-bold text-[#123026] bg-[#123026]/10 border border-[#123026]/20 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                            {p.rating.toFixed(1)} <Star className="w-2.5 h-2.5 fill-[#123026] text-[#123026]" />
                          </span>
                          <span className="text-[10px] text-[#6a7571] font-semibold">({p.numReviews})</span>
                        </div>
                      )}

                      {/* Prices */}
                      <div className="flex items-baseline gap-2 mt-auto">
                        <span className="text-base font-black text-[#123026]">${p.price.toFixed(2)}</span>
                        {discount > 0 && (
                          <span className="text-xs text-[#6a7571]/60 line-through">${p.regularPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Stock levels message */}
                      {!isOutOfStock && p.stock <= 5 && (
                        <span className="text-[10px] font-bold text-amber-600 mt-2 block">
                          Only {p.stock} left in stock!
                        </span>
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center glass-panel bg-white/70 border border-[#eae8e4]/60 rounded-2xl">
                  <span className="text-[#6a7571] text-sm font-bold">No products found matching your active filters.</span>
                </div>
              )}
            </div>

            {/* SERVER PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => updateURLParams({ page: currentPage - 1 })}
                  disabled={currentPage <= 1}
                  className={`p-2 rounded-lg border border-[#eae8e4] bg-white/50 transition-all ${currentPage <= 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-[#123026] hover:bg-[#123026]/5 hover:border-[#b89d70]/40"
                    }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    const isCurrent = pNum === currentPage;
                    return (
                      <button
                        key={pNum}
                        onClick={() => updateURLParams({ page: pNum })}
                        className={`w-9 h-9 text-sm font-bold rounded-lg border transition-all ${isCurrent
                          ? "bg-[#123026] border-[#123026] text-white shadow-sm"
                          : "bg-white/50 border-[#eae8e4] text-[#123026]/80 hover:bg-[#123026]/5"
                          }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => updateURLParams({ page: currentPage + 1 })}
                  disabled={currentPage >= totalPages}
                  className={`p-2 rounded-lg border border-[#eae8e4] bg-white/50 transition-all ${currentPage >= totalPages
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-[#123026] hover:bg-[#123026]/5 hover:border-[#b89d70]/40"
                    }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Drawer Backdrop */}
          <div
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-[#123026]/30 backdrop-blur-xs transition-opacity"
          />

          {/* Sliding container sheet */}
          <div className="relative w-full max-h-[85vh] bg-background rounded-t-2xl shadow-2xl border-t border-[#eae8e4]/80 flex flex-col z-10 transition-transform">

            {/* Sheet Title */}
            <div className="flex items-center justify-between p-4 border-b border-[#eae8e4]/60">
              <span className="text-base font-extrabold text-[#123026] flex items-center gap-1.5 font-serif uppercase">
                <Filter className="w-4.5 h-4.5 text-[#b89d70]" /> Filters
              </span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-[#123026]/5 text-[#6a7571] hover:text-[#123026]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters list inside sheet */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Availability Filter */}
              <div>
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Availability</span>
                <label className="flex items-center gap-2 text-sm text-[#123026] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentAvailability === "instock"}
                    onChange={(e) => updateURLParams({ availability: e.target.checked ? "instock" : "" })}
                    className="rounded text-[#123026] focus:ring-[#123026]/20 border-[#eae8e4] w-4 h-4"
                  />
                  Exclude Out of Stock
                </label>
              </div>

              {/* Dynamic Categories */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateURLParams({ category: "" })}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${currentCategory === ""
                        ? "bg-[#123026]/5 border-[#123026]/20 text-[#123026]"
                        : "bg-white/50 border-[#eae8e4] text-[#123026]/80"
                        }`}
                    >
                      All Categories
                    </button>
                    {filterOptions.categories.map((cat) => {
                      const isSelected = currentCategory.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          onClick={() => updateURLParams({ category: cat.name })}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${isSelected
                            ? "bg-[#123026]/5 border-[#123026]/20 text-[#123026]"
                            : "bg-white/50 border-[#eae8e4] text-[#123026]/80"
                            }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Tags */}
              {filterOptions.tags && filterOptions.tags.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.tags.map((tag) => {
                      const isSelected = currentTags.some(t => t.toLowerCase() === tag.name.toLowerCase());
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.name)}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${isSelected
                            ? "bg-[#123026]/5 border-[#123026]/20 text-[#123026]"
                            : "bg-white/50 border-[#eae8e4] text-[#123026]/80"
                            }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Brands */}
              {filterOptions.brands.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Brands</span>
                  {filterOptions.brands.length > 5 && (
                    <div className="relative mb-3">
                      <Search className="w-3.5 h-3.5 text-[#6a7571]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-[#eae8e4] rounded-md text-xs focus:outline-none bg-white/50"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
                    {filteredBrandsList.map((brand) => {
                      const isChecked = currentBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          onClick={() => handleBrandToggle(brand)}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all border ${isChecked
                            ? "bg-[#123026]/5 border-[#123026]/20 text-[#123026]"
                            : "bg-white/50 border-[#eae8e4] text-[#123026]/80"
                            }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Colors */}
              {filterOptions.colors.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Colors</span>
                  <div className="flex flex-wrap gap-2.5">
                    {filterOptions.colors.map((color) => {
                      const isSelected = currentColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorToggle(color)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                            ? "border-[#123026] scale-110 shadow-sm"
                            : "border-transparent hover:scale-105"
                            }`}
                          title={color}
                          type="button"
                        >
                          <span className={`w-6 h-6 rounded-full shadow-inner ${getColorClass(color)}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price inputs */}
              <div>
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Price Range</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#eae8e4] rounded-md text-sm bg-white/50"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#eae8e4] rounded-md text-sm bg-white/50"
                  />
                </div>
              </div>

              {/* Rating selection */}
              <div>
                <span className="text-xs font-bold text-[#6a7571] uppercase tracking-wider block mb-3">Ratings</span>
                <div className="flex gap-2">
                  {[4, 3].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => updateURLParams({ rating: currentRating === String(stars) ? "" : String(stars) })}
                      className={`flex-1 text-center text-xs py-2 border rounded-lg font-bold transition-all ${currentRating === String(stars)
                        ? "bg-[#123026]/5 border-[#123026]/20 text-[#123026]"
                        : "text-[#123026]/80 border-[#eae8e4] bg-white/50"
                        }`}
                    >
                      {stars}★ & Above
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions inside mobile sheet */}
            <div className="p-4 border-t border-[#eae8e4]/60 grid grid-cols-2 gap-3 bg-[#f4f2ee]/50 rounded-b-2xl">
              <button
                onClick={clearAllFilters}
                className="w-full py-3 border border-[#eae8e4] bg-white/50 rounded-xl text-sm font-bold text-[#123026] hover:bg-[#123026]/5"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#123026] text-[#b89d70] rounded-xl text-sm font-bold hover:bg-[#1b4335]"
              >
                Apply Filters
              </button>
            </div></div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-accent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
