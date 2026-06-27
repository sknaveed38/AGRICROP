import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const DEFAULT_OPTIONS = {
  radius: 25,
  blur: 15,
  maxZoom: 17,
  minOpacity: 0.4,
  gradient: {
    0.4: '#4CAF50',
    0.6: '#FF9800',
    0.8: '#F44336',
    1.0: '#B71C1C',
  },
};

const HeatmapLayer = ({ points = [], options = {} }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    // Remove existing layer if present
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Only create a new layer if we have valid points
    if (points && points.length > 0) {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Validate points format: each should be [lat, lng] or [lat, lng, intensity]
      const validPoints = points.filter(
        (p) =>
          Array.isArray(p) &&
          p.length >= 2 &&
          !isNaN(p[0]) &&
          !isNaN(p[1])
      );

      if (validPoints.length > 0) {
        const layer = L.heatLayer(validPoints, mergedOptions);
        layer.addTo(map);
        heatLayerRef.current = layer;
      }
    }

    // Cleanup on unmount
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
