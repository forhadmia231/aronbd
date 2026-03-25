import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const shipping = totalPrice >= 3000 ? 0 : 100;
  const total = totalPrice + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Order placed successfully! Thank you for shopping with us.");
    clearCart();
    navigate("/");
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Shipping info */}
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg">Shipping Information</h2>

              <div>
                <Label className="font-body text-sm">Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="font-body mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-body text-sm">Phone Number *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1XXXXXXXXX"
                  className="font-body mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-body text-sm">Address *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                  className="font-body mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-body text-sm">City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="font-body mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="font-body text-sm">Postal Code</Label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="1000"
                    className="font-body mt-1"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="pt-4">
                <h2 className="font-display font-semibold text-lg mb-3">Payment Method</h2>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-accent" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-foreground"
                    />
                    <div>
                      <p className="font-body font-medium text-sm">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground font-body">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "stripe" ? "border-primary bg-accent" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="accent-foreground"
                    />
                    <div>
                      <p className="font-body font-medium text-sm">Online Payment</p>
                      <p className="text-xs text-muted-foreground font-body">Pay via Stripe (coming soon)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-surface rounded-lg p-6 h-fit">
              <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-body">Qty: {quantity}</p>
                    </div>
                    <span className="text-sm font-body font-medium">৳{(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `৳${shipping}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="font-display">৳{total.toLocaleString()}</span>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 font-body" size="lg">
                Place Order
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
