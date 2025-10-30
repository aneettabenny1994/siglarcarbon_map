/*
  # Update FuelEU Maritime (EU) Scheme Details

  ## Overview
  This migration updates the FuelEU Maritime scheme with corrected and detailed information
  about cost implications, exemptions, and additional notes.

  ## Changes Made
  1. **Cost Implications**: Updated to reflect the specific penalty structure
     - New value: "€2 400 per tonne of VLSFO equivalent for energy exceeding the allowed GHG-intensity limit."
  
  2. **Costs JSONB Field**: Updated the notes within the costs object
     - New notes value: "Intensity penalties per gCO2e above target."
  
  3. **Verification**: The following fields are already correct and don't need updates:
     - regulation_name: "FuelEU Maritime (EU)" ✓
     - scope_status: "Active" ✓
     - scope_description: "Regulates fuel greenhouse-gas intensity for ships over 5 000 GT on EU-related voyages from 2025." ✓
     - cap: "None." ✓
     - exemption: "Warships, fishing, and government non-commercial vessels." ✓

  ## Security
  - No RLS changes needed (data update only)
  - Existing policies cover this update operation
*/

-- Update FuelEU Maritime scheme details
UPDATE schemes
SET 
  cost_implications = '€2 400 per tonne of VLSFO equivalent for energy exceeding the allowed GHG-intensity limit.',
  costs = jsonb_build_object(
    'type', 'Penalty for non-compliance',
    'units', 'EUR per tonne CO2',
    'notes', 'Intensity penalties per gCO2e above target.'
  )
WHERE id = 'fueleu-maritime';
