/*
  # Add Coffee Subcategories

  This migration adds subcategories under the main "coffee" category to demonstrate
  the hierarchical category functionality.

  1. Add subcategories under "coffee" category
  2. These will appear as nested categories in the frontend
*/

-- Add subcategories under the coffee category
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('hot-coffee', 'Hot Coffee', '☕', 1, true, 'coffee', NOW(), NOW()),
  ('iced-coffee', 'Iced Coffee', '🧊', 2, true, 'coffee', NOW(), NOW()),
  ('specialty-coffee', 'Specialty Coffee', '🌟', 3, true, 'coffee', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories under hot-coffee
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('espresso-based', 'Espresso Based', '☕', 1, true, 'hot-coffee', NOW(), NOW()),
  ('filter-coffee', 'Filter Coffee', '🫖', 2, true, 'hot-coffee', NOW(), NOW()),
  ('cold-brew', 'Cold Brew', '❄️', 3, true, 'hot-coffee', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories under iced-coffee
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('iced-lattes', 'Iced Lattes', '🧊', 1, true, 'iced-coffee', NOW(), NOW()),
  ('iced-americano', 'Iced Americano', '🧊', 2, true, 'iced-coffee', NOW(), NOW()),
  ('frappes', 'Frappes', '🥤', 3, true, 'iced-coffee', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add subcategories under specialty-coffee
INSERT INTO categories (id, name, icon, sort_order, active, parent_id, created_at, updated_at) VALUES
  ('signature-drinks', 'Signature Drinks', '✨', 1, true, 'specialty-coffee', NOW(), NOW()),
  ('seasonal-specials', 'Seasonal Specials', '🍂', 2, true, 'specialty-coffee', NOW(), NOW()),
  ('artisan-blends', 'Artisan Blends', '🎨', 3, true, 'specialty-coffee', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
