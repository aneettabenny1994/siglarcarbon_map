/*
  # Rename Database Columns to Detailed Names

  ## Overview
  This migration renames five columns in the schemes table to use more descriptive naming
  that better reflects the data structure (regulation-level and scope-level information).

  ## Column Renames
  - `name` → `regulation_name` - Name of the emission regulation
  - `region` → `scope_region` - Geographic scope region
  - `status` → `scope_status` - Current status of the scope
  - `start_year` → `scope_valid_from` - Year the scope becomes valid
  - `article_url` → `regulation_link` - URL to regulation article

  ## 1. Data Migration Steps
  - Add new columns with nullable constraints
  - Copy data from old columns to new columns
  - Add NOT NULL constraints to required new columns
  - Update CHECK constraints to use new column names
  - Drop old columns
  - Update indexes

  ## 2. Security
  - RLS policies remain unchanged (no column references in policies)

  ## 3. Important Notes
  - Zero data loss approach: new columns added first, then old removed
  - All existing data preserved during migration
  - Indexes updated to maintain query performance
*/

-- Step 1: Add new columns with nullable constraints initially
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_name text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_region text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_status text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_valid_from integer;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS regulation_link text;

-- Step 2: Copy data from old columns to new columns
UPDATE schemes SET regulation_name = name WHERE regulation_name IS NULL;
UPDATE schemes SET scope_region = region WHERE scope_region IS NULL;
UPDATE schemes SET scope_status = status WHERE scope_status IS NULL;
UPDATE schemes SET scope_valid_from = start_year WHERE scope_valid_from IS NULL;
UPDATE schemes SET regulation_link = article_url WHERE regulation_link IS NULL;

-- Step 3: Add NOT NULL constraints to required columns
ALTER TABLE schemes ALTER COLUMN regulation_name SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_region SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_status SET NOT NULL;
ALTER TABLE schemes ALTER COLUMN scope_valid_from SET NOT NULL;

-- Step 4: Drop old CHECK constraints
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS schemes_mode_check;
ALTER TABLE schemes DROP CONSTRAINT IF EXISTS schemes_status_check;

-- Step 5: Add new CHECK constraints with updated column names
ALTER TABLE schemes ADD CONSTRAINT schemes_mode_check
  CHECK (mode IN ('area', 'port'));

ALTER TABLE schemes ADD CONSTRAINT schemes_scope_status_check
  CHECK (scope_status IN ('Active', 'Upcoming', 'Under discussion'));

-- Step 6: Drop old columns
ALTER TABLE schemes DROP COLUMN IF EXISTS name;
ALTER TABLE schemes DROP COLUMN IF EXISTS region;
ALTER TABLE schemes DROP COLUMN IF EXISTS status;
ALTER TABLE schemes DROP COLUMN IF EXISTS start_year;
ALTER TABLE schemes DROP COLUMN IF EXISTS article_url;

-- Step 7: Drop old indexes
DROP INDEX IF EXISTS idx_schemes_region;
DROP INDEX IF EXISTS idx_schemes_status;
DROP INDEX IF EXISTS idx_schemes_start_year;

-- Step 8: Create new indexes with updated column names
CREATE INDEX IF NOT EXISTS idx_schemes_scope_region ON schemes(scope_region);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_status ON schemes(scope_status);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_valid_from ON schemes(scope_valid_from);
