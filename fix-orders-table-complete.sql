-- Complete fix for orders table and related functionality
-- Run this in your Supabase SQL editor

-- 1. Create orders table if it doesn't exist
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

-- 2. Create order_items table if it doesn't exist
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

-- 3. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Allow all authenticated users to manage orders" ON public.orders;
CREATE POLICY "Allow all authenticated users to manage orders" ON public.orders
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all authenticated users to manage order_items" ON public.order_items;
CREATE POLICY "Allow all authenticated users to manage order_items" ON public.order_items
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 6. Create updated_at trigger for orders
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orders_updated_at();

-- 7. Insert test orders to verify everything works
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
) VALUES 
(
    '20250103-0001',
    'John Doe',
    '09123456789',
    '{"street": "123 Main St", "city": "Manila", "province": "Metro Manila", "postalCode": "1000", "country": "Philippines"}',
    'LBC Standard',
    150.00,
    500.00,
    0.00,
    650.00,
    'gcash',
    'pending'
),
(
    '20250103-0002',
    'Jane Smith',
    '09987654321',
    '{"street": "456 Oak Ave", "city": "Quezon City", "province": "Metro Manila", "postalCode": "1100", "country": "Philippines"}',
    'J&T Express',
    120.00,
    750.00,
    50.00,
    820.00,
    'bank_transfer',
    'confirmed'
),
(
    '20250103-0003',
    'Mike Johnson',
    '09111222333',
    '{"street": "789 Pine St", "city": "Makati", "province": "Metro Manila", "postalCode": "1200", "country": "Philippines"}',
    'Grab Express',
    300.00,
    1200.00,
    100.00,
    1400.00,
    'gcash',
    'processing'
)
ON CONFLICT (order_number) DO NOTHING;

-- 8. Insert test order items
INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    product_description,
    base_price,
    discounted_price,
    quantity,
    variation_price,
    item_total
) 
SELECT 
    o.id,
    gen_random_uuid(),
    'Test Product ' || o.order_number,
    'Test product description',
    250.00,
    200.00,
    2,
    0.00,
    400.00
FROM public.orders o
WHERE o.order_number IN ('20250103-0001', '20250103-0002', '20250103-0003')
ON CONFLICT DO NOTHING;

-- 9. Verify the tables exist and have data
SELECT 'Orders table check:' as info;
SELECT COUNT(*) as order_count FROM public.orders;

SELECT 'Order items table check:' as info;
SELECT COUNT(*) as order_item_count FROM public.order_items;

SELECT 'Sample orders:' as info;
SELECT order_number, customer_name, status, total_amount, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 10. Test the exact query that the frontend uses
SELECT 'Frontend query test:' as info;
SELECT 
    o.*,
    COALESCE(
        (
            SELECT json_agg(
                json_build_object(
                    'id', oi.id,
                    'order_id', oi.order_id,
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'product_description', oi.product_description,
                    'base_price', oi.base_price,
                    'discounted_price', oi.discounted_price,
                    'quantity', oi.quantity,
                    'variation_id', oi.variation_id,
                    'variation_name', oi.variation_name,
                    'variation_price', oi.variation_price,
                    'add_ons', oi.add_ons,
                    'item_total', oi.item_total,
                    'created_at', oi.created_at
                )
            )
            FROM public.order_items oi 
            WHERE oi.order_id = o.id
        ),
        '[]'::json
    ) as order_items
FROM public.orders o
ORDER BY o.created_at DESC;
