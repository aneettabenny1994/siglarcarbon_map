import { EmissionScheme, FilterState, SortField } from '../types/scheme';

const ROUTE_REGIONS: Record<string, string[]> = {
  'Rotterdam→Singapore': ['Europe', 'Asia'],
  'Shanghai→Hamburg': ['Asia', 'Europe'],
  'Houston→Antwerp': ['North America', 'Europe'],
  'Jebel Ali→Genoa': ['Middle East', 'Europe'],
  'Santos→Valencia': ['South America', 'Europe'],
};

export const filterSchemes = (schemes: EmissionScheme[], filters: FilterState): EmissionScheme[] => {
  return schemes.filter((scheme) => {
    if (filters.activeFrom && scheme.scope_valid_from > filters.activeFrom) {
      return false;
    }

    if (filters.status && scheme.scope_status !== filters.status) {
      return false;
    }

    if (filters.regions.length > 0 && !filters.regions.includes(scheme.scope_region)) {
      return false;
    }

    if (filters.route) {
      const routeRegions = ROUTE_REGIONS[filters.route];
      if (routeRegions && !routeRegions.includes(scheme.scope_region) && scheme.scope_region !== 'Global') {
        return false;
      }
    }

    return true;
  });
};

const SCOPE_LEVEL_ORDER: Record<string, number> = {
  'global': 0,
  'regional': 1,
  'country/state': 2,
  'port': 3,
};

export const sortSchemes = (schemes: EmissionScheme[], sortField: SortField): EmissionScheme[] => {
  return [...schemes].sort((a, b) => {
    switch (sortField) {
      case 'scope_level': {
        const levelDiff = SCOPE_LEVEL_ORDER[a.scope_level] - SCOPE_LEVEL_ORDER[b.scope_level];
        if (levelDiff !== 0) return levelDiff;
        return a.regulation_name.localeCompare(b.regulation_name);
      }
      case 'scope_status':
        const statusOrder = { 'Active': 0, 'Upcoming': 1, 'Under discussion': 2 };
        return statusOrder[a.scope_status] - statusOrder[b.scope_status];
      case 'scope_valid_from':
        return a.scope_valid_from - b.scope_valid_from;
      case 'regulation_name':
      default:
        return a.regulation_name.localeCompare(b.regulation_name);
    }
  });
};
