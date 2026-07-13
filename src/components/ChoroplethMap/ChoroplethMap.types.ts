import type { Feature, MultiPolygon, Polygon } from 'geojson';

/**
 * Region data interface for choropleth map
 */
export interface RegionData {
  /** Unique identifier for the region (per-city) */
  id: string;
  /** Display name of the region — the municipality (city) name */
  name: string;
  /**
   * Grouping label used only to draw the NRE outline that visually groups the
   * cities of the same NRE. When omitted, the region's own `name` is used as the
   * group (each region is its own group). Coloring, tooltip, hover and zoom are
   * per-city (keyed on `id`/`name`), independent of this field.
   */
  groupName?: string;
  /** Code identifier for the region */
  code?: string | null;
  /** Normalized value between 0 and 1 for color classification */
  value: number;
  /** Raw access count for the region */
  accessCount: number;
  /** GeoJSON feature for the region polygon */
  geoJson: Feature<MultiPolygon | Polygon>;
  /**
   * Whether the region is managed by the logged user. When false, the region
   * is rendered with the unmanaged gray fill, shows a name-only tooltip and
   * does not trigger onRegionClick. Undefined is treated as true.
   */
  isManagedRegion?: boolean;
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
  /** Label shown before the count value in the region tooltip (default: 'Acessos') */
  countLabel?: string;
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
