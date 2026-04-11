import { useProducts } from "@/hooks/useProducts";
import { usePageContent } from "@/hooks/usePageContent";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useProducts({ featured: true });
  const { data: content } = usePageContent("home", "featured");

  const c = (key: string, fallback: string) => content?.[`featured.${key}`] || fallback;

  if (isLoading) return <div className="container py-12 text-center text-muted-foreground font-body">Loading products...</div>;

  return (
    <section className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{c("title", "Featured Products")}</h2>
          <p className="text-muted-foreground font-body text-sm mt-1">{c("subtitle", "Handpicked just for you")}</p>
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
