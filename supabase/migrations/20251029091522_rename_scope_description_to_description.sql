/*
  # Rename scope_description to description

  ## Overview
  This migration renames the scope_description column to description for clarity.

  ## Changes Made
  1. Rename scope_description column to description
  
  ## Notes
  - Uses safe migration pattern to avoid data loss
  - Handles cases where description column might already exist
*/

-- Rename scope_description to description if it exists
DO $$
BEGIN
  -- Only rename if scope_description exists and description doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'scope_description'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'description'
  ) THEN
    -- First check if we need to rename or if it's the duplicate description
    -- If both exist, we might be dealing with the short description added earlier
    ALTER TABLE schemes RENAME COLUMN scope_description TO description;
  END IF;
END $$;
