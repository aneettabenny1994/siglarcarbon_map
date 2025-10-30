/*
  # Update Djibouti Carbon Levy Details

  ## Overview
  This migration updates the Djibouti Carbon Levy scheme with complete and accurate information
  about its status, costs, scope, and implementation details.

  ## Changes Made
  1. **Status Update**: Changed from "Upcoming" (2026) to "Active" (2023)
     - scope_status: "Upcoming" → "Active"
     - scope_valid_from: 2026 → 2023

  2. **Scope Description**: Added detailed geographic scope
     - scope_description: "All voyage to and from Djibouti."

  3. **Cost Implications**: Added detailed cost structure
     - cost_implications: "17$ per tonne CO2 (50%) per voyage to and from Djibouti."

  4. **Cap**: Added maximum cap per voyage
     - cap: "Cap per voyage $7 500."

  5. **Costs JSONB Field**: Updated with structured cost information
     - type: "Carbon levy"
     - units: "USD per tonne CO2"
     - notes: "None."

  6. **Exemption**: Set to TBA (To Be Announced)
     - exemption: "TBA."

  ## Verification
  The following fields are already correct and don't need updates:
  - id: "djibouti-carbon-levy" ✓
  - regulation_name: "Djibouti Carbon Levy" ✓
  - scope_region: "Africa" ✓
  - area: "Djibouti" ✓

  ## Security
  - No RLS changes needed (data update only)
  - Existing policies cover this update operation
*/

-- Update Djibouti Carbon Levy scheme details
UPDATE schemes
SET 
  scope_status = 'Active',
  scope_valid_from = 2023,
  scope_description = 'All voyage to and from Djibouti.',
  cost_implications = '17$ per tonne CO2 (50%) per voyage to and from Djibouti.',
  cap = 'Cap per voyage $7 500.',
  exemption = 'TBA.',
  costs = jsonb_build_object(
    'type', 'Carbon levy',
    'units', 'USD per tonne CO2',
    'notes', 'None.'
  )
WHERE id = 'djibouti-carbon-levy';
