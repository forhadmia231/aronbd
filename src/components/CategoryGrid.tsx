import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const CategoryGrid = () => {
  return (
    <section className="container py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold">Shop by Category</h2>
        <p className="text-muted-foreground font-body text-sm mt-2">
          Browse our wide range of product categories
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            className="group relative aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <h3 className="text-primary-foreground font-body font-medium text-sm">{cat.name}</h3>
              <p className="text-primary-foreground/70 text-[11px] font-body">{cat.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
