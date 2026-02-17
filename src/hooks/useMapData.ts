import { useState, useEffect, useCallback, useRef } from 'react';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { RegionData as ChoroplethRegionData } from '../components/ChoroplethMap/ChoroplethMap.types';
import type {
  MapFilters,
  MapDataBounds,
  MapDataRegion,
  MapDataApiResponse,
} from '../types/mapData';

/**
 * Hook return type for useMapData
 */
export interface UseMapDataReturn {
  /** Transformed region data for ChoroplethMap */
  data: ChoroplethRegionData[];
  /** Map bounds from API */
  bounds: MapDataBounds | null;
  /** Complete GeoJSON with NRE field for each municipality */
  geoJSON: FeatureCollection<Polygon | MultiPolygon> | null;
  /** Loading state */
  loading: boolean;
  /** Error message if request failed */
  error: string | null;
  /** Refetch data from API */
  refetch: () => Promise<void>;
}

/**
 * Transform enriched GeoJSON features to ChoroplethMap region data
 * Each city feature has NRE, value, totalAccess from backend enrichment
 * @param geoJSON - Enriched GeoJSON FeatureCollection from backend
 * @returns Array of region data for ChoroplethMap
 */
function transformGeoJSONFeatures(
  geoJSON: FeatureCollection<Polygon | MultiPolygon>
): ChoroplethRegionData[] {
  return geoJSON.features.map((feature) => ({
    id: feature.properties?.GEOCODIGO || feature.properties?.NOME || '',
    name: feature.properties?.NRE
      ? `NRE ${feature.properties.NRE}`
      : feature.properties?.NOME || '',
    value: feature.properties?.value ?? 0,
    accessCount: feature.properties?.totalAccess ?? 0,
    geoJson: feature,
  }));
}

/**
 * Transform API region data to ChoroplethMap region data (fallback)
 * @param region - Region data from API
 * @returns Transformed region data for ChoroplethMap or null if no geoJson
 */
function transformRegionData(
  region: MapDataRegion
): ChoroplethRegionData | null {
  if (!region.geoJson) {
    return null;
  }

  return {
    id: region.schoolGroupId,
    name: region.schoolGroupName,
    code: region.schoolGroupCode,
    value: region.value,
    accessCount: region.totalAccess,
    geoJson: region.geoJson,
  };
}

/**
 * Factory function to create useMapData hook
 *
 * @param fetchMapDataApi - Function to fetch map data from API
 * @returns Hook for managing map data with auto-fetch on filter change
 *
 * @example
 * ```tsx
 * // In your app setup
 * const fetchMapDataApi = async (filters: MapFilters) => {
 *   const response = await api.post('/access-report/access/map', filters);
 *   return response.data;
 * };
 *
 * export const useMapData = createUseMapData(fetchMapDataApi);
 *
 * // In your component
 * const { data, bounds, loading, error } = useMapData(filters);
 * ```
 */
export const createUseMapData = (
  fetchMapDataApi: (filters: MapFilters) => Promise<MapDataApiResponse>
) => {
  return (filters: MapFilters): UseMapDataReturn => {
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const filtersKey = JSON.stringify(filters);
    const fetchIdRef = useRef(0);

    const [data, setData] = useState<ChoroplethRegionData[]>([]);
    const [bounds, setBounds] = useState<MapDataBounds | null>(null);
    const [geoJSON, setGeoJSON] = useState<FeatureCollection<
      Polygon | MultiPolygon
    > | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const mapData = await fetchMapDataApi(filtersRef.current);
        if (fetchIdRef.current !== fetchId) return;

        const transformedRegions = mapData.data.geoJSON
          ? transformGeoJSONFeatures(mapData.data.geoJSON)
          : mapData.data.regions
              .map(transformRegionData)
              .filter((r): r is ChoroplethRegionData => r !== null);
        setData(transformedRegions);
        setBounds(mapData.data.bounds);
        setGeoJSON(mapData.data.geoJSON ?? null);
      } catch (err) {
        if (fetchIdRef.current !== fetchId) return;
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar dados do mapa';
        setError(errorMessage);
        setData([]);
        setBounds(null);
        setGeoJSON(null);
      } finally {
        if (fetchIdRef.current === fetchId) {
          setLoading(false);
        }
      }
    }, [filtersKey]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    return {
      data,
      bounds,
      geoJSON,
      loading,
      error,
      refetch: fetchData,
    };
  };
};
