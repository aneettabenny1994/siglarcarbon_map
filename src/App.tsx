import { useEffect, useState } from 'react';
import { SiteShell } from './components/SiteShell';
import { FilterBar } from './components/FilterBar';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { CTASection } from './components/CTASection';
import { useSchemeStore } from './store/useSchemeStore';
import { decodeFiltersFromURL, encodeFiltersToURL } from './utils/urlState';

function App() {
  const { loadSchemes, setFilters, selectScheme, filters, selectedSchemeId, subscribeToChanges } = useSchemeStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadSchemes();

    const { filters: urlFilters, schemeId } = decodeFiltersFromURL();
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
    if (schemeId) {
      selectScheme(schemeId);
    }

    const unsubscribe = subscribeToChanges();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, [loadSchemes, setFilters, selectScheme, subscribeToChanges]);

  useEffect(() => {
    encodeFiltersToURL(filters, selectedSchemeId);
  }, [filters, selectedSchemeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSchemeId) {
        selectScheme(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSchemeId, selectScheme]);

  return (
    <SiteShell>
      <FilterBar />

      <div className="relative h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
        {isMobile ? (
          <>
            <div className="absolute inset-0">
              <MapView />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white shadow-lg border-t border-neutral-border overflow-hidden">
              <Sidebar />
            </div>
          </>
        ) : (
          <div className="h-full flex">
            <div className="w-96 border-r border-neutral-border overflow-hidden bg-background-sidebar">
              <Sidebar />
            </div>
            <div className="flex-1">
              <MapView />
            </div>
          </div>
        )}
      </div>

      <CTASection />
    </SiteShell>
  );
}

export default App;
