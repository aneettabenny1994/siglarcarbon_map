import { useEffect, useRef, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSchemeStore } from '../store/useSchemeStore';
import { filterSchemes } from '../utils/filterSchemes';
import { AlertCircle } from 'lucide-react';
import { SchemeTooltip } from './SchemeTooltip';
import { EmissionScheme } from '../types/scheme';
import { ensurePolygonGeometry, calculateIconPosition } from '../utils/schemeGeometry';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
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

  const filteredSchemes = useMemo(() =>
    filterSchemes(schemes, filters),
    [schemes, filters]
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to your .env file.');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/siglarcarbon/ckpdt727w2zjk17nz2vsppyh6',
      center: [15, 30],
      zoom: 2,
      projection: 'mercator' as any
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      console.log('MapView: Map loaded and ready');
      setMapLoaded(true);

      map.current.addSource('schemes-polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.current.addSource('schemes-icons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
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
            [
              'case',
              ['==', ['get', 'scope_region'], 'Global'],
              0.15,
              0.3
            ]
          ]
        }
      });

      map.current.addLayer({
        id: 'schemes-outline',
        type: 'line',
        source: 'schemes-polygons',
        paint: {
          'line-color': [
            'match',
            ['get', 'scope_status'],
            'Active', '#0E9F6E',
            'Upcoming', '#D97706',
            'Under discussion', '#F59E0B',
            '#4F4F4F'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            2
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            [
              'case',
              ['==', ['get', 'scope_region'], 'Global'],
              0.4,
              0.8
            ]
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
            'Active', '#0E9F6E',
            'Upcoming', '#D97706',
            'Under discussion', '#F59E0B',
            '#7A7A7A'
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
          'circle-stroke-color': '#ffffff',
          'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.9
          ]
        }
      });

      map.current.on('click', 'schemes-icons', (e) => {
        if (!e.features || e.features.length === 0) return;

        const clickedFeature = e.features[0];
        const clickedSchemeId = clickedFeature.properties?.id;

        const clickedIconPosition = clickedFeature.geometry.type === 'Point'
          ? clickedFeature.geometry.coordinates as [number, number]
          : null;

        if (!clickedIconPosition) return;

        const allFeaturesAtPoint = map.current!.queryRenderedFeatures(e.point, {
          layers: ['schemes-icons']
        });

        const schemeIds = allFeaturesAtPoint
          .map(f => f.properties?.id)
          .filter((id, index, self) => id && self.indexOf(id) === index);

        const currentSchemes = useSchemeStore.getState().schemes;
        console.log('MapView: Click handler - currentSchemes length:', currentSchemes.length);
        console.log('MapView: Click handler - schemeIds found:', schemeIds);

        const clickedSchemes = schemeIds
          .map(id => currentSchemes.find(s => s.id === id))
          .filter((s): s is EmissionScheme => s !== undefined);

        console.log('MapView: Click handler - clickedSchemes:', clickedSchemes);

        setTooltipSchemes(clickedSchemes);
        setTooltipPosition({ x: e.point.x, y: e.point.y });
      });

      map.current.on('mouseenter', 'schemes-icons', (e) => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }

        if (e.features && e.features.length > 0) {
          const schemeId = e.features[0].properties?.id;
          setHoveredSchemeId(schemeId);

          if (schemeId) {
            map.current!.setFeatureState(
              { source: 'schemes-polygons', id: schemeId },
              { hover: true }
            );
            map.current!.setFeatureState(
              { source: 'schemes-icons', id: schemeId },
              { hover: true }
            );
          }
        }
      });

      map.current.on('mouseleave', 'schemes-icons', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }

        if (hoveredSchemeId) {
          map.current!.setFeatureState(
            { source: 'schemes-polygons', id: hoveredSchemeId },
            { hover: false }
          );
          map.current!.setFeatureState(
            { source: 'schemes-icons', id: hoveredSchemeId },
            { hover: false }
          );
        }
        setHoveredSchemeId(null);
      });

      map.current.on('mouseenter', 'schemes-fill', (e) => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }

        if (e.features && e.features.length > 0) {
          const schemeId = e.features[0].properties?.id;
          setHoveredSchemeId(schemeId);

          if (schemeId) {
            map.current!.setFeatureState(
              { source: 'schemes-polygons', id: schemeId },
              { hover: true }
            );
            map.current!.setFeatureState(
              { source: 'schemes-icons', id: schemeId },
              { hover: true }
            );
          }
        }
      });

      map.current.on('mouseleave', 'schemes-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }

        if (hoveredSchemeId) {
          map.current!.setFeatureState(
            { source: 'schemes-polygons', id: hoveredSchemeId },
            { hover: false }
          );
          map.current!.setFeatureState(
            { source: 'schemes-icons', id: hoveredSchemeId },
            { hover: false }
          );
        }
        setHoveredSchemeId(null);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    if (!map.current.isStyleLoaded()) {
      console.log('MapView: Style not loaded yet, waiting...');
      const checkStyle = () => {
        if (map.current?.isStyleLoaded()) {
          console.log('MapView: Style now loaded, updating schemes');
          updateMapData();
        }
      };
      map.current.once('styledata', checkStyle);
      return;
    }

    updateMapData();

    function updateMapData() {
      if (!map.current) return;

      console.log('MapView: Updating map with filtered schemes count:', filteredSchemes.length);
      console.log('MapView: First 3 schemes:', filteredSchemes.slice(0, 3));

      const sortedSchemes = [...filteredSchemes].sort((a, b) => a.layer_order - b.layer_order);

      const polygonFeatures = sortedSchemes.map(scheme => {
        const geometry = ensurePolygonGeometry(scheme.geometry);

        return {
          type: 'Feature' as const,
          id: scheme.id,
          properties: {
            id: scheme.id,
            name: scheme.regulation_name,
            scope_status: scheme.scope_status,
            scope_region: scheme.scope_region
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: geometry.coords as number[][][]
          }
        };
      });

      const iconFeatures = sortedSchemes.map(scheme => {
        const iconPosition = scheme.icon_position || calculateIconPosition(scheme.geometry);

        return {
          type: 'Feature' as const,
          id: scheme.id,
          properties: {
            id: scheme.id,
            name: scheme.regulation_name,
            scope_status: scheme.scope_status
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [iconPosition?.lng || 0, iconPosition?.lat || 0]
          }
        };
      });

      console.log('MapView: Updating polygon features count:', polygonFeatures.length);
      console.log('MapView: Updating icon features count:', iconFeatures.length);

      const polygonSource = map.current.getSource('schemes-polygons') as mapboxgl.GeoJSONSource;
      const iconSource = map.current.getSource('schemes-icons') as mapboxgl.GeoJSONSource;

      if (polygonSource && iconSource) {
        polygonSource.setData({
          type: 'FeatureCollection',
          features: polygonFeatures
        });

        iconSource.setData({
          type: 'FeatureCollection',
          features: iconFeatures
        });
      } else {
        console.warn('MapView: Sources not ready yet');
      }
    }
  }, [filteredSchemes, mapLoaded]);

  useEffect(() => {
    if (!map.current?.isStyleLoaded() || !selectedSchemeId) return;

    const scheme = schemes.find(s => s.id === selectedSchemeId);
    if (!scheme) return;

    const iconPosition = scheme.icon_position || calculateIconPosition(scheme.geometry);
    if (!iconPosition) return;

    map.current.flyTo({
      center: [iconPosition.lng, iconPosition.lat],
      zoom: scheme.mode === 'port' ? 10 : 4,
      duration: 1500
    });
  }, [selectedSchemeId, schemes]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-brand-light">
        <div className="max-w-md p-6 bg-white rounded-md shadow-sm border border-status-upcoming">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-status-upcoming flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Map Configuration Required</h3>
              <p className="text-sm text-text-secondary mb-3">{mapError}</p>
              <p className="text-sm text-text-secondary">
                Get your free token at{' '}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-primary-dark underline"
                >
                  mapbox.com
                </a>
              </p>
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
