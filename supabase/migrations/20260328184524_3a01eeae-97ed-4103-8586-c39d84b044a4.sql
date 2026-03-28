CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings viewable by everyone" ON public.site_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('logo_text', 'aronbd.com'),
  ('primary_color', '0 0% 12%'),
  ('accent_color', '0 0% 93%');