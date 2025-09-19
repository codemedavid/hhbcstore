/*
  # Add Discounted Price Field

  This migration adds a discounted_price field to the menu_items table
  to support sale pricing functionality.

  1. Add discounted_price column to menu_items table
  2. Set as optional (nullable) field
  3. Add index for performance on price queries
*/

-- Add discounted_price field to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'discounted_price'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN discounted_price decimal(10,2);
  END IF;
END $$;

-- Add index for performance on price-related queries
CREATE INDEX IF NOT EXISTS idx_menu_items_discounted_price ON menu_items(discounted_price) WHERE discounted_price IS NOT NULL;

-- Add check constraint to ensure discounted price is less than base price when both are set
ALTER TABLE menu_items ADD CONSTRAINT check_discounted_price_valid 
  CHECK (discounted_price IS NULL OR discounted_price < base_price);
