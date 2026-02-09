/* global google */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChoroplethMap from './ChoroplethMap';
import type { RegionData, MapBounds } from './ChoroplethMap.types';

// Mock @react-google-maps/api
const mockFitBounds = jest.fn();
const mockSetStyle = jest.fn();
const mockAddGeoJson = jest.fn();
const mockAddListener = jest.fn();
const mockForEach = jest.fn();
const mockRemove = jest.fn();
const mockOverrideStyle = jest.fn();
const mockRevertStyle = jest.fn();

const mockMap = {
  fitBounds: mockFitBounds,
  data: {
    setStyle: mockSetStyle,
    addGeoJson: mockAddGeoJson,
    addListener: mockAddListener,
    forEach: mockForEach,
    remove: mockRemove,
    overrideStyle: mockOverrideStyle,
    revertStyle: mockRevertStyle,
  },
};

const mockLatLngBounds = jest.fn().mockImplementation(() => ({}));

jest.mock('@react-google-maps/api', () => ({
  GoogleMap: jest.fn(({ children, onLoad }) => {
    // Simulate map load
    if (onLoad) {
      setTimeout(() => onLoad(mockMap as unknown as google.maps.Map), 0);
    }
    return <div data-testid="google-map">{children}</div>;
  }),
  useJsApiLoader: jest.fn(() => ({
    isLoaded: true,
    loadError: undefined,
  })),
}));

// Mock google global
const mockGoogle = {
  maps: {
    LatLngBounds: mockLatLngBounds,
    event: {
      removeListener: jest.fn(),
    },
  },
};

Object.defineProperty(globalThis, 'google', {
  value: mockGoogle,
  writable: true,
});

describe('ChoroplethMap', () => {
  const mockApiKey = 'test-api-key';

  const mockRegionData: RegionData[] = [
    {
      id: 'region-1',
      name: 'Região Norte',
      code: 'RN',
      value: 0.8,
      accessCount: 1500,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-51.0, -24.0],
              [-50.0, -24.0],
              [-50.0, -25.0],
              [-51.0, -25.0],
              [-51.0, -24.0],
            ],
          ],
        },
      },
    },
    {
      id: 'region-2',
      name: 'Região Sul',
      code: 'RS',
      value: 0.3,
      accessCount: 500,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-52.0, -25.0],
              [-51.0, -25.0],
              [-51.0, -26.0],
              [-52.0, -26.0],
              [-52.0, -25.0],
            ],
          ],
        },
      },
    },
  ];

  const mockBounds: MapBounds = {
    north: -23.0,
    south: -27.0,
    east: -48.0,
    west: -55.0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddGeoJson.mockReturnValue([
      {
        setProperty: jest.fn(),
      },
    ]);
  });

  it('renders with default title', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    expect(screen.getByText('Performance por região')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <ChoroplethMap data={[]} apiKey={mockApiKey} title="Custom Title" />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders all legend items', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    expect(screen.getByText('Destaque')).toBeInTheDocument();
    expect(screen.getByText('Acima da média')).toBeInTheDocument();
    expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
    expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading is true', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} loading={true} />);

    expect(screen.getByText('Carregando mapa...')).toBeInTheDocument();
  });

  it('shows loading skeleton when Google Maps is not loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api');
    useJsApiLoader.mockReturnValueOnce({
      isLoaded: false,
      loadError: undefined,
    });

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    expect(screen.getByText('Carregando mapa...')).toBeInTheDocument();
  });

  it('shows error message when Google Maps fails to load', () => {
    const { useJsApiLoader } = require('@react-google-maps/api');
    useJsApiLoader.mockReturnValueOnce({
      isLoaded: false,
      loadError: new Error('Failed to load'),
    });

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    expect(screen.getByText('Erro ao carregar o mapa')).toBeInTheDocument();
  });

  it('renders GoogleMap component when loaded', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChoroplethMap data={[]} apiKey={mockApiKey} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('fits bounds when bounds prop is provided', async () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} bounds={mockBounds} />);

    await waitFor(() => {
      expect(mockLatLngBounds).toHaveBeenCalledWith(
        { lat: mockBounds.south, lng: mockBounds.west },
        { lat: mockBounds.north, lng: mockBounds.east }
      );
    });
  });

  it('adds GeoJSON data to map when data is provided', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(mockRegionData.length);
    });
  });

  it('sets up mouse event listeners', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      // Check that listeners were added for mouseover, mouseout, mousemove, click
      expect(mockAddListener).toHaveBeenCalledWith(
        'mouseover',
        expect.any(Function)
      );
      expect(mockAddListener).toHaveBeenCalledWith(
        'mouseout',
        expect.any(Function)
      );
      expect(mockAddListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
      expect(mockAddListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });
  });

  it('applies styling to map data', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });
  });

  it('calls onRegionClick when a region is clicked', async () => {
    const onRegionClick = jest.fn();

    // Mock the addListener to capture the click handler
    let clickHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'click') {
        clickHandler = handler;
      }
      return {};
    });

    render(
      <ChoroplethMap
        data={mockRegionData}
        apiKey={mockApiKey}
        onRegionClick={onRegionClick}
      />
    );

    await waitFor(() => {
      expect(clickHandler).not.toBeNull();
    });

    // Simulate click event
    if (clickHandler !== null) {
      (clickHandler as (event: unknown) => void)({
        feature: {
          getProperty: (prop: string) => {
            if (prop === 'regionId') return 'region-1';
            return null;
          },
        },
      });
    }

    expect(onRegionClick).toHaveBeenCalledWith(mockRegionData[0]);
  });

  it('handles empty data gracefully', async () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    await waitFor(() => {
      // Should not crash with empty data
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });

  it('clears existing data before adding new data', async () => {
    mockForEach.mockImplementation((callback) => {
      // Simulate having existing features
      callback({ id: 'existing-feature' });
    });

    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockForEach).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});

describe('ChoroplethMap color classification', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('renders regions with appropriate color classes based on values', async () => {
    const dataWithDifferentValues: RegionData[] = [
      {
        id: 'destaque',
        name: 'Destaque',
        value: 0.9,
        accessCount: 1000,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
      {
        id: 'acima',
        name: 'Acima',
        value: 0.6,
        accessCount: 800,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
      {
        id: 'abaixo',
        name: 'Abaixo',
        value: 0.3,
        accessCount: 400,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
      {
        id: 'atencao',
        name: 'Atenção',
        value: 0.1,
        accessCount: 100,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
    ];

    render(
      <ChoroplethMap data={dataWithDifferentValues} apiKey={mockApiKey} />
    );

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    // Verify that setStyle was called with a function
    const styleFunction = mockSetStyle.mock.calls[0][0];
    expect(typeof styleFunction).toBe('function');
  });
});

describe('ChoroplethMap static map and styling', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('passes static map options with zoom enabled', () => {
    const { GoogleMap } = require('@react-google-maps/api');

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const mapProps = GoogleMap.mock.calls[0][0];
    expect(mapProps.options).toEqual(
      expect.objectContaining({
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: true,
        draggable: true,
      })
    );
  });

  it('hides all base map features via styles', () => {
    const { GoogleMap } = require('@react-google-maps/api');

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const mapProps = GoogleMap.mock.calls[0][0];
    const styles = mapProps.options.styles;

    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureType: 'all',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        }),
        expect.objectContaining({
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: expect.arrayContaining([
            { visibility: 'on' },
            { color: '#F6F6F6' },
          ]),
        }),
      ])
    );
  });

  it('passes container style with borderRadius', () => {
    const { GoogleMap } = require('@react-google-maps/api');

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const mapProps = GoogleMap.mock.calls[0][0];
    expect(mapProps.mapContainerStyle).toEqual({
      width: '100%',
      height: '415px',
      borderRadius: '0.5rem',
    });
  });

  it('applies uniform stroke color and weight to polygons', async () => {
    const mockRegion: RegionData[] = [
      {
        id: 'r1',
        name: 'Region 1',
        value: 0.8,
        accessCount: 100,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
    ];

    render(<ChoroplethMap data={mockRegion} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    const styleFunction = mockSetStyle.mock.calls[0][0];
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.8 : null),
    };

    const style = styleFunction(mockFeature);
    expect(style).toEqual(
      expect.objectContaining({
        strokeColor: '#FFFFFF',
        strokeWeight: 0.5,
        fillOpacity: 0.8,
        cursor: 'pointer',
      })
    );
  });

  it('applies uniform stroke on hover overrideStyle', async () => {
    let mouseoverHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'mouseover') {
        mouseoverHandler = handler;
      }
      return {};
    });

    const mockRegion: RegionData[] = [
      {
        id: 'r1',
        name: 'NRE Test',
        value: 0.5,
        accessCount: 200,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
    ];

    const mockFeatureObj = {
      getProperty: (prop: string) => {
        if (prop === 'regionId') return 'r1';
        if (prop === 'regionName') return 'NRE Test';
        return null;
      },
    };

    mockForEach.mockImplementation((cb) => cb(mockFeatureObj));

    render(<ChoroplethMap data={mockRegion} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mouseoverHandler).not.toBeNull();
    });

    (mouseoverHandler as unknown as (event: unknown) => void)({
      feature: mockFeatureObj,
      domEvent: { clientX: 100, clientY: 200 },
    });

    expect(mockOverrideStyle).toHaveBeenCalledWith(
      mockFeatureObj,
      expect.objectContaining({
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 1.5,
      })
    );
  });

  it('renders map container with overflow-hidden class', () => {
    const { container } = render(
      <ChoroplethMap data={[]} apiKey={mockApiKey} />
    );

    const mapContainer = container.querySelector('.bg-\\[\\#F6F6F6\\]');
    expect(mapContainer).toHaveClass('overflow-hidden');
  });
});
