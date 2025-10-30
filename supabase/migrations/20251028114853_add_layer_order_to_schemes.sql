/*
  # Add Layer Order for Overlapping Schemes

  1. Changes
    - Add `layer_order` column to schemes table
      - Higher values render on top
      - Default: 100 (standard regional schemes)
      - Global schemes: 0 (bottom layer)
      - Port schemes: 200 (top layer, not affected by this)
    
  2. Updates
    - Set IMO CII (global) to layer_order = 0
    - Set regional schemes to layer_order = 100
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schemes' AND column_name = 'layer_order'
  ) THEN
    ALTER TABLE schemes ADD COLUMN layer_order integer DEFAULT 100;
  END IF;
END $$;

UPDATE schemes SET layer_order = 0 WHERE region = 'Global';
UPDATE schemes SET layer_order = 100 WHERE region != 'Global' AND mode = 'area';
