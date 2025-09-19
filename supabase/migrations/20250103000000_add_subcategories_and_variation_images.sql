/*
  # Add Subcategories and Variation Images Support

  1. Database Changes
    - Add `parent_id` field to categories table for subcategory support
    - Add `image_url` field to variations table for variation images
    - Add `sort_order` field to variations table for ordering
    - Update foreign key constraints

  2. Security
    - No changes to existing RLS policies needed
    - New fields inherit existing security policies

  3. Data Migration
    - Existing categories will have parent_id = null (top-level categories)
    - Existing variations will have image_url = null initially
*/

-- Add parent_id field to categories table for subcategory support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN parent_id text REFERENCES categories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add image_url field to variations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'variations' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE variations ADD COLUMN image_url text;
  END IF;
END $$;

-- Add sort_order field to variations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'variations' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE variations ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add updated_at field to variations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'variations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE variations ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create updated_at trigger for variations
CREATE TRIGGER update_variations_updated_at
  BEFORE UPDATE ON variations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Create index for better performance on variation ordering
CREATE INDEX IF NOT EXISTS idx_variations_sort_order ON variations(menu_item_id, sort_order);

-- Add check constraint to prevent self-referencing categories
ALTER TABLE categories ADD CONSTRAINT check_no_self_reference 
  CHECK (parent_id IS NULL OR parent_id != id);

-- Add check constraint to prevent circular references (categories cannot be their own ancestor)
-- This is handled by the application logic, but we can add a simple check
ALTER TABLE categories ADD CONSTRAINT check_no_direct_circular_reference
  CHECK (parent_id IS NULL OR parent_id != id);

-- Update existing categories to ensure they are top-level (parent_id = NULL)
UPDATE categories SET parent_id = NULL WHERE parent_id IS NULL;

-- Create a function to get category hierarchy (useful for frontend)
CREATE OR REPLACE FUNCTION get_category_hierarchy()
RETURNS TABLE (
  id text,
  name text,
  icon text,
  sort_order integer,
  active boolean,
  parent_id text,
  level integer,
  path text
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: top-level categories
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.sort_order,
      c.active,
      c.parent_id,
      0 as level,
      c.name as path
    FROM categories c
    WHERE c.parent_id IS NULL AND c.active = true
    
    UNION ALL
    
    -- Recursive case: subcategories
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.sort_order,
      c.active,
      c.parent_id,
      ct.level + 1,
      ct.path || ' > ' || c.name
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.active = true
  )
  SELECT * FROM category_tree
  ORDER BY level, sort_order;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get subcategories of a specific category
CREATE OR REPLACE FUNCTION get_subcategories(category_id text)
RETURNS TABLE (
  id text,
  name text,
  icon text,
  sort_order integer,
  active boolean,
  parent_id text,
  level integer
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subcategory_tree AS (
    -- Base case: direct subcategories
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.sort_order,
      c.active,
      c.parent_id,
      1 as level
    FROM categories c
    WHERE c.parent_id = category_id AND c.active = true
    
    UNION ALL
    
    -- Recursive case: sub-subcategories
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.sort_order,
      c.active,
      c.parent_id,
      st.level + 1
    FROM categories c
    JOIN subcategory_tree st ON c.parent_id = st.id
    WHERE c.active = true
  )
  SELECT * FROM subcategory_tree
  ORDER BY level, sort_order;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a category can be deleted (no menu items or subcategories)
CREATE OR REPLACE FUNCTION can_delete_category(category_id text)
RETURNS boolean AS $$
DECLARE
  has_menu_items boolean;
  has_subcategories boolean;
BEGIN
  -- Check if category has menu items
  SELECT EXISTS(
    SELECT 1 FROM menu_items 
    WHERE category = category_id
  ) INTO has_menu_items;
  
  -- Check if category has subcategories
  SELECT EXISTS(
    SELECT 1 FROM categories 
    WHERE parent_id = category_id
  ) INTO has_subcategories;
  
  RETURN NOT (has_menu_items OR has_subcategories);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_category_hierarchy() TO public;
GRANT EXECUTE ON FUNCTION get_subcategories(text) TO public;
GRANT EXECUTE ON FUNCTION can_delete_category(text) TO public;
