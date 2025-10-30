/*
  # Fix Database Security Issues

  This migration addresses three security concerns:

  1. **Unused Indexes**
     - Removes `idx_schemes_status` index (not being used by queries)
     - Removes `idx_schemes_start_year` index (not being used by queries)
     - These indexes consume storage and slow down write operations without providing query benefits

  2. **Function Search Path Security**
     - Updates `update_updated_at_column` function to use an immutable search_path
     - Sets explicit search_path to prevent search_path injection attacks
     - Ensures the function always references the correct schema objects

  ## Changes Made
  - Drop unused indexes to improve write performance and reduce storage overhead
  - Recreate trigger function with secure search_path configuration
  - Maintain existing trigger functionality while improving security posture
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_schemes_status;
DROP INDEX IF EXISTS idx_schemes_start_year;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_schemes_updated_at ON schemes;

-- Recreate the function with proper search_path security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_schemes_updated_at
  BEFORE UPDATE ON schemes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
