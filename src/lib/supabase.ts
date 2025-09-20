import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          category: string;
          images: string[];
          popular: boolean;
          available: boolean;
          brand: string | null;
          ingredients: string[];
          weight: string | null;
          sku: string | null;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          category: string;
          images?: string[];
          popular?: boolean;
          available?: boolean;
          brand?: string | null;
          ingredients?: string[];
          weight?: string | null;
          sku?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          category?: 'hair-care' | 'cosmetics' | 'skin-care' | 'nail-care';
          images?: string[];
          popular?: boolean;
          available?: boolean;
          brand?: string | null;
          ingredients?: string[];
          weight?: string | null;
          sku?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variations: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          images: string[];
          sku: string | null;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price?: number;
          images?: string[];
          sku?: string | null;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price?: number;
          images?: string[];
          sku?: string | null;
          stock?: number;
          created_at?: string;
        };
      };
      product_add_ons: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          category: string;
          image: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          category: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price?: number;
          category?: string;
          image?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string | null;
          contact_number: string;
          shipping_address: any;
          shipping_method: 'cod-delivery' | 'cop-lbc-branch' | 'other-courier';
          payment_method: 'gcash' | 'maya' | 'bank-transfer' | 'cod';
          reference_number: string | null;
          subtotal: number;
          shipping_fee: number;
          total: number;
          notes: string | null;
          order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email?: string | null;
          contact_number: string;
          shipping_address: any;
          shipping_method: 'cod-delivery' | 'cop-lbc-branch' | 'other-courier';
          payment_method: 'gcash' | 'maya' | 'bank-transfer' | 'cod';
          reference_number?: string | null;
          subtotal: number;
          shipping_fee: number;
          total: number;
          notes?: string | null;
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string | null;
          contact_number?: string;
          shipping_address?: any;
          shipping_method?: 'cod-delivery' | 'cop-lbc-branch' | 'other-courier';
          payment_method?: 'gcash' | 'maya' | 'bank-transfer' | 'cod';
          reference_number?: string | null;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          notes?: string | null;
          order_status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variation_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          selected_add_ons: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variation_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          selected_add_ons?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variation_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          selected_add_ons?: any;
          created_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active: boolean;
          sort_order: number;
          cod_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active?: boolean;
          sort_order?: number;
          cod_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          account_number?: string;
          account_name?: string;
          qr_code_url?: string;
          active?: boolean;
          sort_order?: number;
          cod_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};