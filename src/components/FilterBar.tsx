import { X } from 'lucide-react';
import { useSchemeStore } from '../store/useSchemeStore';
import { Region, SchemeStatus } from '../types/scheme';
import { trackAnalytics } from '../utils/urlState';
import { RegionMultiSelect } from './RegionMultiSelect';

const YEARS = Array.from({ length: 26 }, (_, i) => 2025 + i);
const ROUTES = [
  'Rotterdam→Singapore',
  'Shanghai→Hamburg',
  'Houston→Antwerp',
  'Jebel Ali→Genoa',
  'Santos→Valencia'
];
const STATUSES: SchemeStatus[] = ['Active', 'Upcoming', 'Under discussion'];

export const FilterBar = () => {
  const { filters, setFilters, clearFilters } = useSchemeStore();

  const hasActiveFilters = filters.activeFrom || filters.status || filters.regions.length > 0 || filters.route;

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters({ [key]: value });
    trackAnalytics('filters_changed', { [key]: value });
  };

  const handleClearFilters = () => {
    clearFilters();
    trackAnalytics('filters_changed', { action: 'clear_all' });
  };

  return (
    <div className="bg-white border-b border-neutral-border sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.activeFrom || ''}
            onChange={(e) => handleFilterChange('activeFrom', e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-neutral-border rounded-md text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-text-primary"
          >
            <option value="">Active from</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || null)}
            className="px-3 py-2 border border-neutral-border rounded-md text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-text-primary"
          >
            <option value="">Scheme status</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.route || ''}
            onChange={(e) => handleFilterChange('route', e.target.value || null)}
            className="px-3 py-2 border border-neutral-border rounded-md text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-text-primary"
          >
            <option value="">Example route</option>
            {ROUTES.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>

          <RegionMultiSelect
            selected={filters.regions}
            onChange={(regions) => handleFilterChange('regions', regions)}
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-neutral-hover rounded-md transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
