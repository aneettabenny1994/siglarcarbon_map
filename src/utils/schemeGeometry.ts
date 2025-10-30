import { IconPosition, SchemeGeometry } from '../types/scheme';

export function createCityPolygon(centerLng: number, centerLat: number, radiusKm: number = 50): number[][][] {
  const points = 32;
  const coords: number[][] = [];
  const earthRadiusKm = 6371;

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm / earthRadiusKm;
    const dy = radiusKm / (earthRadiusKm * Math.cos(centerLat * Math.PI / 180));

    const lng = centerLng + (dx * Math.cos(angle) * 180 / Math.PI);
    const lat = centerLat + (dy * Math.sin(angle) * 180 / Math.PI);

    coords.push([lng, lat]);
  }

  coords.push(coords[0]);

  return [coords];
}

export function calculateIconPosition(geometry: SchemeGeometry): IconPosition | undefined {
  if (geometry.type === 'point') {
    const coords = geometry.coords as number[];
    return { lng: coords[0], lat: coords[1] };
  }

  if (geometry.type === 'polygon') {
    const coords = geometry.coords as number[][][];
    const outerRing = coords[0];

    const lngs = outerRing.map(c => c[0]);
    const lats = outerRing.map(c => c[1]);

    return {
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      lat: (Math.min(...lats) + Math.max(...lats)) / 2
    };
  }

  return undefined;
}

export function ensurePolygonGeometry(geometry: SchemeGeometry): SchemeGeometry {
  if (geometry.type === 'polygon') {
    return geometry;
  }

  const coords = geometry.coords as number[];

  if (!coords || coords.length < 2) {
    console.error('Invalid point coordinates:', coords);
    return {
      type: 'polygon',
      coords: [[[0, 0], [0, 0.1], [0.1, 0.1], [0.1, 0], [0, 0]]]
    };
  }

  const polygonCoords = createCityPolygon(coords[0], coords[1], 50);

  return {
    type: 'polygon',
    coords: polygonCoords
  };
}
