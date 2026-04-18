-- Create role enum for user types
CREATE TYPE user_role AS ENUM ('master_admin', 'business_owner', 'customer');

-- Create billing cycle enum
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

-- Create status enums
CREATE TYPE business_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trial');
CREATE TYPE invoice_status AS ENUM ('paid', 'pending', 'overdue', 'cancelled');

-- Add role to profiles table
ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN business_id uuid NULL;

-- Create businesses table (tenant isolation)
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  status business_status DEFAULT 'trial',
  logo_url text,
  primary_color text DEFAULT '#06B6D4',
  custom_domain text,
  support_email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_status subscription_status DEFAULT 'trial',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, profile_id)
);

-- Create subscription plans table
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  connection_limit integer DEFAULT 1,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status subscription_status DEFAULT 'trial',
  current_period_start timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  tax numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status invoice_status DEFAULT 'pending',
  due_date timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Add FK constraint for profiles.business_id
ALTER TABLE profiles ADD CONSTRAINT profiles_business_id_fkey 
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies (already exists, but update for role)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "users_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses RLS policies
CREATE POLICY "business_owners_read_own" ON businesses FOR SELECT 
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin'
  ));

CREATE POLICY "business_owners_update_own" ON businesses FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "auth_create_business" ON businesses FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Customers RLS policies (business owners see their customers)
CREATE POLICY "business_owners_read_customers" ON customers FOR SELECT 
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ) OR profile_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin'
  ));

CREATE POLICY "customers_read_own" ON customers FOR SELECT 
  USING (profile_id = auth.uid());

-- Subscription plans RLS policies
CREATE POLICY "public_read_plans" ON subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "business_owners_manage_plans" ON subscription_plans 
  FOR ALL USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

-- Subscriptions RLS policies
CREATE POLICY "business_owners_read_subs" ON subscriptions FOR SELECT 
  USING (customer_id IN (
    SELECT id FROM customers WHERE business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  ) OR customer_id IN (
    SELECT id FROM customers WHERE profile_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin'
  ));

CREATE POLICY "customers_read_own_subs" ON subscriptions FOR SELECT 
  USING (customer_id IN (
    SELECT id FROM customers WHERE profile_id = auth.uid()
  ));

-- Invoices RLS policies
CREATE POLICY "business_owners_read_invoices" ON invoices FOR SELECT 
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ) OR customer_id IN (
    SELECT id FROM customers WHERE profile_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin'
  ));

-- Auto-create profile trigger (already exists from authService, but update)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role) 
  VALUES (NEW.id, NEW.email, 'customer') 
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();