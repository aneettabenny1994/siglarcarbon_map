import { useEffect, useRef, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSchemeStore } from '../store/useSchemeStore';
import { filterSchemes } from '../utils/filterSchemes';
import { AlertCircle } from 'lucide-react';
import { SchemeTooltip } from './SchemeTooltip';
import { EmissionScheme } from '../types/scheme';
import { ensurePolygonGeometry, calculateIconPosition } from '../utils/schemeGeometry';

// --- Region imports ---
import europeGeo from '../../europe.json';
import asiaGeo from '../../asia.json';
import africaGeo from '../../africa.json';
import northAmericaGeo from '../../north_america.json';
import southAmericaGeo from '../../south_america.json';
import oceaniaGeo from '../../oceania.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

// --- Utility: Get bounding box for region ---
function getBounds(geo: any): [[number, number], [number, number]] {
  const coords = geo.features.flatMap((f: any) => {
    const geom = f.geometry;
    if (geom.type === 'Polygon') return geom.coordinates.flat();
    if (geom.type === 'MultiPolygon') return geom.coordinates.flat(2);
    return [];
  });
  const lats = coords.map((c: number[]) => c[1]);
  const lngs = coords.map((c: number[]) => c[0]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)]
  ];
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
  
  const filteredSchemes = useMemo(() => filterSchemes(schemes, filters), [schemes, filters]);

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
      center: [0, 20],
      zoom: 1.8,
      projection: 'mercator' as any
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      setMapLoaded(true);

      // --- Region sources ---
      const regions = [
        { key: 'europe', data: europeGeo, color: '#003f5c' },
        { key: 'asia', data: asiaGeo, color: '#28a745' },
        { key: 'africa', data: africaGeo, color: '#0077b6' },
        { key: 'northAmerica', data: northAmericaGeo, color: '#9c27b0' },
        { key: 'southAmerica', data: southAmericaGeo, color: '#ff5722' },
        { key: 'oceania', data: oceaniaGeo, color: '#fdd835' },
      ];

      regions.forEach(r => {
        map.current!.addSource(r.key, { type: 'geojson', data: r.data });
        map.current!.addLayer({
          id: `${r.key}-fill`,
          type: 'fill',
          source: r.key,
          paint: { 'fill-color': r.color, 'fill-opacity': 0.1 },
          layout: { visibility: 'none' }
        });
        map.current!.addLayer({
          id: `${r.key}-line`,
          type: 'line',
          source: r.key,
          paint: { 'line-color': r.color, 'line-width': 2 },
          layout: { visibility: 'none' }
        });
      });

      // --- Schemes ---
      map.current.addSource('schemes-polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.current.addSource('schemes-icons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

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

      map.current.addLayer({
        id: 'schemes-outline',
        type: 'line',
        source: 'schemes-polygons',
        paint: {
          'line-color': '#333',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            1.5
          ]
        }
      });

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
            'interpolate',
            ['linear'],
            ['zoom'],
            2, 6,
            10, 10,
            15, 14
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // --- Hover & Click events ---
      map.current.on('click', 'schemes-icons', (e) => {
        if (!e.features) return;
        const ids = e.features.map(f => f.properties?.id);
        const clickedSchemes = ids
          .map(id => useSchemeStore.getState().schemes.find(s => s.id === id))
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

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // --- React to region filter changes ---
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const selectedRegions = Array.isArray(filters?.regions) ? filters.regions : [];

    const regionMap = {
      Europe: { key: 'europe', data: europeGeo },
      Asia: { key: 'asia', data: asiaGeo },
      Africa: { key: 'africa', data: africaGeo },
      'North America': { key: 'northAmerica', data: northAmericaGeo },
      'South America': { key: 'southAmerica', data: southAmericaGeo },
      Oceania: { key: 'oceania', data: oceaniaGeo },
    };

    // Show or hide each region
    Object.entries(regionMap).forEach(([regionName, { key }]) => {
      const visible = selectedRegions.includes(regionName);
      map.current!.setLayoutProperty(`${key}-fill`, 'visibility', visible ? 'visible' : 'none');
      map.current!.setLayoutProperty(`${key}-line`, 'visibility', visible ? 'visible' : 'none');
    });

    // Fit to first selected region
    const regionToFit = selectedRegions.find(r => regionMap[r]);
    if (regionToFit) {
      const { data } = regionMap[regionToFit];
      map.current.fitBounds(getBounds(data), { padding: 40, duration: 1000, maxZoom: 6 });
    }

    // Update visible schemes
    const visibleSchemes = filteredSchemes.filter(s => {
      if (!s.scope_region) return false;
      const regions = Array.isArray(s.scope_region) ? s.scope_region : [s.scope_region];
      return regions.some(r => selectedRegions.includes(r));
    });

    const sorted = [...visibleSchemes].sort((a, b) => a.layer_order - b.layer_order);

    const polygonFeatures = sorted.map(s => ({
      type: 'Feature',
      id: s.id,
      properties: {
        id: s.id,
        name: s.regulation_name,
        scope_status: s.scope_status,
        scope_region: s.scope_region
      },
      geometry: ensurePolygonGeometry(s.geometry)
    }));

    const iconFeatures = sorted.map(s => {
      const pos = s.icon_position || calculateIconPosition(s.geometry);
      return {
        type: 'Feature',
        id: s.id,
        properties: { id: s.id, name: s.regulation_name, scope_status: s.scope_status },
        geometry: { type: 'Point', coordinates: [pos.lng, pos.lat] }
      };
    });

    const polySource = map.current.getSource('schemes-polygons') as mapboxgl.GeoJSONSource;
    const iconSource = map.current.getSource('schemes-icons') as mapboxgl.GeoJSONSource;

    if (polySource && iconSource) {
      polySource.setData({ type: 'FeatureCollection', features: polygonFeatures });
      iconSource.setData({ type: 'FeatureCollection', features: iconFeatures });
    }
  }, [filteredSchemes, filters, mapLoaded]);

  // --- Fly to selected scheme ---
  useEffect(() => {
    if (!map.current?.isStyleLoaded() || !selectedSchemeId) return;
    const scheme = schemes.find(s => s.id === selectedSchemeId);
    if (!scheme) return;
    const pos = scheme.icon_position || calculateIconPosition(scheme.geometry);
    map.current.flyTo({ center: [pos.lng, pos.lat], zoom: scheme.mode === 'port' ? 10 : 4, duration: 1500 });
  }, [selectedSchemeId, schemes]);

  if (mapError)
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <div>
            <h3 className="font-semibold text-gray-800">Map Configuration Required</h3>
            <p className="text-sm text-gray-600">{mapError}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {tooltipSchemes && tooltipPosition && (
        <SchemeTooltip
          schemes={tooltipSchemes}
          position={tooltipPosition}
          onViewDetails={selectScheme}
          onClose={() => { setTooltipSchemes(null); setTooltipPosition(null); }}
        />
      )}
    </div>
  );
};
