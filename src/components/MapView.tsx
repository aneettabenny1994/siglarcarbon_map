import { useEffect, useRef, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSchemeStore } from '../store/useSchemeStore';
import { filterSchemes } from '../utils/filterSchemes';
import { AlertCircle } from 'lucide-react';
import { SchemeTooltip } from './SchemeTooltip';
import { EmissionScheme } from '../types/scheme';
import { ensurePolygonGeometry, calculateIconPosition } from '../utils/schemeGeometry';
import europeGeo from '../../europe.json'; 

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Compute bounding box for a GeoJSON
function getGeoBounds(geo: any) {
  const coords = geo.features.flatMap((f: any) =>
    f.geometry.coordinates.flat(2)
  );
  const lats = coords.map((c: number[]) => c[1]);
  const lngs = coords.map((c: number[]) => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ] as [[number, number], [number, number]];
}

export const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredSchemeId, setHoveredSchemeId] = useState<string | null>(null);
  const [tooltipSchemes, setTooltipSchemes] = useState<EmissionScheme[] | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const { schemes, filters, selectScheme, selectedSchemeId } = useSchemeStore();

  // --- Filter schemes normally ---
  const filteredSchemes = useMemo(
    () => filterSchemes(schemes, filters),
    [schemes, filters]
  );

  // --- Initialize Map ---
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your .env file.');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [15, 30],
      zoom: 2,
      projection: 'mercator' as any
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);

      // Sources
      map.current.addSource('schemes-polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.current.addSource('schemes-icons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Europe outline (added once)
      map.current.addSource('highlight-europe', {
        type: 'geojson',
        data: europeGeo
      });

      map.current.addLayer({
        id: 'highlight-europe',
        type: 'line',
        source: 'highlight-europe',
        paint: {
          'line-color': '#003f5c',
          'line-width': 1.5,
          'line-opacity': 0.3
        },
        layout: { visibility: 'none' }
      });

      // Fill layer
      map.current.addLayer({
        id: 'schemes-fill',
        type: 'fill',
        source: 'schemes-polygons',
        paint: {
          'fill-color': [
            'match',
            ['get', 'scope_status'],
            'Active', '#003f5c',
            'Upcoming', '#2f4b7c',
            'Under discussion', '#ffa600',
            '#cccccc'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.7,
            0.3
          ]
        }
      });

      // Outline layer
      map.current.addLayer({
        id: 'schemes-outline',
        type: 'line',
        source: 'schemes-polygons',
        paint: {
          'line-color': '#333333',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            1.5
          ]
        }
      });

      // Icons layer
      map.current.addLayer({
        id: 'schemes-icons',
        type: 'circle',
        source: 'schemes-icons',
        paint: {
          'circle-color': [
            'match',
            ['get', 'scope_status'],
            'Active', '#003f5c',
            'Upcoming', '#2f4b7c',
            'Under discussion', '#ffa600',
            '#cccccc'
          ],
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            2, 6,
            10, 10,
            15, 14
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Hover + click handlers (same as before)
      map.current.on('click', 'schemes-icons', (e) => {
        if (!e.features || e.features.length === 0) return;
        const ids = e.features.map(f => f.properties?.id);
        const currentSchemes = useSchemeStore.getState().schemes;
        const clickedSchemes = ids
          .map(id => currentSchemes.find(s => s.id === id))
          .filter((s): s is EmissionScheme => !!s);
        setTooltipSchemes(clickedSchemes);
        setTooltipPosition({ x: e.point.x, y: e.point.y });
      });

      map.current.on('mouseenter', 'schemes-icons', (e) => {
        map.current!.getCanvas().style.cursor = 'pointer';
        const id = e.features?.[0]?.properties?.id;
        setHoveredSchemeId(id);
        if (id) {
          map.current!.setFeatureState({ source: 'schemes-polygons', id }, { hover: true });
          map.current!.setFeatureState({ source: 'schemes-icons', id }, { hover: true });
        }
      });

      map.current.on('mouseleave', 'schemes-icons', () => {
        map.current!.getCanvas().style.cursor = '';
        if (hoveredSchemeId) {
          map.current!.setFeatureState({ source: 'schemes-polygons', id: hoveredSchemeId }, { hover: false });
          map.current!.setFeatureState({ source: 'schemes-icons', id: hoveredSchemeId }, { hover: false });
        }
        setHoveredSchemeId(null);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // --- Update map when filters or schemes change ---
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const isEuropeSelected = filters?.region === 'Europe';

    // Control Europe outline visibility
    if (map.current.getLayer('highlight-europe')) {
      map.current.setLayoutProperty(
        'highlight-europe',
        'visibility',
        isEuropeSelected ? 'visible' : 'none'
      );
    }

    // Auto zoom when selecting Europe
    if (isEuropeSelected) {
      const bounds = getGeoBounds(europeGeo);
      map.current.fitBounds(bounds, { padding: 20, duration: 1000 });
    }

    // Use either Europe-filtered or all schemes
    const visibleSchemes = isEuropeSelected
      ? filteredSchemes.filter(s => s.scope_region?.includes('Europe'))
      : filteredSchemes;

    const sorted = [...visibleSchemes].sort((a, b) => a.layer_order - b.layer_order);

   const polygonFeatures = sorted.map((s) => {
  let geometry = ensurePolygonGeometry(s.geometry);

  // Defensive check: ensure geometry has type & coordinates
  if (!geometry || !geometry.type || !geometry.coordinates) {
    console.warn('Invalid geometry for scheme', s.id);
    geometry = { type: 'Polygon', coordinates: [] }; // fallback empty polygon
  }

  return {
    type: 'Feature',
    id: s.id,
    properties: {
      id: s.id,
      name: s.regulation_name,
      scope_status: s.scope_status,
      scope_region: s.scope_region,
    },
    geometry,
  };
});


   const iconFeatures = sorted.map((s) => {
  let pos = s.icon_position || calculateIconPosition(s.geometry);

  // Defensive check: pos must be a valid object with lat/lng
  if (!pos || typeof pos.lat !== 'number' || typeof pos.lng !== 'number') {
    console.warn('Invalid icon position for scheme', s.id);
    pos = { lat: 0, lng: 0 }; // fallback
  }

  return {
    type: 'Feature',
    id: s.id,
    properties: {
      id: s.id,
      name: s.regulation_name,
      scope_status: s.scope_status,
    },
    geometry: { type: 'Point', coordinates: [pos.lng, pos.lat] },
  };
});

    const polySource = map.current.getSource('schemes-polygons') as mapboxgl.GeoJSONSource;
    const iconSource = map.current.getSource('schemes-icons') as mapboxgl.GeoJSONSource;

    if (polySource && iconSource) {
      polySource.setData({ type: 'FeatureCollection', features: polygonFeatures });
      iconSource.setData({ type: 'FeatureCollection', features: iconFeatures });
    }
  }, [filteredSchemes, filters, mapLoaded]);

  // --- Center on selected scheme ---
  useEffect(() => {
    if (!map.current?.isStyleLoaded() || !selectedSchemeId) return;
    const scheme = schemes.find(s => s.id === selectedSchemeId);
    if (!scheme) return;
    const pos = scheme.icon_position || calculateIconPosition(scheme.geometry);
    map.current.flyTo({
      center: [pos.lng, pos.lat],
      zoom: scheme.mode === 'port' ? 10 : 4,
      duration: 1500
    });
  }, [selectedSchemeId, schemes]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Map Configuration Required</h3>
              <p className="text-sm text-gray-600">{mapError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {tooltipSchemes && tooltipPosition && (
        <SchemeTooltip
          schemes={tooltipSchemes}
          position={tooltipPosition}
          onViewDetails={selectScheme}
          onClose={() => {
            setTooltipSchemes(null);
            setTooltipPosition(null);
          }}
        />
      )}
    </div>
  );
};
