export type SchemeStatus = 'Active' | 'Upcoming' | 'Under discussion';
export type SchemeMode = 'area' | 'port';
export type ScopeLevel = 'global' | 'regional' | 'country/state' | 'port';
export type Region = 'Europe' | 'Asia' | 'Africa' | 'North America' | 'South America' | 'Middle East' | 'Oceania' | 'Global';

export interface SchemeGeometry {
  type: 'polygon' | 'point';
  coords: number[][] | number[][][];
}

export interface IconPosition {
  lat: number;
  lng: number;
}

export interface SchemeReference {
  label: string;
  url: string;
}

export interface SchemeCoverage {
  legs?: string[];
  gases?: string[];
  scope?: string;
  vessel_types?: string[];
}

export interface SchemeCosts {
  type: string;
  units?: string;
  notes?: string;
}

export interface SchemeCompliance {
  reporting?: string[];
  frequency?: string;
  refs?: SchemeReference[];
}

export interface EmissionScheme {
  id: string;
  regulation_name: string;
  scope_region: Region;
  scope_level: ScopeLevel;
  area: string;
  mode: SchemeMode;
  scope_status: SchemeStatus;
  scope_valid_from: number;
  regulation_link?: string;
  scope_description?: string;
  cost_implications?: string;
  cap?: string;
  exemption?: string;
  coverage?: SchemeCoverage;
  costs?: SchemeCosts;
  compliance?: SchemeCompliance;
  geometry: SchemeGeometry;
  icon_position?: IconPosition;
  layer_order: number;
}

export interface FilterState {
  activeFrom: number | null;
  status: SchemeStatus | null;
  regions: Region[];
  route: string | null;
}

export type SortField = 'scope_status' | 'scope_valid_from' | 'regulation_name' | 'scope_level';
