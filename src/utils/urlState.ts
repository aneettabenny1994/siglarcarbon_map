import { FilterState } from '../types/scheme';

export const encodeFiltersToURL = (filters: FilterState, schemeId: string | null) => {
  const params = new URLSearchParams();

  if (filters.activeFrom) params.set('from', filters.activeFrom.toString());
  if (filters.status) params.set('status', filters.status);
  if (filters.regions.length > 0) params.set('regions', filters.regions.join(','));
  if (filters.route) params.set('route', filters.route);
  if (schemeId) params.set('id', schemeId);

  const queryString = params.toString();
  const newUrl = queryString ? `?${queryString}` : window.location.pathname;
  window.history.replaceState({}, '', newUrl);
};

export const decodeFiltersFromURL = (): { filters: Partial<FilterState>; schemeId: string | null } => {
  const params = new URLSearchParams(window.location.search);

  const filters: Partial<FilterState> = {};

  const from = params.get('from');
  if (from) filters.activeFrom = parseInt(from);

  const status = params.get('status');
  if (status) filters.status = status as any;

  const regions = params.get('regions');
  if (regions) filters.regions = regions.split(',') as any;

  const route = params.get('route');
  if (route) filters.route = route;

  const schemeId = params.get('id');

  return { filters, schemeId };
};

export const trackAnalytics = (event: string, data?: Record<string, any>) => {
  console.log('[Analytics]', event, data);
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
};
