-- First, create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT TRUE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users (is_active);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that reference admin_users
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vouchers' AND policyname = 'Allow admin to manage vouchers') THEN
    DROP POLICY "Allow admin to manage vouchers" ON public.vouchers;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow admin to manage orders') THEN
    DROP POLICY "Allow admin to manage orders" ON public.orders;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow admin to manage order_items') THEN
    DROP POLICY "Allow admin to manage order_items" ON public.order_items;
  END IF;
END $$;

-- Create new policies for admin_users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Allow all authenticated users to read admin_users') THEN
    CREATE POLICY "Allow all authenticated users to read admin_users"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Allow admin to manage admin_users') THEN
    CREATE POLICY "Allow admin to manage admin_users"
    ON public.admin_users FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));
  END IF;
END $$;

-- Create simplified policies for vouchers, orders, and order_items that don't require admin_users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vouchers' AND policyname = 'Allow all authenticated users to manage vouchers') THEN
    CREATE POLICY "Allow all authenticated users to manage vouchers"
    ON public.vouchers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow all authenticated users to manage orders') THEN
    CREATE POLICY "Allow all authenticated users to manage orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Allow all authenticated users to manage order_items') THEN
    CREATE POLICY "Allow all authenticated users to manage order_items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_users_updated_at') THEN
    CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Insert a default admin user (placeholder - replace with actual user ID)
-- You can get your actual user ID from the auth.users table
INSERT INTO public.admin_users (user_id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@h&hbcshoppe.com', 'Admin User', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
