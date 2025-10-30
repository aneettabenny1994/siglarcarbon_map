/*
  # Allow Public Modifications to Schemes Table

  ## Overview
  This migration updates the Row Level Security (RLS) policies on the schemes table
  to allow public (anonymous) users to perform INSERT, UPDATE, and DELETE operations.
  This is necessary because the application uses the anonymous key without authentication.

  ## Changes Made

  1. **Updated INSERT Policy**
     - Changed from `TO authenticated` to `TO public`
     - Allows anyone to insert new schemes

  2. **Updated UPDATE Policy**
     - Changed from `TO authenticated` to `TO public`
     - Allows anyone to update existing schemes

  3. **Updated DELETE Policy**
     - Changed from `TO authenticated` to `TO public`
     - Allows anyone to delete schemes

  4. **SELECT Policy**
     - Remains unchanged (already allows public access)

  ## Security Note
  These policies allow unrestricted access to modify scheme data. This is appropriate
  for development and internal tools, but should be reviewed before production deployment
  if data integrity and access control are concerns.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert schemes" ON schemes;
DROP POLICY IF EXISTS "Authenticated users can update schemes" ON schemes;
DROP POLICY IF EXISTS "Authenticated users can delete schemes" ON schemes;

-- Create new public policies
CREATE POLICY "Anyone can insert schemes"
  ON schemes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update schemes"
  ON schemes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete schemes"
  ON schemes
  FOR DELETE
  TO public
  USING (true);
