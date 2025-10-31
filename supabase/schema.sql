-- Create a schema for the application data
CREATE SCHEMA IF NOT EXISTS app;

-- Set search path to app schema
ALTER ROLE postgres SET search_path TO public, app;
SET search_path TO public, app;

-- Enable RLS on all tables by default
ALTER TABLE app.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.employee_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.transactions ENABLE ROW LEVEL SECURITY;

-- 1. profiles table
CREATE TYPE app.user_role AS ENUM ('subscriber', 'employee', 'admin');

CREATE TABLE app.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role app.user_role NOT NULL DEFAULT 'subscriber',
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS for profiles:
-- Allow users to read and update their own profile
CREATE POLICY "Users can view and update their own profile." ON app.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow admin to view all profiles
CREATE POLICY "Admin can view all profiles." ON app.profiles
  FOR SELECT TO authenticated USING ((SELECT role FROM app.profiles WHERE id = auth.uid()) = 'admin');

-- 2. letters table
CREATE TYPE app.letter_status AS ENUM ('received', 'under_attorney_review', 'posted', 'completed');

CREATE TABLE app.letters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    status app.letter_status NOT NULL DEFAULT 'received',
    form_data jsonb NOT NULL, -- Contains sender, recipient, subject, desired_resolution
    generated_content text,
    pdf_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS for letters:
-- Subscribers can only access their own letters
CREATE POLICY "Subscribers can only access their own letters." ON app.letters
  FOR ALL USING (auth.uid() = subscriber_id) WITH CHECK (auth.uid() = subscriber_id);

-- Admin can access all letters
CREATE POLICY "Admin can access all letters." ON app.letters
  FOR ALL USING ((SELECT role FROM app.profiles WHERE id = auth.uid()) = 'admin');

-- 3. subscriptions table
CREATE TABLE app.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id text NOT NULL,
    stripe_subscription_id text,
    plan_status text NOT NULL, -- e.g., 'active', 'trialing', 'canceled'
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS for subscriptions:
-- Subscribers can only read their own subscription status
CREATE POLICY "Subscribers can read their own subscription status." ON app.subscriptions
  FOR SELECT USING (auth.uid() = subscriber_id);

-- Admin can access all subscriptions
CREATE POLICY "Admin can access all subscriptions." ON app.subscriptions
  FOR ALL USING ((SELECT role FROM app.profiles WHERE id = auth.uid()) = 'admin');

-- 4. employee_metrics table
CREATE TABLE app.employee_metrics (
    employee_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    coupon_code text UNIQUE NOT NULL,
    uses integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    revenue_generated numeric DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS for employee_metrics:
-- Employees can read their own metrics
CREATE POLICY "Employees can read their own metrics." ON app.employee_metrics
  FOR SELECT USING (auth.uid() = employee_id);

-- Admin can access all employee metrics
CREATE POLICY "Admin can access all employee metrics." ON app.employee_metrics
  FOR ALL USING ((SELECT role FROM app.profiles WHERE id = auth.uid()) = 'admin');

-- 5. transactions table
CREATE TABLE app.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL, -- 'one-time' or 'subscription'
    stripe_session_id text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS for transactions:
-- Admin can access all transactions
CREATE POLICY "Admin can access all transactions." ON app.transactions
  FOR ALL USING ((SELECT role FROM app.profiles WHERE id = auth.uid()) = 'admin');

-- 6. Function to create a profile on new user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO app.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Function to update employee metrics (RPC for calculate-commission)
CREATE OR REPLACE FUNCTION app.update_employee_metrics(
    p_employee_id uuid,
    p_amount numeric
)
RETURNS void AS $$
BEGIN
    UPDATE app.employee_metrics
    SET
        uses = uses + 1,
        points = points + 1,
        revenue_generated = revenue_generated + (p_amount * 0.05)
    WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

