-- Add new categories (only if they don't exist)
INSERT INTO categories (id, name, icon, sort_order, active, created_at, updated_at) VALUES
('coffee', 'Coffee', '☕', 1, true, NOW(), NOW()),
('breakfast', 'Breakfast', '🍳', 2, true, NOW(), NOW()),
('pizza', 'Pizza', '🍕', 3, true, NOW(), NOW()),
('wings', 'Wings', '🍗', 4, true, NOW(), NOW()),
('noodles-pasta', 'Noodles & Pasta', '🍜', 5, true, NOW(), NOW()),
('milk-tea', 'Milk Tea', '🧋', 6, true, NOW(), NOW()),
('fruit-soda', 'Fruit Soda', '🥤', 7, true, NOW(), NOW()),
('sandwiches', 'Sandwiches', '🥪', 8, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Coffee items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
-- Hot Coffee
('coffee-choco-hot', 'Choco (Hot)', 'Rich and creamy hot chocolate made with premium cocoa', 80, 'coffee', false, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-cappuccino-hot', 'Cappuccino (Hot)', 'Classic Italian cappuccino with perfect foam and espresso', 80, 'coffee', true, true, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-mocha-hot', 'Mocha (Hot)', 'Rich chocolate and espresso blend with steamed milk', 80, 'coffee', false, true, 'https://images.unsplash.com/photo-1517701604599-bb29b565090a?w=400&h=300&fit=crop', NOW(), NOW()),

-- Iced Coffee
('coffee-spanish-latte-iced', 'Spanish Latte (Iced)', 'Smooth iced latte with condensed milk', 130, 'coffee', true, true, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-cafe-mocha-iced', 'Cafe Mocha (Iced)', 'Refreshing iced mocha with chocolate and espresso', 130, 'coffee', false, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-signature-choco-iced', 'Signature Choco (Iced)', 'Our signature iced chocolate drink', 130, 'coffee', false, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', NOW(), NOW()),

-- Special Coffee
('coffee-caramel-machiato', 'Caramel Machiato', 'Layered espresso with vanilla and caramel', 90, 'coffee', true, true, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-white-chocolate', 'White Chocolate', 'Creamy white chocolate coffee drink', 90, 'coffee', false, true, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-salted-caramel', 'Salted Caramel', 'Sweet and salty caramel coffee blend', 90, 'coffee', false, true, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop', NOW(), NOW()),
('coffee-dirty-matcha', 'Dirty Matcha', 'Matcha with a shot of espresso', 90, 'coffee', false, true, 'https://images.unsplash.com/photo-1517701604599-bb29b565090a?w=400&h=300&fit=crop', NOW(), NOW());

-- Add coffee variations (Hot/Iced)
INSERT INTO variations (id, menu_item_id, name, price, created_at) VALUES
-- Hot coffee variations
('coffee-choco-hot-var', 'coffee-choco-hot', 'Hot', 0, NOW()),
('coffee-cappuccino-hot-var', 'coffee-cappuccino-hot', 'Hot', 0, NOW()),
('coffee-mocha-hot-var', 'coffee-mocha-hot', 'Hot', 0, NOW()),

-- Iced coffee variations
('coffee-spanish-latte-iced-var', 'coffee-spanish-latte-iced', 'Iced', 0, NOW()),
('coffee-cafe-mocha-iced-var', 'coffee-cafe-mocha-iced', 'Iced', 0, NOW()),
('coffee-signature-choco-iced-var', 'coffee-signature-choco-iced', 'Iced', 0, NOW());

-- Breakfast items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('breakfast-tapsilog', 'Tapsilog', 'Tapa, sinangag, and itlog - classic Filipino breakfast', 110, 'breakfast', true, true, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', NOW(), NOW()),
('breakfast-tocilog', 'Tocilog', 'Tocino, sinangag, and itlog - sweet and savory breakfast', 100, 'breakfast', false, true, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', NOW(), NOW()),
('breakfast-hotsilog', 'Hotsilog', 'Hotdog, sinangag, and itlog - simple and satisfying', 95, 'breakfast', false, true, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', NOW(), NOW()),
('breakfast-longsilog', 'Longsilog', 'Longganisa, sinangag, and itlog - traditional Filipino sausage', 105, 'breakfast', false, true, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', NOW(), NOW()),
('breakfast-humba', 'Humba', 'Braised pork belly with rice and egg', 100, 'breakfast', false, true, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop', NOW(), NOW());

-- Pizza items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('pizza-four-cheese', 'Four Cheese', 'Mozzarella, cheddar, parmesan, and gouda cheese blend', 194, 'pizza', true, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', NOW(), NOW()),
('pizza-smokey-chicken-bbq', 'Smokey Chicken BBQ', 'Grilled chicken with smoky BBQ sauce and onions', 194, 'pizza', false, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', NOW(), NOW()),
('pizza-garlic-parmesan', 'Garlic Parmesan', 'Creamy garlic sauce with parmesan and herbs', 219, 'pizza', false, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', NOW(), NOW()),
('pizza-hawaiian', 'Hawaiian', 'Classic ham and pineapple pizza', 199, 'pizza', true, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', NOW(), NOW());

-- Wings items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('wings-soy-garlic-glaze', 'Soy Garlic Glaze', 'Crispy wings with savory soy garlic glaze', 199, 'wings', true, true, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', NOW(), NOW()),
('wings-chili-buffalo', 'Chili Buffalo', 'Spicy buffalo wings with tangy sauce', 199, 'wings', false, true, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', NOW(), NOW()),
('wings-garlic-parmesan', 'Garlic Parmesan', 'Wings tossed in garlic parmesan sauce', 205, 'wings', false, true, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', NOW(), NOW());

-- Noodles & Pasta items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('noodles-classic-fries', 'Classic Fries', 'Crispy golden french fries', 60, 'noodles-pasta', false, true, 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop', NOW(), NOW()),
('noodles-overload-fries', 'Overload Fries', 'Loaded fries with cheese, bacon, and special sauce', 95, 'noodles-pasta', true, true, 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop', NOW(), NOW()),
('noodles-beef-nachos', 'Beef Nachos', 'Crispy nachos topped with seasoned beef and cheese', 95, 'noodles-pasta', false, true, 'https://images.unsplash.com/photo-1573080496219-b3c2b2b7a4b4?w=400&h=300&fit=crop', NOW(), NOW()),
('noodles-mushroom', 'Mushroom Pasta', 'Creamy mushroom pasta with herbs', 200, 'noodles-pasta', false, true, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', NOW(), NOW()),
('noodles-carbonara', 'Carbonara', 'Classic Italian carbonara with bacon and parmesan', 180, 'noodles-pasta', true, true, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', NOW(), NOW()),
('noodles-waffle', 'Waffle', 'Crispy Belgian waffle with syrup', 80, 'noodles-pasta', false, true, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop', NOW(), NOW());

-- Milk Tea items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('milktea-cookies-cream', 'Cookies & Cream', 'Creamy milk tea with cookies and cream flavor', 89, 'milk-tea', true, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('milktea-matcha', 'Matcha', 'Traditional Japanese matcha milk tea', 89, 'milk-tea', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('milktea-okinawa', 'Okinawa', 'Brown sugar milk tea with Okinawa flavor', 89, 'milk-tea', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('milktea-red-velvet', 'Red Velvet', 'Rich red velvet milk tea', 89, 'milk-tea', true, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('milktea-taro', 'Taro', 'Purple taro milk tea', 89, 'milk-tea', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('milktea-winter-melon', 'Winter Melon', 'Refreshing winter melon milk tea', 89, 'milk-tea', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW());

-- Fruit Soda items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('soda-blue-berry', 'Blue Berry', 'Refreshing blueberry soda', 59, 'fruit-soda', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('soda-green-apple', 'Green Apple', 'Crisp green apple soda', 59, 'fruit-soda', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('soda-lychee', 'Lychee', 'Sweet and fragrant lychee soda', 59, 'fruit-soda', true, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('soda-passion-fruit', 'Passion Fruit', 'Tropical passion fruit soda', 59, 'fruit-soda', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW()),
('soda-strawberry', 'Strawberry', 'Sweet strawberry soda', 59, 'fruit-soda', false, true, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', NOW(), NOW());

-- Sandwiches items
INSERT INTO menu_items (id, name, description, base_price, category, popular, available, image_url, created_at, updated_at) VALUES
('sandwich-club-house', 'Club House', 'Triple-decker sandwich with turkey, bacon, and vegetables', 120, 'sandwiches', true, true, 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop', NOW(), NOW()),
('sandwich-beef-burger', 'Beef Burger', 'Juicy beef patty with fresh vegetables and special sauce', 150, 'sandwiches', true, true, 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop', NOW(), NOW()),
('sandwich-pizza-roll', 'Pizza Roll', 'Crispy pizza roll with cheese and pepperoni', 110, 'sandwiches', false, true, 'https://images.unsplash.com/photo-1539252554453-80ab65ce358d?w=400&h=300&fit=crop', NOW(), NOW());

-- Add some add-ons for coffee items
INSERT INTO add_ons (id, menu_item_id, name, price, category, created_at) VALUES
-- Coffee add-ons
('coffee-extra-shot', 'coffee-choco-hot', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-cappuccino-hot', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-mocha-hot', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-spanish-latte-iced', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-cafe-mocha-iced', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-signature-choco-iced', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-caramel-machiato', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-white-chocolate', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-salted-caramel', 'Extra Shot', 20, 'coffee', NOW()),
('coffee-extra-shot', 'coffee-dirty-matcha', 'Extra Shot', 20, 'coffee', NOW()),

('coffee-oat-milk', 'coffee-choco-hot', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-cappuccino-hot', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-mocha-hot', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-spanish-latte-iced', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-cafe-mocha-iced', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-signature-choco-iced', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-caramel-machiato', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-white-chocolate', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-salted-caramel', 'Oat Milk', 15, 'milk', NOW()),
('coffee-oat-milk', 'coffee-dirty-matcha', 'Oat Milk', 15, 'milk', NOW()),

-- Pizza add-ons
('pizza-extra-cheese', 'pizza-four-cheese', 'Extra Cheese', 30, 'toppings', NOW()),
('pizza-extra-cheese', 'pizza-smokey-chicken-bbq', 'Extra Cheese', 30, 'toppings', NOW()),
('pizza-extra-cheese', 'pizza-garlic-parmesan', 'Extra Cheese', 30, 'toppings', NOW()),
('pizza-extra-cheese', 'pizza-hawaiian', 'Extra Cheese', 30, 'toppings', NOW()),

-- Wings add-ons
('wings-extra-sauce', 'wings-soy-garlic-glaze', 'Extra Sauce', 25, 'sauce', NOW()),
('wings-extra-sauce', 'wings-chili-buffalo', 'Extra Sauce', 25, 'sauce', NOW()),
('wings-extra-sauce', 'wings-garlic-parmesan', 'Extra Sauce', 25, 'sauce', NOW());
