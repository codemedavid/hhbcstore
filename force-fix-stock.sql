-- FORCE FIX STOCK ISSUE
-- Run this in your Supabase SQL Editor

-- Step 1: Add all missing columns if they don't exist
DO $$
BEGIN
    -- Add stock column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'stock') THEN
        ALTER TABLE public.menu_items ADD COLUMN stock INTEGER DEFAULT 0;
        RAISE NOTICE 'Added stock column';
    END IF;
    
    -- Add sku column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'sku') THEN
        ALTER TABLE public.menu_items ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column';
    END IF;
    
    -- Add brand column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'brand') THEN
        ALTER TABLE public.menu_items ADD COLUMN brand TEXT;
        RAISE NOTICE 'Added brand column';
    END IF;
    
    -- Add weight column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'weight') THEN
        ALTER TABLE public.menu_items ADD COLUMN weight TEXT;
        RAISE NOTICE 'Added weight column';
    END IF;
    
    -- Add ingredients column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'ingredients') THEN
        ALTER TABLE public.menu_items ADD COLUMN ingredients TEXT[];
        RAISE NOTICE 'Added ingredients column';
    END IF;
    
    -- Add subcategory column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'subcategory') THEN
        ALTER TABLE public.menu_items ADD COLUMN subcategory TEXT;
        RAISE NOTICE 'Added subcategory column';
    END IF;
    
    -- Add discounted_price column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'discounted_price') THEN
        ALTER TABLE public.menu_items ADD COLUMN discounted_price DECIMAL(10,2);
        RAISE NOTICE 'Added discounted_price column';
    END IF;
END $$;

-- Step 2: Update all items to have stock and be available
UPDATE public.menu_items 
SET 
  stock = 50,
  available = true
WHERE stock IS NULL OR stock = 0 OR available IS NULL OR available = false;

-- Step 3: Set different stock levels for variety
UPDATE public.menu_items 
SET stock = 100 
WHERE popular = true;

UPDATE public.menu_items 
SET stock = 25 
WHERE name ILIKE '%coffee%' OR name ILIKE '%tea%' OR name ILIKE '%hot%';

UPDATE public.menu_items 
SET stock = 0 
WHERE name ILIKE '%wings%' OR name ILIKE '%chicken%';

-- Step 4: Verify the changes
SELECT 
  'VERIFICATION' as status,
  COUNT(*) as total_items,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as items_with_stock,
  COUNT(CASE WHEN available = true THEN 1 END) as available_items,
  COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_items
FROM public.menu_items;

-- Step 5: Show sample data
SELECT 
  id, 
  name, 
  stock, 
  available,
  popular
FROM public.menu_items 
ORDER BY stock DESC
LIMIT 5;
