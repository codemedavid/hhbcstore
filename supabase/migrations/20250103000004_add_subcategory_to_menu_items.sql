-- Add subcategory column to menu_items table
ALTER TABLE menu_items
ADD COLUMN subcategory text;

-- Add foreign key constraint to categories table
ALTER TABLE menu_items
ADD CONSTRAINT fk_menu_items_subcategory
FOREIGN KEY (subcategory) REFERENCES categories(id)
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory ON menu_items (subcategory);

-- Add comment
COMMENT ON COLUMN menu_items.subcategory IS 'Optional subcategory within the main category';
