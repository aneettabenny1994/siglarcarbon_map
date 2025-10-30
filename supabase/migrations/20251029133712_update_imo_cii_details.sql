/*
  # Update IMO CII (Carbon Intensity Indicator) Details

  ## Overview
  This migration updates the IMO CII scheme with complete and detailed information
  about its scope, cost implications, exemptions, and rating system.

  ## Changes Made
  1. **Regulation Name**: Simplified for clarity
     - regulation_name: "IMO CII (Carbon Intensity Indicator)" → "IMO CII"

  2. **Scope Description**: Added detailed applicability criteria
     - scope_description: "Applies to ships over 5 000 GT in international trade"

  3. **Cost Implications**: Added comprehensive explanation of indirect costs
     - cost_implications: "Indirect. Poor ratings (D or E) trigger corrective plans, reduced charter value, and higher fuel costs to improve efficiency. No fixed financial penalty."

  4. **Cap**: Explicitly stated as none
     - cap: "None"

  5. **Exemptions**: Added detailed list of exempt vessel types
     - exemption: "Warships, government non-commercial, fishing, and offshore vessels"

  6. **Costs JSONB Field**: Enhanced with detailed rating system notes
     - type: "Operational restrictions"
     - units: "Rating system (A-E)"
     - notes: "Each vessel gets an annual CII rating (A–E) based on CO₂ emitted per transport work (g CO₂ / dwt nm)."

  ## Verification
  The following fields are already correct and don't need updates:
  - id: "imo-cii" ✓
  - scope_region: "Global" ✓
  - scope_status: "Active" ✓
  - scope_valid_from: 2023 ✓

  ## Security
  - No RLS changes needed (data update only)
  - Existing policies cover this update operation
*/

-- Update IMO CII scheme details
UPDATE schemes
SET 
  regulation_name = 'IMO CII',
  scope_description = 'Applies to ships over 5 000 GT in international trade',
  cost_implications = 'Indirect. Poor ratings (D or E) trigger corrective plans, reduced charter value, and higher fuel costs to improve efficiency. No fixed financial penalty.',
  cap = 'None',
  exemption = 'Warships, government non-commercial, fishing, and offshore vessels',
  costs = jsonb_build_object(
    'type', 'Operational restrictions',
    'units', 'Rating system (A-E)',
    'notes', 'Each vessel gets an annual CII rating (A–E) based on CO₂ emitted per transport work (g CO₂ / dwt nm).'
  )
WHERE id = 'imo-cii';
