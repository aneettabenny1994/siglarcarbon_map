/*
  # Add Scope and Cost Detail Fields to Schemes

  ## Overview
  This migration adds three new fields to the schemes table to provide more detailed
  information about each emission scheme's scope, cost structure, and spending caps.

  ## New Columns
  1. **scope_description** (text, nullable)
     - Detailed description of the geographical or operational scope
     - Example: "Voyages to and from Gabon"
  
  2. **cost_implications** (text, nullable)
     - Detailed cost information per voyage or activity
     - Example: "17$ per tonne CO2 (50%) per voyage to and from"
  
  3. **cap** (text, nullable)
     - Maximum cap amount per voyage or period
     - Example: "Cap per voyage $15 000"

  ## Changes Made
  - Add three new nullable text columns to schemes table
  - All columns are optional to maintain backward compatibility
  - No data migration needed as all existing records will have NULL values initially

  ## Security
  - No RLS changes needed (existing policies cover new columns)
  - New columns inherit table's RLS policies automatically
*/

-- Add new columns for scope and cost details
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS scope_description text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS cost_implications text;
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS cap text;