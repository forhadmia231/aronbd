import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useAdmin";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const { data: settings } = useSiteSettings();

  const footerBg = settings?.footer_bg_color
    ? { backgroundColor: `hsl(${settings.footer_bg_color})` }
    : {};

  const phone = settings?.contact_phone || "+880 1234-567890";
  const email = settings?.contact_email || "support@aronbd.com";
  const address = settings?.contact_address || "Dhaka, Bangladesh";

  const socialLinks = [
    { key: "facebook_url", icon: Facebook, label: "Facebook" },
    { key: "instagram_url", icon: Instagram, label: "Instagram" },
    { key: "twitter_url", icon: Twitter, label: "Twitter" },
    { key: "youtube_url", icon: Youtube, label: "YouTube" },
  ].filter((s) => settings?.[s.key]);

  return (
    <footer className="border-t mt-16" style={footerBg}>
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
            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socialLinks.map((s) => (
                  <a
                    key={s.key}
                    href={settings?.[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={s.label}
                  >
                    <s.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
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
              <li>{address}</li>
              <li>{email}</li>
              <li>{phone}</li>
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
