-- Simple fix: Update existing policies to not require admin_users table
-- This allows the system to work immediately while you set up proper admin authentication

-- Drop the problematic policies
DROP POLICY IF EXISTS "Allow admin to manage vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow admin to manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to manage order_items" ON public.order_items;

-- Create simplified policies that allow all authenticated users
CREATE POLICY "Allow all authenticated users to manage vouchers"
ON public.vouchers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to manage order_items"
ON public.order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
