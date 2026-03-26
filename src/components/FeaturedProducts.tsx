import { useProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useProducts({ featured: true });

  if (isLoading) return <div className="container py-12 text-center text-muted-foreground font-body">Loading products...</div>;

  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground font-body text-sm mt-1">Handpicked just for you</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
