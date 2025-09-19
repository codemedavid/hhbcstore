-- Create the orders table
CREATE TABLE public.orders (
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

-- Create the order_items table for individual items in each order
CREATE TABLE public.order_items (
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

-- Add indexes for performance
CREATE INDEX idx_orders_order_number ON public.orders (order_number);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_created_at ON public.orders (created_at);
CREATE INDEX idx_orders_voucher_id ON public.orders (voucher_id);
CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Allow all authenticated users to read orders"
ON public.orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow admin to manage orders"
ON public.orders FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Allow all authenticated users to read order_items"
ON public.order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert order_items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow admin to manage order_items"
ON public.order_items FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to call the function before update
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to generate order numbers
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

-- Create a trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();
