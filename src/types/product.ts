export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  image: string | null;
  images?: string[] | null;
  category_id: string | null;
  category_slug?: string;
  category_name?: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
  featured?: boolean | null;
  tags?: string[] | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  product_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  payment_method: 'cod' | 'stripe';
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}
