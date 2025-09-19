-- Complete Database Setup for H&HBC SHOPPE
-- Run this script in your Supabase SQL Editor

-- 1. First, create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT TRUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Create the vouchers table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses integer,
  used_count integer DEFAULT 0 CHECK (used_count >= 0),
  is_active boolean DEFAULT TRUE,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  contact_number text NOT NULL,
  shipping_address jsonb NOT NULL,
  shipping_method text NOT NULL,
  shipping_fee numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL,
  voucher_discount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  voucher_id uuid REFERENCES public.vouchers(id),
  voucher_code text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create the order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.menu_items(id),
  product_name text NOT NULL,
  product_description text,
  base_price numeric NOT NULL,
  discounted_price numeric,
  quantity integer NOT NULL,
  variation_id uuid REFERENCES public.variations(id),
  variation_name text,
  variation_price numeric DEFAULT 0,
  add_ons jsonb DEFAULT '[]'::jsonb,
  item_total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users (is_active);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers (code);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON public.vouchers (is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_expires_at ON public.vouchers (expires_at);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_voucher_id ON public.orders (voucher_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- 6. Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_users_updated_at') THEN
    CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vouchers_updated_at') THEN
    CREATE TRIGGER update_vouchers_updated_at
    BEFORE UPDATE ON public.vouchers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 9. Create a function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  order_num text;
  counter integer;
BEGIN
  -- Get the current date in YYYYMMDD format
  order_num := to_char(now(), 'YYYYMMDD');
  
  -- Get the count of orders for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS integer)), 0) + 1
  INTO counter
  FROM public.orders
  WHERE order_number LIKE order_num || '%';
  
  -- Format as YYYYMMDD-XXXX
  order_num := order_num || '-' || LPAD(counter::text, 4, '0');
  
  RETURN order_num;
END;
$$ language 'plpgsql';

-- 10. Create a trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_order_number_trigger') THEN
    CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_number();
  END IF;
END $$;

-- 11. Create RLS policies (simplified for immediate functionality)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users to read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin to manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to read vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow admin to manage vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow all authenticated users to read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all authenticated users to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all authenticated users to read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow all authenticated users to insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin to manage order_items" ON public.order_items;

-- Create new simplified policies
CREATE POLICY "Allow all authenticated users to manage admin_users"
ON public.admin_users FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage vouchers"
ON public.vouchers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage order_items"
ON public.order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 12. Insert some test data
-- Insert test vouchers
INSERT INTO public.vouchers (code, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at) VALUES
('WELCOME10', 'percentage', 10, 0, 100, TRUE, '2025-12-31 23:59:59+00'),
('SAVE50', 'fixed', 50, 200, 50, TRUE, '2024-11-30 23:59:59+00'),
('NEWYEAR20', 'percentage', 20, 500, 25, TRUE, '2025-02-28 23:59:59+00')
ON CONFLICT (code) DO NOTHING;

-- Insert a placeholder admin user (replace with your actual user ID)
INSERT INTO public.admin_users (user_id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@h&hbcshoppe.com', 'Admin User', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- 13. Verify tables were created
SELECT 'Database setup completed successfully!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admin_users', 'vouchers', 'orders', 'order_items');
