
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-uploads', 'cms-uploads', true);

CREATE POLICY "Public can view cms uploads" ON storage.objects FOR SELECT USING (bucket_id = 'cms-uploads');
CREATE POLICY "Admins can upload cms files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cms files" ON storage.objects FOR UPDATE USING (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete cms files" ON storage.objects FOR DELETE USING (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  content_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page, section, content_key)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page content viewable by everyone" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage page content" ON public.page_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.page_content (page, section, content_key, content_type, value) VALUES
  ('home', 'hero', 'subtitle', 'text', 'New Season Collection'),
  ('home', 'hero', 'title_line1', 'text', 'Discover Your'),
  ('home', 'hero', 'title_line2', 'text', 'Perfect Style'),
  ('home', 'hero', 'description', 'text', 'Explore our curated collection of premium products. Quality craftsmanship meets modern design.'),
  ('home', 'hero', 'button1_text', 'text', 'Shop Now'),
  ('home', 'hero', 'button2_text', 'text', 'View All'),
  ('home', 'hero', 'image', 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'),
  ('home', 'categories', 'title', 'text', 'Shop by Category'),
  ('home', 'categories', 'subtitle', 'text', 'Browse our wide range of product categories'),
  ('home', 'featured', 'title', 'text', 'Featured Products'),
  ('home', 'featured', 'subtitle', 'text', 'Handpicked just for you'),
  ('home', 'promo', 'label', 'text', 'Limited Offer'),
  ('home', 'promo', 'title', 'text', 'Up to 40% Off'),
  ('home', 'promo', 'description', 'text', 'Grab the best deals before they are gone'),
  ('home', 'promo', 'button_text', 'text', 'Shop Sale'),
  ('home', 'promo', 'image', 'image', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop'),
  ('home', 'promo', 'overlay_title', 'text', 'Free Shipping'),
  ('home', 'promo', 'overlay_subtitle', 'text', 'On orders above ৳3,000'),
  ('global', 'header', 'top_bar_text', 'text', 'Free shipping on orders over ৳3,000 | Use code ARON10 for 10% off'),
  ('global', 'footer', 'brand_description', 'text', 'Your trusted destination for quality products at affordable prices. Shop with confidence.'),
  ('global', 'footer', 'copyright_text', 'text', 'aronbd.com. All rights reserved.');
