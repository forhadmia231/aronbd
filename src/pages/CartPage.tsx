import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground font-body mb-6">Start shopping to add items to your cart.</p>
          <Link to="/products">
            <Button className="font-body">Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                <Link to={`/products/${product.id}`} className="flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-body font-medium text-sm md:text-base line-clamp-1 hover:text-muted-foreground transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground font-body capitalize">{product.category}</p>
                  <p className="font-display font-bold mt-1">৳{product.price.toLocaleString()}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-body">{quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-surface rounded-lg p-6 h-fit sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{totalPrice >= 3000 ? "Free" : "৳100"}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="font-display">৳{(totalPrice + (totalPrice >= 3000 ? 0 : 100)).toLocaleString()}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-4 font-body" size="lg">Proceed to Checkout</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full mt-2 font-body">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
