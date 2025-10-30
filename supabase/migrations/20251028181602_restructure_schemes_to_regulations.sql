/*
  # Restructure Schemes Table to Regulation-Based Schema

  ## Overview
  This migration restructures the schemes table to better separate regulation information 
  from scope information, providing a clearer and more maintainable data model.

  ## 1. New Columns Added

  ### Regulation Information
  - `regulation_name` (text, not null) - Name of the regulation
  - `regulation_description` (text) - Detailed description of the regulation
  - `regulation_link` (text) - URL link to regulation documentation
  - `regulation_type` (text) - Type of regulation (e.g., 'Flat tax', 'Carbon tax', 'Cap and trade', 'Port levy', 'Operational restrictions', 'Penalty')

  ### Scope Information
  - `scope_type` (text, not null) - Geographic scope type: 'global', 'continent', 'region', 'state/country', 'port'
  - `scope_region` (text, not null) - Geographic region name (e.g., 'Global', 'Europe', 'Asia', 'Singapore', 'Djibouti')
  - `scope_status` (text, not null) - Current status: 'Active', 'Upcoming', 'Under consideration'
  - `scope_valid_from` (integer, not null) - Year when the regulation becomes/became valid
  - `scope_description` (text) - Additional description of the scope

  ### Cost and Exemption Information
  - `cost_implication` (text) - Description of cost implications
  - `cap` (text) - Information about any caps or limits
  - `exemptions` (text) - Details about exemptions

  ## 2. Data Migration
  - Migrate `name` → `regulation_name`
  - Migrate `article_url` → `regulation_link`
  - Migrate `mode` → `scope_type` (convert 'area' to appropriate scope type based on region, 'port' stays as 'port')
  - Migrate `region` → `scope_region`
  - Migrate `status` → `scope_status` (normalize "Under discussion" to "Under consideration")
  - Migrate `start_year` → `scope_valid_from`
  - Extract `regulation_type` from existing `costs.type` field
  - Generate `cost_implication` from existing `costs` JSONB field

  ## 3. Columns Removed
  - `name` (replaced by regulation_name)
  - `article_url` (replaced by regulation_link)
  - `mode` (replaced by scope_type)
  - `region` (replaced by scope_region)
  - `status` (replaced by scope_status)
  - `start_year` (replaced by scope_valid_from)
  - `costs` (functionality replaced by cost_implication, cap, exemptions)

  ## 4. Columns Retained
  - `id`, `coverage`, `compliance`, `geometry`, `created_at`, `updated_at`, `layer_order`, `icon_position`

  ## 5. Indexes
  - Drop old indexes: idx_schemes_region, idx_schemes_mode
  - Create new indexes on: scope_region, scope_type, regulation_type for query performance

  ## 6. Security
  - RLS policies remain unchanged (public read access, authenticated write access)
*/

-- Step 1: Add new columns with nullable constraints initially
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_name text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_description text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_link text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_type text;

ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_type text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_region text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_status text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_valid_from integer;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_description text;

ALTER TABLE schemes ADD COLUMN IF NOT EXISTS cost_implication text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS cap text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS exemptions text;

-- Step 2: Migrate data from old columns to new columns
UPDATE schemes SET regulation_name = name WHERE regulation_name IS NULL;
UPDATE schemes SET regulation_link = article_url WHERE regulation_link IS NULL;
UPDATE schemes SET scope_region = region WHERE scope_region IS NULL;
UPDATE schemes SET scope_valid_from = start_year WHERE scope_valid_from IS NULL;

-- Migrate status to scope_status, normalizing "Under discussion" to "Under consideration"
UPDATE schemes 
SET scope_status = CASE 
  WHEN status = 'Under discussion' THEN 'Under consideration'
  ELSE status
END
WHERE scope_status IS NULL;

-- Migrate mode to scope_type with proper mapping
UPDATE schemes 
SET scope_type = CASE 
  WHEN mode = 'port' THEN 'port'
  WHEN region = 'Global' THEN 'global'
  WHEN region IN ('Europe', 'Asia', 'Africa', 'North America', 'South America', 'Middle East', 'Oceania') THEN 'continent'
  ELSE 'region'
END
WHERE scope_type IS NULL;

-- Extract regulation_type from costs JSONB field
UPDATE schemes 
SET regulation_type = costs->>'type'
WHERE regulation_type IS NULL AND costs IS NOT NULL;

-- Generate cost_implication from costs JSONB (using proper concatenation)
UPDATE schemes 
SET cost_implication = 
  COALESCE(costs->>'type', '') ||
  CASE 
    WHEN costs->>'units' IS NOT NULL THEN ' - ' || (costs->>'units')
    ELSE '' 
  END ||
  CASE 
    WHEN costs->>'notes' IS NOT NULL THEN '. ' || (costs->>'notes')
    ELSE '' 
  END
WHERE cost_implication IS NULL AND costs IS NOT NULL;

-- Step 3: Add NOT NULL constraints to required columns
ALTER TABLE schemes ALTER COLUMN regulation_name SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_type SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_region SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_status SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_valid_from SET NOT NULL;

-- Step 4: Add CHECK constraints for data validation
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS check_scope_type;
ALTER TABLE schemes ADD CONSTRAINT check_scope_type 
  CHECK (scope_type IN ('global', 'continent', 'region', 'state/country', 'port'));

ALTER TABLE schemes DROP CONSTRAINT IF EXISTS check_scope_status;
ALTER TABLE schemes ADD CONSTRAINT check_scope_status 
  CHECK (scope_status IN ('Active', 'Upcoming', 'Under consideration'));

-- Step 5: Drop old columns
ALTER TABLE schemes DROP COLUMN IF EXISTS name;
ALTER TABLE schemes DROP COLUMN IF EXISTS article_url;
ALTER TABLE schemes DROP COLUMN IF EXISTS mode;
ALTER TABLE schemes DROP COLUMN IF EXISTS region;
ALTER TABLE schemes DROP COLUMN IF EXISTS status;
ALTER TABLE schemes DROP COLUMN IF EXISTS start_year;
ALTER TABLE schemes DROP COLUMN IF EXISTS costs;

-- Step 6: Update indexes
DROP INDEX IF EXISTS idx_schemes_region;
DROP INDEX IF EXISTS idx_schemes_mode;

CREATE INDEX IF NOT EXISTS idx_schemes_scope_region ON schemes(scope_region);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_type ON schemes(scope_type);
CREATE INDEX IF NOT EXISTS idx_schemes_regulation_type ON schemes(regulation_type);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_valid_from ON schemes(scope_valid_from);
