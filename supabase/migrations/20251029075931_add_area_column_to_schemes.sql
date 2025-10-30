/*
  # Add area column to schemes table

  1. Changes
    - Add `area` column to `schemes` table (text type)
    - Populate area values for existing schemes
  
  2. Notes
    - Area represents the specific geographic scope of each regulation
    - Values range from global to specific ports
*/

-- Add area column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'area'
  ) THEN
    ALTER TABLE schemes ADD COLUMN area text;
  END IF;
END $$;

-- Update area values for existing schemes
UPDATE schemes SET area = 'California' WHERE regulation_name = 'California At-Berth Regulation';
UPDATE schemes SET area = 'Djibouti' WHERE regulation_name = 'Djibouti Carbon Levy';
UPDATE schemes SET area = 'Europe' WHERE regulation_name = 'EU ETS Maritime';
UPDATE schemes SET area = 'Europe' WHERE regulation_name = 'FuelEU Maritime';
UPDATE schemes SET area = 'Gabon' WHERE regulation_name = 'Gabon Carbon Levy';
UPDATE schemes SET area = 'Global' WHERE regulation_name = 'IMO CII (Carbon Intensity Indicator)';
UPDATE schemes SET area = 'Rotterdam port' WHERE regulation_name = 'Rotterdam Environmental Fee';
UPDATE schemes SET area = 'Singapore port' WHERE regulation_name = 'Singapore Port Emissions Fee';
