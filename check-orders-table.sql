-- Check if orders table exists and create if needed
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'orders'
);

-- If the above returns false, run this to create the orders table:
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    shipping_address JSONB NOT NULL,
    shipping_method VARCHAR(100) NOT NULL,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    voucher_discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    voucher_id UUID REFERENCES public.vouchers(id),
    voucher_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    quantity INTEGER NOT NULL,
    variation_id UUID,
    variation_name VARCHAR(255),
    variation_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    add_ons JSONB DEFAULT '[]',
    item_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all authenticated users to manage orders" ON public.orders
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage order_items" ON public.order_items
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Create updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orders_updated_at();

-- Insert a test order to verify the table works
INSERT INTO public.orders (
    order_number,
    customer_name,
    contact_number,
    shipping_address,
    shipping_method,
    shipping_fee,
    subtotal,
    voucher_discount,
    total_amount,
    payment_method,
    status
) VALUES (
    'TEST-001',
    'Test Customer',
    '09123456789',
    '{"street": "123 Test St", "city": "Test City", "province": "Test Province", "postalCode": "1234", "country": "Philippines"}',
    'LBC Standard',
    150.00,
    500.00,
    0.00,
    650.00,
    'gcash',
    'pending'
) ON CONFLICT (order_number) DO NOTHING;

-- Check if the test order was inserted
SELECT * FROM public.orders WHERE order_number = 'TEST-001';
