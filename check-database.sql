-- Check current database state
-- Run this in your Supabase SQL Editor

-- Check if stock column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
  AND column_name IN ('stock', 'available', 'sku', 'brand', 'weight', 'ingredients');

-- Check actual data
SELECT 
  id, 
  name, 
  stock, 
  available,
  popular,
  created_at
FROM public.menu_items 
ORDER BY created_at DESC
LIMIT 10;

-- Count items by stock level
SELECT 
  CASE 
    WHEN stock IS NULL THEN 'NULL'
    WHEN stock = 0 THEN 'Zero'
    WHEN stock > 0 AND stock <= 10 THEN 'Low (1-10)'
    WHEN stock > 10 AND stock <= 50 THEN 'Medium (11-50)'
    WHEN stock > 50 THEN 'High (50+)'
  END as stock_level,
  COUNT(*) as count
FROM public.menu_items 
GROUP BY 
  CASE 
    WHEN stock IS NULL THEN 'NULL'
    WHEN stock = 0 THEN 'Zero'
    WHEN stock > 0 AND stock <= 10 THEN 'Low (1-10)'
    WHEN stock > 10 AND stock <= 50 THEN 'Medium (11-50)'
    WHEN stock > 50 THEN 'High (50+)'
  END
ORDER BY count DESC;
