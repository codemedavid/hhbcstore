/*
  # Update Categories to Beauty Categories

  This migration updates the existing categories to beauty-focused categories:
  - Hair Care
  - Cosmetics  
  - Skin Care
  - Nail Care

  1. Clear existing categories
  2. Insert new beauty categories
  3. Update any existing menu items to use new categories
*/

-- Clear existing categories (this will cascade to subcategories)
DELETE FROM categories;

-- Insert new beauty categories
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('hair-care', 'Hair Care', '💇‍♀️', 1, true, NULL, NOW(), NOW()),
  ('cosmetics', 'Cosmetics', '💄', 2, true, NULL, NOW(), NOW()),
  ('skin-care', 'Skin Care', '🧴', 3, true, NULL, NOW(), NOW()),
  ('nail-care', 'Nail Care', '💅', 4, true, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories for Hair Care
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('shampoo-conditioner', 'Shampoo & Conditioner', '🧴', 1, true, 'hair-care', NOW(), NOW()),
  ('hair-treatments', 'Hair Treatments', '💆‍♀️', 2, true, 'hair-care', NOW(), NOW()),
  ('styling-products', 'Styling Products', '✨', 3, true, 'hair-care', NOW(), NOW()),
  ('hair-tools', 'Hair Tools', '🔧', 4, true, 'hair-care', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories for Cosmetics
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('face-makeup', 'Face Makeup', '🎭', 1, true, 'cosmetics', NOW(), NOW()),
  ('eye-makeup', 'Eye Makeup', '👁️', 2, true, 'cosmetics', NOW(), NOW()),
  ('lip-products', 'Lip Products', '💋', 3, true, 'cosmetics', NOW(), NOW()),
  ('makeup-tools', 'Makeup Tools', '🖌️', 4, true, 'cosmetics', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories for Skin Care
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('cleansers', 'Cleansers', '🧼', 1, true, 'skin-care', NOW(), NOW()),
  ('moisturizers', 'Moisturizers', '💧', 2, true, 'skin-care', NOW(), NOW()),
  ('serums', 'Serums', '💉', 3, true, 'skin-care', NOW(), NOW()),
  ('sunscreen', 'Sunscreen', '☀️', 4, true, 'skin-care', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories for Nail Care
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('nail-polish', 'Nail Polish', '💅', 1, true, 'nail-care', NOW(), NOW()),
  ('nail-tools', 'Nail Tools', '🔨', 2, true, 'nail-care', NOW(), NOW()),
  ('nail-treatments', 'Nail Treatments', '💆‍♀️', 3, true, 'nail-care', NOW(), NOW()),
  ('nail-art', 'Nail Art', '🎨', 4, true, 'nail-care', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update any existing menu items to use the first category (hair-care) as default
UPDATE menu_items 
SET category = 'hair-care' 
WHERE category NOT IN ('hair-care', 'cosmetics', 'skin-care', 'nail-care');
