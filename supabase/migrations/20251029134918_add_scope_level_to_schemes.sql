/*
  # Add scope_level column to schemes table

  ## Overview
  This migration adds a new `scope_level` column to categorize emission schemes
  by their geographic breadth, enabling hierarchical sorting from global to port-specific regulations.

  ## 1. New Column
  - `scope_level` (text, not null) - Geographic scope level of the regulation
    - Allowed values: 'global', 'regional', 'country/state', 'port'
    - CHECK constraint ensures data integrity

  ## 2. Data Population
  Existing schemes are categorized as follows:

  ### Global Level
  - IMO CII - International Maritime Organization regulation applying worldwide

  ### Regional Level
  - EU ETS - European Union Emissions Trading System
  - FuelEU Maritime (EU) - European Union fuel regulation

  ### Country/State Level
  - California At-Berth Regulation - State-level regulation
  - Djibouti Carbon Levy - Country-level regulation
  - Gabon Carbon Levy - Country-level regulation

  ### Port Level
  - Rotterdam Environmental Fee - Port-specific regulation
  - Singapore Port Emissions Fee - Port-specific regulation

  ## 3. Performance
  - Adds index on `scope_level` for optimized sorting queries

  ## 4. Security
  - RLS policies remain unchanged
  - Public read access maintained
*/

-- Step 1: Add scope_level column with nullable constraint initially
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'scope_level'
  ) THEN
    ALTER TABLE schemes ADD COLUMN scope_level text;
  END IF;
END $$;

-- Step 2: Populate scope_level for existing schemes

-- Global level schemes
UPDATE schemes
SET scope_level = 'global'
WHERE regulation_name = 'IMO CII'
  AND scope_level IS NULL;

-- Regional level schemes
UPDATE schemes
SET scope_level = 'regional'
WHERE regulation_name IN ('EU ETS', 'FuelEU Maritime (EU)')
  AND scope_level IS NULL;

-- Country/State level schemes
UPDATE schemes
SET scope_level = 'country/state'
WHERE regulation_name IN (
  'California At-Berth Regulation',
  'Djibouti Carbon Levy',
  'Gabon Carbon Levy'
)
AND scope_level IS NULL;

-- Port level schemes
UPDATE schemes
SET scope_level = 'port'
WHERE regulation_name IN (
  'Rotterdam Environmental Fee',
  'Singapore Port Emissions Fee'
)
AND scope_level IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE schemes ALTER COLUMN scope_level SET NOT NULL;

-- Step 4: Add CHECK constraint for valid scope levels
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS schemes_scope_level_check;
ALTER TABLE schemes ADD CONSTRAINT schemes_scope_level_check
  CHECK (scope_level IN ('global', 'regional', 'country/state', 'port'));

-- Step 5: Create index for optimized sorting
CREATE INDEX IF NOT EXISTS idx_schemes_scope_level ON schemes(scope_level);
