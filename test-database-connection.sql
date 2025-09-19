-- Test Database Connection and Tables
-- Run this in your Supabase SQL Editor to verify everything is working

-- 1. Check if all tables exist
SELECT 'Checking tables...' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'vouchers', 'orders', 'order_items', 'menu_items', 'variations')
ORDER BY table_name;

-- 2. Check if orders table has the correct structure
SELECT 'Checking orders table structure...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if vouchers table has data
SELECT 'Checking vouchers...' as status;
SELECT COUNT(*) as voucher_count FROM public.vouchers;

-- 4. Test inserting a sample order (this will be rolled back)
SELECT 'Testing order creation...' as status;
BEGIN;

-- Try to insert a test order
INSERT INTO public.orders (
  order_number,
  customer_name,
  contact_number,
  shipping_address,
  shipping_method,
  shipping_fee,
  subtotal,
  voucher_discount,
  total_amount,
  payment_method,
  status
) VALUES (
  'TEST-001',
  'Test Customer',
  '09123456789',
  '{"street": "123 Test St", "city": "Test City", "province": "Test Province", "postalCode": "1234", "country": "Philippines"}',
  'lbc-standard',
  50,
  100,
  0,
  150,
  'gcash',
  'pending'
);

-- Check if the order was created
SELECT 'Test order created successfully!' as result, id, order_number FROM public.orders WHERE order_number = 'TEST-001';

-- Rollback the test
ROLLBACK;

-- 5. Check RLS policies
SELECT 'Checking RLS policies...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'vouchers')
ORDER BY tablename, policyname;

-- 6. Final status
SELECT 'Database setup verification completed!' as final_status;