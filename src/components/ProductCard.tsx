import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold">
              -{discount}%
            </Badge>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-body mb-1">
          {product.category_name || ""}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-body font-medium text-sm leading-tight line-clamp-2 hover:text-muted-foreground transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3 w-3 fill-foreground text-foreground" />
          <span className="text-xs font-body text-muted-foreground">
            {product.rating} ({product.review_count})
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-base">৳{product.price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                ৳{product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              if (product.in_stock) addToCart(product);
            }}
            disabled={!product.in_stock}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
