/*
  # Consolidate Description Fields

  ## Overview
  This migration consolidates the two description fields:
  - Drops the old short "description" column (e.g., "All voyages to and from Gabon")
  - Keeps "scope_description" as the main description field
  - This aligns with using scope_description as the primary Description field in UI

  ## Changes Made
  1. Drop the short description column added earlier
  2. Keep scope_description as the main description field
  
  ## Notes
  - Data from short description column is not migrated as scope_description is more detailed
  - scope_description will be displayed with "Description" label in the UI
*/

-- Drop the short description column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'description'
  ) THEN
    ALTER TABLE schemes DROP COLUMN description;
  END IF;
END $$;
