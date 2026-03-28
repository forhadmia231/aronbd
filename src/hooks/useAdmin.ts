import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return !!data;
    },
    enabled: !!user,
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      const settings: Record<string, string> = {};
      (data || []).forEach((s: any) => {
        settings[s.key] = s.value;
      });
      return settings;
    },
  });
};
