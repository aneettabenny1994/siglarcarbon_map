/*
  # Complete Schemes Database Setup

  ## Overview
  This migration sets up the complete database schema for the maritime carbon pricing
  schemes application, including all tables, columns, indexes, and security policies.

  ## 1. New Tables
    - `schemes` - Stores maritime emission regulation schemes
      - `id` (text, primary key) - Unique identifier
      - `regulation_name` (text, not null) - Name of the regulation
      - `scope_region` (text, not null) - Geographic region
      - `mode` (text, not null) - 'area' or 'port'
      - `scope_status` (text, not null) - 'Active', 'Upcoming', or 'Under discussion'
      - `scope_valid_from` (integer, not null) - Start year
      - `regulation_link` (text, nullable) - URL to article
      - `coverage` (jsonb, nullable) - Coverage details
      - `costs` (jsonb, nullable) - Cost structure
      - `compliance` (jsonb, nullable) - Compliance requirements
      - `geometry` (jsonb, not null) - GeoJSON geometry
      - `layer_order` (integer, default 0) - Z-index for map layers
      - `icon_position` (jsonb, nullable) - Position for port icons
      - `scope_description` (text, nullable) - Detailed scope description
      - `cost_implications` (text, nullable) - Detailed cost information
      - `cap` (text, nullable) - Maximum cap amount
      - `area` (text, nullable) - Area covered description
      - `description` (text, nullable) - General description
      - `exemption` (text, nullable) - Exemption details
      - `scope_level` (text, not null) - Geographic scope level
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - RLS enabled on schemes table
    - Public can read all schemes
    - Public can insert/update/delete schemes (for demo purposes)

  ## 3. Performance
    - Indexes on scope_region, scope_status, scope_valid_from, mode, scope_level
    - Automatic updated_at trigger
*/

-- Create schemes table with all columns
CREATE TABLE IF NOT EXISTS schemes (
  id text PRIMARY KEY,
  regulation_name text NOT NULL,
  scope_region text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('area', 'port')),
  scope_status text NOT NULL CHECK (scope_status IN ('Active', 'Upcoming', 'Under discussion')),
  scope_valid_from integer NOT NULL,
  regulation_link text,
  coverage jsonb,
  costs jsonb,
  compliance jsonb,
  geometry jsonb NOT NULL,
  layer_order integer DEFAULT 0,
  icon_position jsonb,
  scope_description text,
  cost_implications text,
  cap text,
  area text,
  description text,
  exemption text,
  scope_level text NOT NULL CHECK (scope_level IN ('global', 'regional', 'country/state', 'port')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Schemes are viewable by everyone"
  ON schemes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert schemes"
  ON schemes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update schemes"
  ON schemes
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete schemes"
  ON schemes
  FOR DELETE
  TO public
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schemes_scope_region ON schemes(scope_region);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_status ON schemes(scope_status);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_valid_from ON schemes(scope_valid_from);
CREATE INDEX IF NOT EXISTS idx_schemes_mode ON schemes(mode);
CREATE INDEX IF NOT EXISTS idx_schemes_scope_level ON schemes(scope_level);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
