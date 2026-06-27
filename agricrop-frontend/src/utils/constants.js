/**
 * Colour palette for disease labels used in charts and badges.
 * Access unknown diseases via the `default` key.
 */
export const DISEASE_COLORS = {
  Healthy: '#4CAF50',
  'Bacterial Blight': '#F44336',
  'Brown Spot': '#FF9800',
  'Leaf Blast': '#E91E63',
  'Leaf Smut': '#9C27B0',
  Tungro: '#FF5722',
  'Sheath Blight': '#795548',
  'Rice Hispa': '#607D8B',
  'Neck Blast': '#F44336',
  default: '#9E9E9E',
};

/** Supported crop types for field creation forms. */
export const CROP_TYPES = [
  'Rice',
  'Wheat',
  'Corn',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Potato',
  'Tomato',
  'Onion',
  'Other',
];

/** Supported soil classifications for field creation forms. */
export const SOIL_TYPES = [
  'Sandy',
  'Clay',
  'Loamy',
  'Silt',
  'Peat',
  'Chalky',
  'Sandy Loam',
  'Clay Loam',
  'Silty Clay',
];

/**
 * Risk-level definitions with label, foreground colour, and background colour.
 */
export const RISK_LEVELS = {
  low: { label: 'Low Risk', color: '#4CAF50', bg: '#E8F5E9' },
  medium: { label: 'Medium Risk', color: '#FF9800', bg: '#FFF3E0' },
  high: { label: 'High Risk', color: '#F44336', bg: '#FFEBEE' },
  critical: { label: 'Critical', color: '#B71C1C', bg: '#FFCDD2' },
};

/** Default centre of the Leaflet map (India). */
export const MAP_CENTER = [20.5937, 78.9629];

/** Default zoom level for the Leaflet map. */
export const MAP_ZOOM = 5;
