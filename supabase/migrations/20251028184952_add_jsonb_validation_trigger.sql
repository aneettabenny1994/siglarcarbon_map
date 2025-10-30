/*
  # Add JSONB Validation Trigger

  ## Purpose
  Prevent "[object Object]" strings from being inserted into JSONB columns
  at the database level, providing an additional safety net.

  ## Changes
  1. Create a validation function that checks JSONB columns
  2. Add a BEFORE INSERT/UPDATE trigger to the schemes table
  3. Automatically convert "[object Object]" strings to NULL to prevent corruption

  ## Security
  - No changes to RLS policies
  - Read-only validation, doesn't expose data
*/

-- Create validation function for JSONB fields
CREATE OR REPLACE FUNCTION validate_jsonb_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Check coverage field
  IF NEW.coverage IS NOT NULL THEN
    IF NEW.coverage::text = '"[object Object]"' OR NEW.coverage::text LIKE '%[object Object]%' THEN
      RAISE WARNING 'Detected invalid coverage value "[object Object]", setting to NULL for record: %', NEW.id;
      NEW.coverage = NULL;
    END IF;
  END IF;

  -- Check compliance field
  IF NEW.compliance IS NOT NULL THEN
    IF NEW.compliance::text = '"[object Object]"' OR NEW.compliance::text LIKE '%[object Object]%' THEN
      RAISE WARNING 'Detected invalid compliance value "[object Object]", setting to NULL for record: %', NEW.id;
      NEW.compliance = NULL;
    END IF;
  END IF;

  -- Check geometry field
  IF NEW.geometry IS NOT NULL THEN
    IF NEW.geometry::text = '"[object Object]"' OR NEW.geometry::text LIKE '%[object Object]%' THEN
      RAISE WARNING 'Detected invalid geometry value "[object Object]", setting to NULL for record: %', NEW.id;
      NEW.geometry = NULL;
    END IF;
  END IF;

  -- Check icon_position field
  IF NEW.icon_position IS NOT NULL THEN
    IF NEW.icon_position::text = '"[object Object]"' OR NEW.icon_position::text LIKE '%[object Object]%' THEN
      RAISE WARNING 'Detected invalid icon_position value "[object Object]", setting to NULL for record: %', NEW.id;
      NEW.icon_position = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to schemes table
DROP TRIGGER IF EXISTS validate_schemes_jsonb ON schemes;
CREATE TRIGGER validate_schemes_jsonb
  BEFORE INSERT OR UPDATE ON schemes
  FOR EACH ROW
  EXECUTE FUNCTION validate_jsonb_fields();
