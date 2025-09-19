-- Test database connection and column existence
-- Run this in your Supabase SQL Editor

-- Test 1: Check if stock column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
  AND column_name = 'stock';

-- Test 2: Try to select stock column directly
SELECT 
  id,
  name,
  stock,
  available
FROM public.menu_items 
LIMIT 3;

-- Test 3: Check if there are any items at all
SELECT COUNT(*) as total_items FROM public.menu_items;

-- Test 4: Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;
