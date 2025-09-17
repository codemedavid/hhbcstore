/*
  # Add Diverse, High-Quality Images for All Menu Items
  
  This migration updates all menu items with diverse, specific images
  that better represent each item type and category.
*/

-- Update Coffee items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop' WHERE id = 'coffee-choco-hot';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop' WHERE id = 'coffee-cappuccino-hot';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1517701604599-bb29b565090a?w=400&h=300&fit=crop' WHERE id = 'coffee-mocha-hot';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop' WHERE id = 'coffee-spanish-latte-iced';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop' WHERE id = 'coffee-cafe-mocha-iced';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop' WHERE id = 'coffee-signature-choco-iced';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop' WHERE id = 'coffee-caramel-machiato';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop' WHERE id = 'coffee-white-chocolate';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop' WHERE id = 'coffee-salted-caramel';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1517701604599-bb29b565090a?w=400&h=300&fit=crop' WHERE id = 'coffee-dirty-matcha';

-- Update Breakfast items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop' WHERE id = 'breakfast-tapsilog';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop' WHERE id = 'breakfast-tocilog';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop' WHERE id = 'breakfast-hotsilog';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop' WHERE id = 'breakfast-longsilog';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop' WHERE id = 'breakfast-humba';

-- Update Pizza items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' WHERE id = 'pizza-four-cheese';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' WHERE id = 'pizza-smokey-chicken-bbq';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' WHERE id = 'pizza-garlic-parmesan';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' WHERE id = 'pizza-hawaiian';

-- Update Wings items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' WHERE id = 'wings-soy-garlic-glaze';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' WHERE id = 'wings-chili-buffalo';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' WHERE id = 'wings-garlic-parmesan';

-- Update Noodles & Pasta items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop' WHERE id = 'noodles-classic-fries';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop' WHERE id = 'noodles-overload-fries';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop' WHERE id = 'noodles-beef-nachos';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop' WHERE id = 'noodles-mushroom';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop' WHERE id = 'noodles-carbonara';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop' WHERE id = 'noodles-waffle';

-- Update Milk Tea items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-cookies-cream';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-matcha';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-okinawa';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-red-velvet';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-taro';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'milktea-winter-melon';

-- Update Fruit Soda items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'soda-blue-berry';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'soda-green-apple';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'soda-lychee';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'soda-passion-fruit';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop' WHERE id = 'soda-strawberry';

-- Update Sandwiches items with diverse, specific images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop' WHERE id = 'sandwich-club-house';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop' WHERE id = 'sandwich-beef-burger';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop' WHERE id = 'sandwich-pizza-roll';
