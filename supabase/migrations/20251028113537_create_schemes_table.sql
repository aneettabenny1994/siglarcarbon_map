/*
  # Create Emission Schemes Table

  1. New Tables
    - `schemes`
      - `id` (text, primary key) - Unique identifier for each scheme
      - `name` (text) - Name of the emission scheme
      - `region` (text) - Geographic region (Europe, Asia, Africa, etc.)
      - `mode` (text) - Type of scheme: 'area' for regional schemes or 'port' for port-specific schemes
      - `status` (text) - Current status: 'Active', 'Upcoming', or 'Under discussion'
      - `start_year` (integer) - Year the scheme starts or started
      - `article_url` (text, nullable) - Optional URL to article with more information
      - `coverage` (jsonb, nullable) - Details about what the scheme covers (legs, gases, scope, vessel types)
      - `costs` (jsonb, nullable) - Cost structure information
      - `compliance` (jsonb, nullable) - Compliance and reporting requirements
      - `geometry` (jsonb) - GeoJSON geometry data (polygon for areas, point for ports)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `schemes` table
    - Add policy for public read access (schemes are public information)
    - Add policy for authenticated users to manage schemes

  3. Indexes
    - Index on region for filtering
    - Index on status for filtering
    - Index on mode for filtering
*/

CREATE TABLE IF NOT EXISTS schemes (
  id text PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('area', 'port')),
  status text NOT NULL CHECK (status IN ('Active', 'Upcoming', 'Under discussion')),
  start_year integer NOT NULL,
  article_url text,
  coverage jsonb,
  costs jsonb,
  compliance jsonb,
  geometry jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schemes are viewable by everyone"
  ON schemes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert schemes"
  ON schemes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update schemes"
  ON schemes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete schemes"
  ON schemes
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_schemes_region ON schemes(region);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_mode ON schemes(mode);
CREATE INDEX IF NOT EXISTS idx_schemes_start_year ON schemes(start_year);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
