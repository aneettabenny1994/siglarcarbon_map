/*
  # Add Description Column to Schemes Table

  ## Overview
  This migration adds a "description" field to provide human-readable context about
  each emission scheme's geographic scope and applicability.

  ## New Column
  - `description` (text, nullable)
    - Human-readable description of the scheme's geographic scope
    - Example: "All voyages to and from Gabon"
    - Makes it easier for users to understand where regulations apply

  ## Changes Made
  1. Add description column to schemes table
  2. Populate description values for existing schemes:
     - Gabon Carbon Levy: "All voyages to and from Gabon"
     - Djibouti Carbon Levy: "All voyage to and from Djibouti"

  ## Security
  - No RLS changes needed (existing policies cover new column)
  - New column inherits table's RLS policies automatically

  ## Notes
  - Column is nullable for backward compatibility
  - Other schemes can have descriptions added later as needed
*/

-- Add description column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'description'
  ) THEN
    ALTER TABLE schemes ADD COLUMN description text;
  END IF;
END $$;

-- Update description values for existing schemes
UPDATE schemes SET description = 'All voyages to and from Gabon' WHERE regulation_name = 'Gabon Carbon Levy';
UPDATE schemes SET description = 'All voyage to and from Djibouti' WHERE regulation_name = 'Djibouti Carbon Levy';
