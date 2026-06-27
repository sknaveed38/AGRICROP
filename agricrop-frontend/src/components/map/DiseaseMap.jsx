import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RISK_CONFIG = {
  low: { color: '#4CAF50', bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
  medium: { color: '#FF9800', bg: 'bg-orange-100', text: 'text-orange-800', label: 'Medium' },
  high: { color: '#F44336', bg: 'bg-red-100', text: 'text-red-800', label: 'High' },
};

const getRiskConfig = (riskLevel) => {
  const key = (riskLevel || 'low').toLowerCase();
  return RISK_CONFIG[key] || RISK_CONFIG.low;
};

const createMarkerIcon = (riskLevel) => {
  const config = getRiskConfig(riskLevel);
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${config.color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
          opacity: 0.5;
          position: absolute;
          top: 3px;
          left: 3px;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

const FitBoundsComponent = ({ markers }) => {
  const map = useMap();

  React.useEffect(() => {
    if (markers && markers.length > 0) {
      const validMarkers = markers.filter(
        (m) => m.lat != null && m.lng != null && !isNaN(m.lat) && !isNaN(m.lng)
      );
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [markers, map]);

  return null;
};

const MarkerPopup = ({ marker }) => {
  const config = getRiskConfig(marker.riskLevel);

  return (
    <div className="min-w-[200px] p-1">
      <h3 className="font-bold text-gray-900 text-sm mb-2 border-b border-gray-100 pb-1.5">
        {marker.fieldName || 'Unknown Field'}
      </h3>
      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-500">Crop</span>
          <span className="text-gray-800 font-medium">{marker.cropType || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-500">Disease</span>
          <span className="text-gray-800 font-medium">{marker.disease || 'Healthy'}</span>
        </div>
        {marker.confidence != null && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-500">Confidence</span>
            <span className="text-gray-800 font-medium">{marker.confidence}%</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1">
          <span className="font-medium text-gray-500">Risk</span>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const DiseaseMap = ({
  markers = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  onMarkerClick,
}) => {
  const markerIcons = useMemo(() => {
    const cache = {};
    return (riskLevel) => {
      const key = (riskLevel || 'low').toLowerCase();
      if (!cache[key]) {
        cache[key] = createMarkerIcon(key);
      }
      return cache[key];
    };
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 h-full min-h-[500px]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full min-h-[500px]"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsComponent markers={markers} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={markerIcons(marker.riskLevel)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(marker);
                }
              },
            }}
          >
            <Popup maxWidth={260} className="custom-popup">
              <MarkerPopup marker={marker} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DiseaseMap;
