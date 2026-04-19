-- Add RLS policy to allow business owners to insert their own business
DROP POLICY IF EXISTS "business_owner_insert" ON businesses;

CREATE POLICY "business_owner_insert" ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Ensure public read is enabled
DROP POLICY IF EXISTS "public_read" ON businesses;

CREATE POLICY "public_read" ON businesses
  FOR SELECT
  USING (true);

-- Allow business owners to update their own business
DROP POLICY IF EXISTS "business_owner_update" ON businesses;

CREATE POLICY "business_owner_update" ON businesses
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);