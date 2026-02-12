import type { Feature, MultiPolygon, Polygon } from 'geojson';

/**
 * Region data interface for choropleth map
 */
export interface RegionData {
  /** Unique identifier for the region */
  id: string;
  /** Display name of the region */
  name: string;
  /** Code identifier for the region */
  code?: string | null;
  /** Normalized value between 0 and 1 for color classification */
  value: number;
  /** Raw access count for the region */
  accessCount: number;
  /** GeoJSON feature for the region polygon */
  geoJson: Feature<MultiPolygon | Polygon>;
}

/**
 * Legend item interface for choropleth map
 */
export interface LegendItem {
  /** Display label for the legend item */
  label: string;
  /** Fill color for the legend item */
  color: string;
  /** Optional border color for the legend item */
  borderColor?: string;
}

/**
 * Map bounds interface
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Props interface for ChoroplethMap component
 */
export interface ChoroplethMapProps {
  /** Array of region data to display on the map. Should be memoized to avoid unnecessary re-renders. */
  data: RegionData[];
  /** Google Maps API key */
  apiKey: string;
  /** Optional title for the map section */
  title?: string;
  /** Loading state indicator */
  loading?: boolean;
  /** Map bounds for initial view */
  bounds?: MapBounds;
  /** Callback when a region is clicked */
  onRegionClick?: (region: RegionData) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Color class configuration for choropleth map
 */
export interface ColorClass {
  /** Minimum threshold value (inclusive) */
  min: number;
  /** Maximum threshold value (exclusive) */
  max: number;
  /** Fill color for regions in this class */
  fillColor: string;
  /** Stroke color for regions in this class */
  strokeColor: string;
  /** Label for the legend */
  label: string;
}
