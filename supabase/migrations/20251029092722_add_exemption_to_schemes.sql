/*
  # Add Exemption Column to Schemes Table

  ## Overview
  This migration adds an "exemption" field to specify which entities are exempt
  from the emission regulation.

  ## New Column
  - `exemption` (text, nullable)
    - Describes entities exempt from the regulation
    - Example: "National carriers (Gabonese)."
    - Helps users understand who is not subject to the regulation

  ## Changes Made
  1. Add exemption column to schemes table
  2. Set exemption value for Gabon Carbon Levy

  ## Security
  - No RLS changes needed (existing policies cover new column)
  - New column inherits table's RLS policies automatically

  ## Notes
  - Column is nullable for schemes without exemptions
  - Will be displayed in scheme details above Notes section
*/

-- Add exemption column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'exemption'
  ) THEN
    ALTER TABLE schemes ADD COLUMN exemption text;
  END IF;
END $$;

-- Update exemption value for Gabon Carbon Levy
UPDATE schemes 
SET exemption = 'National carriers (Gabonese).' 
WHERE regulation_name = 'Gabon Carbon Levy';
