import { renderHook, waitFor, act } from '@testing-library/react';
import type {
  FeatureCollection,
  MultiPolygon,
  Feature,
  Polygon,
} from 'geojson';
import { createUseMapData } from './useMapData';
import { REPORT_PERIOD } from '../types/mapData';
import type { MapFilters, MapDataApiResponse } from '../types/mapData';

/**
 * Create a mock GeoJSON feature for testing
 */
function createMockFeature(
  properties: Record<string, unknown>
): Feature<Polygon> {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-49, -25],
          [-48, -25],
          [-48, -24],
          [-49, -24],
          [-49, -25],
        ],
      ],
    },
  };
}

const defaultFilters: MapFilters = {
  period: REPORT_PERIOD.SEVEN_DAYS,
  targetProfile: 'STUDENT',
  deviceType: 'todos',
};

const mockBounds = {
  north: -22,
  south: -26,
  east: -48,
  west: -54,
};

describe('useMapData', () => {
  let mockFetchMapData: jest.Mock<Promise<MapDataApiResponse>, [MapFilters]>;
  let useMapData: ReturnType<typeof createUseMapData>;

  beforeEach(() => {
    mockFetchMapData = jest.fn();
    useMapData = createUseMapData(mockFetchMapData);
  });

  describe('initial state and loading', () => {
    it('should start with loading true and empty data', () => {
      mockFetchMapData.mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useMapData(defaultFilters));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.bounds).toBeNull();
      expect(result.current.geoJSON).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('enriched geoJSON path (transformGeoJSONFeatures)', () => {
    it('should transform features with GEOCODIGO and NRE', async () => {
      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            GEOCODIGO: '4106902',
            NOME: 'Curitiba',
            NRE: 'Curitiba',
            value: 85,
            totalAcessos: 1200,
          }),
        ],
      };

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('4106902');
      expect(result.current.data[0].name).toBe('NRE Curitiba');
      expect(result.current.data[0].value).toBe(85);
      expect(result.current.data[0].accessCount).toBe(1200);
      expect(result.current.bounds).toEqual(mockBounds);
      expect(result.current.geoJSON).toBe(geoJSON);
      expect(result.current.error).toBeNull();
    });

    it('should use NOME when NRE is missing', async () => {
      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            GEOCODIGO: '4106902',
            NOME: 'Curitiba',
            value: 50,
            totalAcessos: 300,
          }),
        ],
      };

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data[0].name).toBe('Curitiba');
    });

    it('should use empty string when GEOCODIGO and NOME are missing', async () => {
      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            value: 10,
            totalAcessos: 5,
          }),
        ],
      };

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data[0].id).toBe('');
      expect(result.current.data[0].name).toBe('');
    });

    it('should default value and totalAcessos to 0 when missing', async () => {
      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            GEOCODIGO: '4106902',
            NOME: 'Curitiba',
            NRE: 'Curitiba',
          }),
        ],
      };

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data[0].value).toBe(0);
      expect(result.current.data[0].accessCount).toBe(0);
    });
  });

  describe('fallback regions path (transformRegionData)', () => {
    it('should transform regions with geoJson', async () => {
      const mockFeature = createMockFeature({}) as Feature<
        MultiPolygon | Polygon
      >;

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [
            {
              schoolGroupId: 'sg-1',
              schoolGroupName: 'NRE Curitiba',
              schoolGroupCode: 'NRE-01',
              totalAcessos: 500,
              value: 72,
              geoJson: mockFeature,
            },
          ],
          bounds: mockBounds,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('sg-1');
      expect(result.current.data[0].name).toBe('NRE Curitiba');
      expect(result.current.data[0].code).toBe('NRE-01');
      expect(result.current.data[0].value).toBe(72);
      expect(result.current.data[0].accessCount).toBe(500);
    });

    it('should filter out regions with null geoJson', async () => {
      const mockFeature = createMockFeature({}) as Feature<
        MultiPolygon | Polygon
      >;

      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [
            {
              schoolGroupId: 'sg-1',
              schoolGroupName: 'NRE Curitiba',
              schoolGroupCode: 'NRE-01',
              totalAcessos: 500,
              value: 72,
              geoJson: mockFeature,
            },
            {
              schoolGroupId: 'sg-2',
              schoolGroupName: 'NRE Londrina',
              schoolGroupCode: null,
              totalAcessos: 0,
              value: 0,
              geoJson: null,
            },
          ],
          bounds: mockBounds,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('sg-1');
    });
  });

  describe('error handling', () => {
    it('should set error message from Error instance', async () => {
      mockFetchMapData.mockRejectedValueOnce(new Error('API failed'));

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API failed');
      expect(result.current.data).toEqual([]);
      expect(result.current.bounds).toBeNull();
      expect(result.current.geoJSON).toBeNull();
    });

    it('should set fallback error message for non-Error throws', async () => {
      mockFetchMapData.mockRejectedValueOnce('something went wrong');

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Erro ao carregar dados do mapa');
    });
  });

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const response1: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
        },
      };

      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            GEOCODIGO: '4106902',
            NOME: 'Curitiba',
            NRE: 'Curitiba',
            value: 90,
            totalAcessos: 2000,
          }),
        ],
      };

      const response2: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('4106902');
      expect(mockFetchMapData).toHaveBeenCalledTimes(2);
    });
  });

  describe('api call', () => {
    it('should call fetchMapDataApi with filters', async () => {
      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchMapData).toHaveBeenCalledWith(defaultFilters);
    });
  });

  describe('geoJSON state', () => {
    it('should set geoJSON to null when response has no geoJSON', async () => {
      const response: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
        },
      };

      mockFetchMapData.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useMapData(defaultFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.geoJSON).toBeNull();
    });
  });

  describe('filter changes', () => {
    it('should refetch when filters change', async () => {
      const response1: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
        },
      };

      const geoJSON: FeatureCollection<Polygon | MultiPolygon> = {
        type: 'FeatureCollection',
        features: [
          createMockFeature({
            GEOCODIGO: '4106902',
            NOME: 'Curitiba',
            NRE: 'Curitiba',
            value: 90,
            totalAcessos: 2000,
          }),
        ],
      };

      const response2: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON,
        },
      };

      mockFetchMapData
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2);

      const newFilters: MapFilters = {
        period: REPORT_PERIOD.ONE_MONTH,
        targetProfile: 'TEACHER',
        deviceType: 'mobile',
      };

      const { result, rerender } = renderHook(
        ({ filters }) => useMapData(filters),
        { initialProps: { filters: defaultFilters } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchMapData).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual([]);

      rerender({ filters: newFilters });

      await waitFor(() => {
        expect(mockFetchMapData).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchMapData).toHaveBeenLastCalledWith(newFilters);
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('4106902');
    });

    it('should ignore stale responses when filters change rapidly', async () => {
      let resolveFirst!: (value: MapDataApiResponse) => void;
      const slowPromise = new Promise<MapDataApiResponse>((resolve) => {
        resolveFirst = resolve;
      });

      const fastResponse: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              createMockFeature({
                GEOCODIGO: '4106902',
                NOME: 'Curitiba',
                NRE: 'Curitiba',
                value: 99,
                totalAcessos: 5000,
              }),
            ],
          },
        },
      };

      const staleResponse: MapDataApiResponse = {
        message: 'Success',
        data: {
          state: 'PR',
          regions: [],
          bounds: mockBounds,
          geoJSON: {
            type: 'FeatureCollection',
            features: [
              createMockFeature({
                GEOCODIGO: '0000000',
                NOME: 'Stale',
                NRE: 'Stale',
                value: 1,
                totalAcessos: 1,
              }),
            ],
          },
        },
      };

      mockFetchMapData
        .mockReturnValueOnce(slowPromise)
        .mockResolvedValueOnce(fastResponse);

      const newFilters: MapFilters = {
        period: REPORT_PERIOD.ONE_MONTH,
        targetProfile: 'TEACHER',
        deviceType: 'mobile',
      };

      const { result, rerender } = renderHook(
        ({ filters }) => useMapData(filters),
        { initialProps: { filters: defaultFilters } }
      );

      rerender({ filters: newFilters });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('4106902');
      expect(result.current.data[0].value).toBe(99);

      await act(async () => {
        resolveFirst(staleResponse);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('4106902');
      expect(result.current.data[0].value).toBe(99);
    });
  });
});
