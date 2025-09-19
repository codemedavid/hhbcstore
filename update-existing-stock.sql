-- Update existing items to have stock
-- Run this in your Supabase SQL Editor

-- First, ensure all items are available
UPDATE public.menu_items 
SET available = true 
WHERE available IS NULL OR available = false;

-- Update all existing menu items to have stock
UPDATE public.menu_items 
SET stock = 50 
WHERE stock = 0 OR stock IS NULL;

-- Update some items to have different stock levels for testing
UPDATE public.menu_items 
SET stock = 100 
WHERE popular = true;

-- Update some items to have low stock for testing
UPDATE public.menu_items 
SET stock = 5 
WHERE name LIKE '%Coffee%' AND name LIKE '%Hot%';

-- Update some items to be out of stock for testing
UPDATE public.menu_items 
SET stock = 0 
WHERE name LIKE '%Wings%';

-- Test the changes
SELECT id, name, stock, popular, available 
FROM public.menu_items 
ORDER BY stock DESC
LIMIT 10;
