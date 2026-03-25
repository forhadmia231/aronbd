import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-surface border-t mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-xl font-bold tracking-tight">
              aron<span className="text-muted-foreground font-light">bd</span>.com
            </Link>
            <p className="text-sm text-muted-foreground mt-3 font-body leading-relaxed">
              Your trusted destination for quality products at affordable prices. Shop with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li><Link to="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Best Sellers</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li><Link to="/" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-body">
              <li>Dhaka, Bangladesh</li>
              <li>support@aronbd.com</li>
              <li>+880 1234-567890</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} aronbd.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
