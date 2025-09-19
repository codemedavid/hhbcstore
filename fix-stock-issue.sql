-- Fix stock issue - comprehensive solution
-- Run this in your Supabase SQL Editor

-- Step 1: Check if stock column exists
DO $$
BEGIN
    -- Add stock column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'stock'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN stock INTEGER DEFAULT 0;
        RAISE NOTICE 'Added stock column';
    ELSE
        RAISE NOTICE 'Stock column already exists';
    END IF;
END $$;

-- Step 2: Add other missing columns if they don't exist
DO $$
BEGIN
    -- Add sku column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'sku'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column';
    END IF;
    
    -- Add brand column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'brand'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN brand TEXT;
        RAISE NOTICE 'Added brand column';
    END IF;
    
    -- Add weight column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'weight'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN weight TEXT;
        RAISE NOTICE 'Added weight column';
    END IF;
    
    -- Add ingredients column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'ingredients'
    ) THEN
        ALTER TABLE public.menu_items ADD COLUMN ingredients TEXT[];
        RAISE NOTICE 'Added ingredients column';
    END IF;
END $$;

-- Step 3: Update all items to have stock and be available
UPDATE public.menu_items 
SET 
  stock = COALESCE(stock, 50),
  available = COALESCE(available, true)
WHERE stock IS NULL OR stock = 0 OR available IS NULL OR available = false;

-- Step 4: Set different stock levels for variety
UPDATE public.menu_items 
SET stock = 100 
WHERE popular = true;

UPDATE public.menu_items 
SET stock = 25 
WHERE name ILIKE '%coffee%' OR name ILIKE '%tea%';

UPDATE public.menu_items 
SET stock = 0 
WHERE name ILIKE '%wings%' OR name ILIKE '%chicken%';

-- Step 5: Verify the changes
SELECT 
  id, 
  name, 
  stock, 
  available,
  popular,
  created_at
FROM public.menu_items 
ORDER BY stock DESC
LIMIT 15;

-- Step 6: Show summary
SELECT 
  'Total Items' as metric,
  COUNT(*) as value
FROM public.menu_items
UNION ALL
SELECT 
  'Items with Stock > 0',
  COUNT(*)
FROM public.menu_items
WHERE stock > 0
UNION ALL
SELECT 
  'Available Items',
  COUNT(*)
FROM public.menu_items
WHERE available = true
UNION ALL
SELECT 
  'Out of Stock Items',
  COUNT(*)
FROM public.menu_items
WHERE stock = 0;
