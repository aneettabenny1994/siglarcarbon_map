import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSchemeStore } from '../store/useSchemeStore';
import { filterSchemes, sortSchemes } from '../utils/filterSchemes';
import { SortField } from '../types/scheme';
import { trackAnalytics } from '../utils/urlState';
import { SchemeDetails } from './SchemeDetails';

export const Sidebar = () => {
  const {
    schemes,
    filters,
    sortField,
    setSortField,
    sidebarView,
    setSidebarView,
    selectedSchemeId,
    selectScheme
  } = useSchemeStore();

  const listScrollRef = useRef<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredSchemes = useMemo(() => {
    const filtered = filterSchemes(schemes, filters);
    return sortSchemes(filtered, sortField);
  }, [schemes, filters, sortField]);

  useEffect(() => {
    if (sidebarView === 'list' && listRef.current) {
      listRef.current.scrollTop = listScrollRef.current;
    }
  }, [sidebarView]);

  const handleSchemeClick = (id: string) => {
    if (listRef.current) {
      listScrollRef.current = listRef.current.scrollTop;
    }
    selectScheme(id);
    trackAnalytics('scheme_opened', { scheme_id: id });
  };

  const handleBackToList = () => {
    selectScheme(null);
    setSidebarView('list');
    trackAnalytics('sidebar_state_changed', { view: 'list' });
  };

  const selectedScheme = schemes.find(s => s.id === selectedSchemeId);

  const statusColors = {
    'Active': 'bg-green-50 text-status-active',
    'Upcoming': 'bg-orange-50 text-status-upcoming',
    'Under discussion': 'bg-yellow-50 text-status-discussion'
  };

  if (sidebarView === 'details' && selectedScheme) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-neutral-border flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="p-2 hover:bg-neutral-hover rounded-md transition-colors text-text-primary"
            aria-label="Back to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
            <h2 className="font-heading font-bold text-lg text-text-primary truncate">{selectedScheme.regulation_name}</h2>
            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[selectedScheme.scope_status]}`}>
              {selectedScheme.scope_status}
            </span>
          </div>
        </div>

        <SchemeDetails scheme={selectedScheme} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-neutral-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-text-primary">
            <span className="text-text-muted" aria-live="polite">{filteredSchemes.length}</span> Schemes
          </h2>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="text-sm px-2 py-1 border border-neutral-border rounded-md bg-white text-text-primary"
          >
            <option value="scope_level">Sort by Scope</option>
            <option value="regulation_name">Sort by Name</option>
            <option value="scope_status">Sort by Status</option>
            <option value="scope_valid_from">Sort by Year</option>
          </select>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filteredSchemes.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            <p>No schemes match your filters.</p>
            <p className="text-sm mt-2">Try adjusting your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-border">
            {filteredSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleSchemeClick(scheme.id)}
                className="w-full p-4 text-left hover:bg-neutral-hover transition-colors focus:bg-neutral-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-text-primary mb-1 truncate">
                      {scheme.regulation_name}
                    </h3>
                    {scheme.scope_description && (
                      <div className="text-sm text-text-secondary">
                        {scheme.scope_description}
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[scheme.scope_status]}`}>
                    {scheme.scope_status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
