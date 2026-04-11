import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/hooks/usePageContent";

const PromoBanner = () => {
  const { data: content } = usePageContent("home", "promo");

  const c = (key: string, fallback: string) => content?.[`promo.${key}`] || fallback;

  return (
    <section className="container py-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-lg p-8 md:p-10 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body mb-2">
            {c("label", "Limited Offer")}
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
            {c("title", "Up to 40% Off")}
          </h3>
          <p className="text-muted-foreground font-body text-sm mb-4">
            {c("description", "Grab the best deals before they're gone")}
          </p>
          <Link to="/products">
            <Button variant="outline" className="w-fit font-body">
              {c("button_text", "Shop Sale")}
            </Button>
          </Link>
        </div>
        <div className="relative rounded-lg overflow-hidden aspect-[16/9] md:aspect-auto">
          <img
            src={c("image", "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop")}
            alt="Promotional sale"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 to-transparent flex items-center">
            <div className="p-8">
              <p className="text-primary-foreground font-display text-2xl font-bold">
                {c("overlay_title", "Free Shipping")}
              </p>
              <p className="text-primary-foreground/80 text-sm font-body">
                {c("overlay_subtitle", "On orders above ৳3,000")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
