import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/types/product";

export const useProducts = (filters?: {
  categorySlug?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)");

      if (filters?.featured) {
        query = query.eq("featured", true);
      }

      if (filters?.categorySlug) {
        query = query.eq("categories.slug", filters.categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || [])
        .filter((p: any) => {
          if (filters?.categorySlug && !p.categories) return false;
          return true;
        })
        .map((p: any) => ({
          ...p,
          category_slug: p.categories?.slug || "",
          category_name: p.categories?.name || "",
        }));
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        category_slug: (data as any).categories?.slug || "",
        category_name: (data as any).categories?.name || "",
      };
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("*");
      if (error) throw error;

      // Get product counts
      const { data: products } = await supabase
        .from("products")
        .select("category_id");

      const counts: Record<string, number> = {};
      (products || []).forEach((p) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });

      return (cats || []).map((c) => ({
        ...c,
        product_count: counts[c.id] || 0,
      }));
    },
  });
};
