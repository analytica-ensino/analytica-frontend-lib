import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson';

/**
 * Report period enum
 * Matches backend REPORT_PERIOD enum values
 */
export enum REPORT_PERIOD {
  SEVEN_DAYS = '7_DAYS',
  ONE_MONTH = '1_MONTH',
  THREE_MONTHS = '3_MONTHS',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
}

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
  totalAcessos: number;
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
