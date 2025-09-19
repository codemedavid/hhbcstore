-- Add stock column to menu_items table
-- This migration adds stock tracking functionality to menu items

-- Add stock column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Add sku column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS sku TEXT;

-- Add brand column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add weight column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add ingredients column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS ingredients TEXT[];

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_stock ON public.menu_items (stock);
CREATE INDEX IF NOT EXISTS idx_menu_items_sku ON public.menu_items (sku) WHERE sku IS NOT NULL;

-- Add check constraint to ensure stock is not negative
ALTER TABLE public.menu_items
ADD CONSTRAINT check_stock_non_negative 
CHECK (stock >= 0);

-- Add comment
COMMENT ON COLUMN public.menu_items.stock IS 'Available stock quantity for this menu item';
COMMENT ON COLUMN public.menu_items.sku IS 'Stock Keeping Unit - unique identifier for the product';
COMMENT ON COLUMN public.menu_items.brand IS 'Brand name of the product';
COMMENT ON COLUMN public.menu_items.weight IS 'Weight or size of the product (e.g., "100g", "250ml")';
COMMENT ON COLUMN public.menu_items.ingredients IS 'Array of ingredients used in this product';
