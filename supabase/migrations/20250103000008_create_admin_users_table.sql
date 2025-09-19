-- Create the admin_users table
CREATE TABLE public.admin_users (
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
CREATE INDEX idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users (email);
CREATE INDEX idx_admin_users_is_active ON public.admin_users (is_active);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Allow all authenticated users to read admin_users"
ON public.admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admin to manage admin_users"
ON public.admin_users FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM public.admin_users))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default admin user (you'll need to replace the user_id with an actual auth user ID)
-- This is just a placeholder - you should replace it with a real user ID from your auth.users table
INSERT INTO public.admin_users (user_id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@h&hbcshoppe.com', 'Admin User', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
