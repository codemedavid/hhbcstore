-- Create products table for beauty products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('hair-care', 'cosmetics', 'skin-care', 'nail-care')),
  images TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  brand VARCHAR(100),
  ingredients TEXT[] DEFAULT '{}',
  weight VARCHAR(50),
  sku VARCHAR(100) UNIQUE,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variations table for product variations (colors, shades, etc.)
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  sku VARCHAR(100),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_add_ons table for add-ons
CREATE TABLE IF NOT EXISTS product_add_ons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table for e-commerce orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  contact_number VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL,
  shipping_method VARCHAR(50) NOT NULL CHECK (shipping_method IN ('lbc-standard', 'lbc-express', 'lbc-same-day')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'bank-transfer', 'cod')),
  reference_number VARCHAR(100),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table for order line items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  selected_add_ons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(popular);
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_product_id ON product_add_ons(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Insert sample beauty products
INSERT INTO products (name, description, base_price, category, images, popular, brand, ingredients, weight, sku, stock) VALUES
('Premium Hair Dye', 'Long-lasting hair color with nourishing ingredients', 299.00, 'hair-care', ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400'], true, 'H&HBC', ARRAY['Ammonia-free', 'Keratin', 'Vitamin E'], '100ml', 'HHB-HD-001', 50),
('Matte Lipstick', 'Highly pigmented matte finish lipstick', 199.00, 'cosmetics', ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], true, 'H&HBC', ARRAY['Vitamin E', 'Shea Butter', 'Jojoba Oil'], '3.5g', 'HHB-LP-001', 30),
('Hydrating Face Serum', 'Lightweight serum for all skin types', 399.00, 'skin-care', ARRAY['https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'], false, 'H&HBC', ARRAY['Hyaluronic Acid', 'Niacinamide', 'Vitamin C'], '30ml', 'HHB-FS-001', 25),
('Nail Polish Set', 'Professional nail polish with long-lasting formula', 149.00, 'nail-care', ARRAY['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'], false, 'H&HBC', ARRAY['Toluene-free', 'Formaldehyde-free', 'Dibutyl Phthalate-free'], '15ml', 'HHB-NP-001', 40);

-- Insert sample variations
INSERT INTO product_variations (product_id, name, price, images, sku, stock) VALUES
((SELECT id FROM products WHERE name = 'Premium Hair Dye'), 'Black', 0, ARRAY['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'], 'HHB-HD-001-BLK', 20),
((SELECT id FROM products WHERE name = 'Premium Hair Dye'), 'Brown', 0, ARRAY['https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400'], 'HHB-HD-001-BRN', 15),
((SELECT id FROM products WHERE name = 'Premium Hair Dye'), 'Blonde', 0, ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'], 'HHB-HD-001-BLD', 15),
((SELECT id FROM products WHERE name = 'Matte Lipstick'), 'Red', 0, ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'], 'HHB-LP-001-RED', 10),
((SELECT id FROM products WHERE name = 'Matte Lipstick'), 'Pink', 0, ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], 'HHB-LP-001-PNK', 10),
((SELECT id FROM products WHERE name = 'Matte Lipstick'), 'Nude', 0, ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'], 'HHB-LP-001-NUD', 10);

-- Insert sample add-ons
INSERT INTO product_add_ons (product_id, name, price, category, description) VALUES
((SELECT id FROM products WHERE name = 'Premium Hair Dye'), 'Hair Treatment Mask', 99.00, 'treatment', 'Deep conditioning treatment for colored hair'),
((SELECT id FROM products WHERE name = 'Premium Hair Dye'), 'Color Protection Shampoo', 149.00, 'shampoo', 'Sulfate-free shampoo to maintain color vibrancy'),
((SELECT id FROM products WHERE name = 'Matte Lipstick'), 'Lip Liner', 79.00, 'liner', 'Long-wearing lip liner for precise application'),
((SELECT id FROM products WHERE name = 'Matte Lipstick'), 'Lip Gloss', 89.00, 'gloss', 'High-shine gloss for added dimension'),
((SELECT id FROM products WHERE name = 'Hydrating Face Serum'), 'Vitamin C Booster', 199.00, 'booster', 'Concentrated vitamin C for enhanced brightening'),
((SELECT id FROM products WHERE name = 'Nail Polish Set'), 'Base Coat', 59.00, 'base', 'Long-lasting base coat for smooth application'),
((SELECT id FROM products WHERE name = 'Nail Polish Set'), 'Top Coat', 59.00, 'top', 'High-gloss top coat for extended wear');

-- Update existing payment_methods table to include COD
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS cod_enabled BOOLEAN DEFAULT false;

-- Insert sample payment methods
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, active, sort_order, cod_enabled) VALUES
('gcash-001', 'GCash', '09123456789', 'H&HBC Beauty', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', true, 1, false),
('maya-001', 'Maya', '09123456789', 'H&HBC Beauty', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', true, 2, false),
('bank-001', 'Bank Transfer', '1234567890', 'H&HBC Beauty', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', true, 3, false),
('cod-001', 'Cash on Delivery', 'N/A', 'H&HBC Beauty', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200', true, 4, true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
