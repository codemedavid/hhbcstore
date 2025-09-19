-- Simple version - just add the missing columns
-- Run this in your Supabase SQL Editor

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

-- Test the changes
SELECT id, name, stock, sku, brand, weight, ingredients 
FROM public.menu_items 
LIMIT 5;
