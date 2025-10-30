/*
  # Revert Database Schema to Original Structure

  ## Overview
  This migration reverts the regulation-based schema changes back to the original
  simpler structure while preserving layer_order and icon_position additions.

  ## 1. Columns to Restore
  - `name` (text, not null) - Name of the emission scheme
  - `region` (text, not null) - Geographic region
  - `mode` (text, not null) - Type: 'area' or 'port'
  - `status` (text, not null) - Status: 'Active', 'Upcoming', 'Under discussion'
  - `start_year` (integer, not null) - Year the scheme starts
  - `article_url` (text, nullable) - URL to article
  - `costs` (jsonb, nullable) - Cost structure information

  ## 2. Data Migration Back
  - Migrate `regulation_name` → `name`
  - Migrate `regulation_link` → `article_url`
  - Migrate `scope_type` → `mode` (port stays 'port', others become 'area')
  - Migrate `scope_region` → `region`
  - Migrate `scope_status` → `status` (normalize "Under consideration" back to "Under discussion")
  - Migrate `scope_valid_from` → `start_year`
  - Reconstruct `costs` JSONB from regulation_type and cost_implication

  ## 3. Columns to Remove
  - regulation_name, regulation_description, regulation_link, regulation_type
  - scope_type, scope_region, scope_status, scope_valid_from, scope_description
  - cost_implication, cap, exemptions

  ## 4. Columns to Retain
  - id, coverage, compliance, geometry, layer_order, icon_position, created_at, updated_at

  ## 5. Indexes
  - Restore original indexes on region, mode, status, start_year
  - Remove new indexes on scope_region, scope_type, regulation_type

  ## 6. Security
  - RLS policies remain unchanged
*/

-- Step 1: Add old columns back with nullable constraints initially
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS mode text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS start_year integer;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS article_url text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS costs jsonb;

-- Step 2: Migrate data from new columns back to old columns
UPDATE schemes SET name = regulation_name WHERE name IS NULL;
UPDATE schemes SET article_url = regulation_link WHERE article_url IS NULL;
UPDATE schemes SET region = scope_region WHERE region IS NULL;
UPDATE schemes SET start_year = scope_valid_from WHERE start_year IS NULL;

-- Migrate scope_status back to status, converting "Under consideration" to "Under discussion"
UPDATE schemes 
SET status = CASE 
  WHEN scope_status = 'Under consideration' THEN 'Under discussion'
  ELSE scope_status
END
WHERE status IS NULL;

-- Migrate scope_type back to mode (simplify to area/port)
UPDATE schemes 
SET mode = CASE 
  WHEN scope_type = 'port' THEN 'port'
  ELSE 'area'
END
WHERE mode IS NULL;

-- Reconstruct costs JSONB from available data
UPDATE schemes 
SET costs = jsonb_build_object(
  'type', COALESCE(regulation_type, 'Unknown'),
  'notes', cost_implication
)
WHERE costs IS NULL;

-- Step 3: Add NOT NULL constraints to required columns
ALTER TABLE schemes ALTER COLUMN name SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN region SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN mode SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN status SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN start_year SET NOT NULL;

-- Step 4: Add CHECK constraints for data validation
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS schemes_mode_check;
ALTER TABLE schemes ADD CONSTRAINT schemes_mode_check 
  CHECK (mode IN ('area', 'port'));

ALTER TABLE schemes DROP CONSTRAINT IF EXISTS schemes_status_check;
ALTER TABLE schemes ADD CONSTRAINT schemes_status_check 
  CHECK (status IN ('Active', 'Upcoming', 'Under discussion'));

-- Step 5: Drop new columns
ALTER TABLE schemes DROP COLUMN IF EXISTS regulation_name;
ALTER TABLE schemes DROP COLUMN IF EXISTS regulation_description;
ALTER TABLE schemes DROP COLUMN IF EXISTS regulation_link;
ALTER TABLE schemes DROP COLUMN IF EXISTS regulation_type;
ALTER TABLE schemes DROP COLUMN IF EXISTS scope_type;
ALTER TABLE schemes DROP COLUMN IF EXISTS scope_region;
ALTER TABLE schemes DROP COLUMN IF EXISTS scope_status;
ALTER TABLE schemes DROP COLUMN IF EXISTS scope_valid_from;
ALTER TABLE schemes DROP COLUMN IF EXISTS scope_description;
ALTER TABLE schemes DROP COLUMN IF EXISTS cost_implication;
ALTER TABLE schemes DROP COLUMN IF EXISTS cap;
ALTER TABLE schemes DROP COLUMN IF EXISTS exemptions;

-- Step 6: Update indexes - drop new ones
DROP INDEX IF EXISTS idx_schemes_scope_region;
DROP INDEX IF EXISTS idx_schemes_scope_type;
DROP INDEX IF EXISTS idx_schemes_regulation_type;
DROP INDEX IF EXISTS idx_schemes_scope_valid_from;

-- Step 7: Restore original indexes
CREATE INDEX IF NOT EXISTS idx_schemes_region ON schemes(region);
CREATE INDEX IF NOT EXISTS idx_schemes_mode ON schemes(mode);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_start_year ON schemes(start_year);

-- Step 8: Drop conflicting constraints from previous migrations
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS check_scope_type;
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS check_scope_status;
