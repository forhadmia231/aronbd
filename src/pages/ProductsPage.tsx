import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Star, SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (p.rating < minRating) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [selectedCategory, priceRange, minRating, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Categories</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => { setSelectedCategory(""); setSearchParams({}); }}
            className={`block text-sm font-body w-full text-left py-1 px-2 rounded transition-colors ${
              !selectedCategory ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSearchParams({ category: cat.id }); }}
              className={`block text-sm font-body w-full text-left py-1 px-2 rounded transition-colors ${
                selectedCategory === cat.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name} ({cat.productCount})
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={10000}
          min={0}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-body">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Minimum Rating</h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-1 text-sm font-body w-full py-1 px-2 rounded transition-colors ${
                minRating === r ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              {Array.from({ length: r }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
              ))}
              <span className="text-muted-foreground ml-1">& up</span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full font-body">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">{filtered.length} products</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden font-body"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded-md px-3 py-1.5 bg-background font-body"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Mobile filters */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background md:hidden overflow-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <FilterPanel />
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-body">No products found matching your filters.</p>
                <Button variant="outline" className="mt-4 font-body" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
