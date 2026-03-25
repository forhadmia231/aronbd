import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative bg-surface overflow-hidden">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body font-medium">
              New Season Collection
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Discover Your
              <br />
              <span className="text-muted-foreground">Perfect Style</span>
            </h1>
            <p className="text-muted-foreground font-body max-w-md leading-relaxed">
              Explore our curated collection of premium products. Quality craftsmanship meets modern design.
            </p>
            <div className="flex gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2 font-body">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="font-body">
                  View All
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
              alt="Shop collection"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
