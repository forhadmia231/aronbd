import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleBuyNow = () => {
    if (product && product.in_stock) {
      addToCart(product, quantity);
      navigate("/checkout");
    }
  };

  if (isLoading) {
    return <Layout><div className="container py-16 text-center text-muted-foreground font-body">Loading...</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground font-body">Product not found.</p>
          <Link to="/products"><Button variant="outline" className="mt-4 font-body">Back to Products</Button></Link>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length ? product.images : [product.image || "/placeholder.svg"];
  const related = allProducts.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground font-body mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
              <img src={images[selectedImage]} alt={product.name} className="object-cover w-full h-full" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body mb-1">{product.category_name}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-foreground text-foreground" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-body">{product.rating} ({product.review_count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold">৳{product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through font-body">৳{product.original_price.toLocaleString()}</span>
                  <span className="text-sm font-body text-emerald-600 font-medium">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-sm font-body">
              <span className={product.in_stock ? "text-emerald-600" : "text-destructive"}>
                {product.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-body font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button size="lg" className="flex-1 gap-2 font-body" variant="outline" disabled={!product.in_stock} onClick={() => addToCart(product, quantity)}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
            <Button size="lg" className="w-full gap-2 font-body" disabled={!product.in_stock} onClick={handleBuyNow}>
              <Zap className="h-4 w-4" /> Buy Now
            </Button>

            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-accent text-accent-foreground px-2 py-1 rounded font-body">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (<ProductCard key={p.id} product={p} />))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
