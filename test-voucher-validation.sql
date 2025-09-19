-- Test Voucher Validation
-- Run this in your Supabase SQL Editor to test voucher usage limits

-- 1. Check current voucher data
SELECT 'Current voucher data:' as status;
SELECT 
  code,
  max_uses,
  used_count,
  is_active,
  CASE 
    WHEN max_uses IS NULL THEN 'Unlimited uses'
    WHEN used_count >= max_uses THEN 'MAXED OUT'
    ELSE CONCAT(used_count, '/', max_uses, ' used')
  END as usage_status
FROM public.vouchers
ORDER BY code;

-- 2. Test voucher validation logic
SELECT 'Testing voucher validation logic:' as status;

-- Check WELCOME10 voucher (should have max_uses = 100)
SELECT 
  'WELCOME10' as voucher_code,
  max_uses,
  used_count,
  is_active,
  CASE 
    WHEN is_active = false THEN 'INACTIVE'
    WHEN max_uses IS NOT NULL AND used_count >= max_uses THEN 'MAXED OUT'
    WHEN is_active = true THEN 'AVAILABLE'
    ELSE 'UNKNOWN'
  END as validation_result
FROM public.vouchers 
WHERE code = 'WELCOME10';

-- 3. Simulate reaching max uses for testing
-- (This is just for testing - don't run in production)
-- UPDATE public.vouchers 
-- SET used_count = max_uses 
-- WHERE code = 'WELCOME10' AND max_uses IS NOT NULL;

-- 4. Check if any vouchers are at their limit
SELECT 'Vouchers at their usage limit:' as status;
SELECT 
  code,
  used_count,
  max_uses,
  is_active
FROM public.vouchers 
WHERE max_uses IS NOT NULL 
  AND used_count >= max_uses
  AND is_active = true;

-- 5. Check orders that used vouchers
SELECT 'Orders with vouchers:' as status;
SELECT 
  o.order_number,
  o.voucher_code,
  o.created_at,
  v.used_count as current_usage,
  v.max_uses
FROM public.orders o
LEFT JOIN public.vouchers v ON o.voucher_id = v.id
WHERE o.voucher_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 10;
