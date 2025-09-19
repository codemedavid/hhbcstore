-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_days VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_methods_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_sort_order ON public.shipping_methods(sort_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_shipping_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_methods_updated_at
    BEFORE UPDATE ON public.shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_shipping_methods_updated_at();

-- Enable RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all authenticated users to manage shipping methods" ON public.shipping_methods
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, price, estimated_days, is_active, sort_order) VALUES
('LBC Standard', 'Standard delivery via LBC', 150.00, '3-5 business days', true, 1),
('LBC Express', 'Express delivery via LBC', 250.00, '1-2 business days', true, 2),
('J&T Express', 'J&T Express delivery', 120.00, '2-4 business days', true, 3),
('Grab Express', 'Same-day delivery via Grab', 300.00, 'Same day', true, 4),
('Pickup', 'Pick up at store', 0.00, 'Available immediately', true, 5)
ON CONFLICT DO NOTHING;
