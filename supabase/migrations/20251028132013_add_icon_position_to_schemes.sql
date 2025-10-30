/*
  # Add icon_position field to schemes table

  1. Changes
    - Add `icon_position` JSONB field to store lat/lng coordinates for icon placement
    - Format: {"lat": number, "lng": number}
  
  2. Purpose
    - Enable strategic icon placement for each scheme on the map
    - Support hover interactions between icons and their coverage areas
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'icon_position'
  ) THEN
    ALTER TABLE schemes ADD COLUMN icon_position JSONB;
  END IF;
END $$;
