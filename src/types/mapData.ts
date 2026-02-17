import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { REPORT_PERIOD } from './common';

export { REPORT_PERIOD };

/**
 * Map filters interface for API requests
 */
export interface MapFilters {
  period: `${REPORT_PERIOD}`;
  targetProfile: string;
  deviceType: string;
  schoolGroupIds?: string[];
  schoolIds?: string[];
}

/**
 * Map bounds interface
 */
export interface MapDataBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Region data from API response
 */
export interface MapDataRegion {
  schoolGroupId: string;
  schoolGroupName: string;
  schoolGroupCode: string | null;
  totalAccess: number;
  value: number;
  geoJson: Feature<MultiPolygon | Polygon> | null;
}

/**
 * Map API response data structure
 */
export interface MapDataApiResponse {
  message: string;
  data: {
    state: string;
    regions: MapDataRegion[];
    bounds: MapDataBounds;
    /** Complete GeoJSON with NRE field for each municipality */
    geoJSON?: FeatureCollection<Polygon | MultiPolygon>;
  };
}
