export interface Variation {
  id: string;
  name: string;
  price: number;
  images: string[];
  image_url?: string; // Database field for single image
  sku?: string;
  stock?: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
  image?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  discountedPrice?: number;
  category: 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care';
  subcategory?: string;
  images: string[];
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  brand?: string;
  ingredients?: string[];
  weight?: string;
  sku?: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  email?: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: 'lbc-standard' | 'lbc-express' | 'lbc-same-day';
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer' | 'cod';
  referenceNumber?: string;
  total: number;
  shippingFee: number;
  notes?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer' | 'cod';
export type ShippingMethod = 'lbc-standard' | 'lbc-express' | 'lbc-same-day';
export type ProductCategory = 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Alias for backward compatibility
export type MenuItem = Product;