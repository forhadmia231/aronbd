import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, string>;

export const usePageContent = (page: string, section?: string) => {
  return useQuery({
    queryKey: ["pageContent", page, section],
    queryFn: async () => {
      let query = supabase
        .from("page_content")
        .select("*")
        .eq("page", page);
      if (section) query = query.eq("section", section);

      const { data, error } = await query;
      if (error) throw error;

      const map: ContentMap = {};
      (data || []).forEach((row: any) => {
        map[`${row.section}.${row.content_key}`] = row.value;
      });
      return map;
    },
  });
};

export const useAllPageContent = () => {
  return useQuery({
    queryKey: ["pageContent", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("page")
        .order("section")
        .order("content_key");
      if (error) throw error;
      return data || [];
    },
  });
};

export const uploadCmsImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("cms-uploads")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage
    .from("cms-uploads")
    .getPublicUrl(path);

  return data.publicUrl;
};

export const upsertPageContent = async (
  page: string,
  section: string,
  content_key: string,
  value: string,
  content_type: string = "text"
) => {
  const { data, error } = await supabase
    .from("page_content")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("page", page)
    .eq("section", section)
    .eq("content_key", content_key)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    const { error: insertErr } = await supabase
      .from("page_content")
      .insert({ page, section, content_key, content_type, value });
    if (insertErr) throw insertErr;
  }
};
