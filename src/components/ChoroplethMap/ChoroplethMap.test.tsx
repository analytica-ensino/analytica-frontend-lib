/* global google */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChoroplethMap from './ChoroplethMap';
import type { RegionData, MapBounds } from './ChoroplethMap.types';

// Mock useTheme - return light mode by default
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

// Mock @turf/union - returns first argument for simplicity
jest.mock('@turf/union', () => ({
  __esModule: true,
  default: jest.fn((a: unknown) => a),
}));

// Mock requestAnimationFrame for animation tests
let rafCallbacks: ((time: number) => void)[] = [];
jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
  rafCallbacks.push(cb);
  return rafCallbacks.length;
});
jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
jest.spyOn(performance, 'now').mockReturnValue(0);

/**
 * Flush all pending requestAnimationFrame callbacks
 * @param time - Simulated timestamp to pass to callbacks
 */
const flushRAF = (time: number) => {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach((cb) => {
    cb(time);
  });
};

// Mock @react-google-maps/api
const mockFitBounds = jest.fn();
const mockSetStyle = jest.fn();
const mockAddGeoJson = jest.fn();
const mockAddListener = jest.fn();
const mockForEach = jest.fn();
const mockRemove = jest.fn();
const mockOverrideStyle = jest.fn();
const mockRevertStyle = jest.fn();

const mockGetZoom = jest.fn().mockReturnValue(7);
const mockSetZoom = jest.fn();

const mockMap = {
  fitBounds: mockFitBounds,
  getZoom: mockGetZoom,
  setZoom: mockSetZoom,
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

const mockExtend = jest.fn();
const mockIsEmpty = jest.fn().mockReturnValue(false);
const mockLatLngBounds = jest.fn().mockImplementation(() => ({
  extend: mockExtend,
  isEmpty: mockIsEmpty,
}));

// Mock for google.maps.Data constructor (NRE boundary layer)
const mockNreSetStyle = jest.fn();
const mockNreSetMap = jest.fn();
const mockNreAddGeoJson = jest.fn();
const mockDataConstructor = jest.fn().mockImplementation(() => ({
  setStyle: mockNreSetStyle,
  setMap: mockNreSetMap,
  addGeoJson: mockNreAddGeoJson,
}));

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
    Data: mockDataConstructor,
    event: {
      removeListener: jest.fn(),
      addListenerOnce: jest.fn(
        (_instance: unknown, _event: string, cb: () => void) => {
          setTimeout(cb, 0);
        }
      ),
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
              [-51, -24],
              [-50, -24],
              [-50, -25],
              [-51, -25],
              [-51, -24],
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
              [-52, -25],
              [-51, -25],
              [-51, -26],
              [-52, -26],
              [-52, -25],
            ],
          ],
        },
      },
    },
  ];

  const mockBounds: MapBounds = {
    north: -23,
    south: -27,
    east: -48,
    west: -55,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = [];
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
      expect(mockFitBounds).toHaveBeenCalled();
    });
  });

  it('bumps zoom by 0.8 after fitBounds completes', async () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} bounds={mockBounds} />);

    await waitFor(() => {
      expect(mockGoogle.maps.event.addListenerOnce).toHaveBeenCalledWith(
        expect.anything(),
        'idle',
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(mockSetZoom).toHaveBeenCalledWith(7.8);
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

    let clickHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'click') {
        clickHandler = handler;
      }
      return {};
    });

    const mockForEachLatLng = jest.fn();
    const mockGetGeometry = jest.fn().mockReturnValue({
      forEachLatLng: mockForEachLatLng,
    });
    mockForEach.mockImplementation((cb) => {
      cb({
        getProperty: (prop: string) => {
          if (prop === 'regionName') return 'Região Norte';
          return null;
        },
        getGeometry: mockGetGeometry,
      });
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

    if (clickHandler !== null) {
      act(() => {
        (clickHandler as (event: unknown) => void)({
          feature: {
            getProperty: (prop: string) => {
              if (prop === 'regionId') return 'region-1';
              if (prop === 'regionName') return 'Região Norte';
              return null;
            },
          },
        });
      });
    }

    expect(onRegionClick).toHaveBeenCalledWith(mockRegionData[0]);
  });

  it('handles empty data gracefully', async () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
  });

  it('clears existing data before adding new data', async () => {
    mockForEach.mockImplementation((callback: (f: unknown) => void) => {
      callback({
        id: 'existing-feature',
        getProperty: () => 0.5,
        getGeometry: () => ({ forEachLatLng: jest.fn() }),
      });
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
    mockForEach.mockReset();
    rafCallbacks = [];
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

    const styleFunction = mockSetStyle.mock.calls[0][0];
    expect(typeof styleFunction).toBe('function');
  });
});

describe('ChoroplethMap static map and styling', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = [];
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
    const { styles, backgroundColor } = mapProps.options;

    expect(backgroundColor).toBe('#F6F6F6');
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stylers: [{ color: '#F6F6F6' }],
        }),
        expect.objectContaining({
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        }),
        expect.objectContaining({
          elementType: 'geometry.stroke',
          stylers: [{ visibility: 'off' }],
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

  it('renders map container with overflow-hidden class', () => {
    const { container } = render(
      <ChoroplethMap data={[]} apiKey={mockApiKey} />
    );

    const mapContainer = container.querySelector('.bg-background-50');
    expect(mapContainer).toHaveClass('overflow-hidden');
  });
});

describe('ChoroplethMap animations', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = [];
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('starts fade-in with fillOpacity 0', async () => {
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

    // First setStyle call should have opacity 0 (fade-in start)
    const initialStyleFn = mockSetStyle.mock.calls[0][0];
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.8 : null),
    };
    const initialStyle = initialStyleFn(mockFeature);
    expect(initialStyle.fillOpacity).toBe(0);
    expect(initialStyle.strokeColor).toBe('#64B5F6');
    expect(initialStyle.strokeWeight).toBe(0.3);
  });

  it('completes fade-in to target opacity after animation', async () => {
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

    // Flush RAF with time >= FADE_DURATION (400ms) to complete animation
    act(() => {
      flushRAF(500);
    });

    // After animation completes, last setStyle call should have target opacity
    const lastCall = mockSetStyle.mock.calls.at(-1)!;
    const styleFn = lastCall[0];
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.8 : null),
    };
    const finalStyle = styleFn(mockFeature);
    expect(finalStyle.fillOpacity).toBe(0.8);
  });

  it('triggers hover animation with overrideStyle on mouseover', async () => {
    let mouseoverHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'mouseover') {
        mouseoverHandler = handler;
      }
      return {};
    });

    const mockFeatureObj = {
      getProperty: (prop: string) => {
        if (prop === 'regionId') return 'r1';
        if (prop === 'regionName') return 'NRE Test';
        if (prop === 'regionValue') return 0.5;
        return null;
      },
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };

    mockForEach.mockImplementation((cb) => cb(mockFeatureObj));

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

    render(<ChoroplethMap data={mockRegion} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mouseoverHandler).not.toBeNull();
    });

    act(() => {
      (mouseoverHandler as unknown as (event: unknown) => void)({
        feature: mockFeatureObj,
        domEvent: { clientX: 100, clientY: 200 },
      });
    });

    // Flush hover animation to completion (time >= HOVER_DURATION 200ms)
    act(() => {
      flushRAF(300);
    });

    // After animation, overrideStyle should have been called with target values
    expect(mockOverrideStyle).toHaveBeenCalledWith(
      mockFeatureObj,
      expect.objectContaining({
        strokeColor: '#64B5F6',
      })
    );
  });

  it('zooms to NRE region on click', async () => {
    let clickHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'click') {
        clickHandler = handler;
      }
      return {};
    });

    const mockForEachLatLng = jest.fn();
    const mockGetGeometry = jest.fn().mockReturnValue({
      forEachLatLng: mockForEachLatLng,
    });

    mockForEach.mockImplementation((cb) => {
      cb({
        getProperty: (prop: string) => {
          if (prop === 'regionName') return 'NRE Click';
          return null;
        },
        getGeometry: mockGetGeometry,
      });
    });

    const mockRegion: RegionData[] = [
      {
        id: 'r1',
        name: 'NRE Click',
        value: 0.6,
        accessCount: 300,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
    ];

    render(<ChoroplethMap data={mockRegion} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(clickHandler).not.toBeNull();
    });

    act(() => {
      (clickHandler as unknown as (event: unknown) => void)({
        feature: {
          getProperty: (prop: string) => {
            if (prop === 'regionId') return 'r1';
            if (prop === 'regionName') return 'NRE Click';
            return null;
          },
        },
      });
    });

    // Should create LatLngBounds for zoom calculation
    expect(mockLatLngBounds).toHaveBeenCalled();
    expect(mockGetGeometry).toHaveBeenCalled();
    expect(mockForEachLatLng).toHaveBeenCalled();
    // Should call fitBounds with padding 20 for zoom-to-region
    expect(mockFitBounds).toHaveBeenCalledWith(expect.any(Object), 20);
  });

  it('schedules requestAnimationFrame for fade-in', async () => {
    const mockRegion: RegionData[] = [
      {
        id: 'r1',
        name: 'Region 1',
        value: 0.5,
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

    // requestAnimationFrame should have been called for fade-in
    expect(rafCallbacks.length).toBeGreaterThan(0);
  });
});

describe('ChoroplethMap NRE boundary layer', () => {
  const mockApiKey = 'test-api-key';

  const mockRegionData: RegionData[] = [
    {
      id: 'r1',
      name: 'NRE Alpha',
      value: 0.9,
      accessCount: 100,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-51, -24],
              [-50, -24],
              [-50, -25],
              [-51, -25],
              [-51, -24],
            ],
          ],
        },
      },
    },
    {
      id: 'r2',
      name: 'NRE Alpha',
      value: 0.8,
      accessCount: 80,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-50, -24],
              [-49, -24],
              [-49, -25],
              [-50, -25],
              [-50, -24],
            ],
          ],
        },
      },
    },
    {
      id: 'r3',
      name: 'NRE Beta',
      value: 0.3,
      accessCount: 50,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-52, -25],
              [-51, -25],
              [-51, -26],
              [-52, -26],
              [-52, -25],
            ],
          ],
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = [];
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('creates NRE boundary layer with merged polygons', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockDataConstructor).toHaveBeenCalled();
    });

    // Should add one boundary per NRE group (2 groups: Alpha and Beta)
    expect(mockNreAddGeoJson).toHaveBeenCalledTimes(2);
  });

  it('styles NRE boundary layer with thick stroke and no fill', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockNreSetStyle).toHaveBeenCalledWith({
        fillOpacity: 0,
        strokeColor: '#1565C0',
        strokeWeight: 1.5,
        clickable: false,
      });
    });
  });

  it('attaches NRE boundary layer to the map', async () => {
    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockNreSetMap).toHaveBeenCalledWith(mockMap);
    });
  });

  it('cleans up NRE boundary layer on unmount', async () => {
    const { unmount } = render(
      <ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />
    );

    await waitFor(() => {
      expect(mockNreSetMap).toHaveBeenCalledWith(mockMap);
    });

    mockNreSetMap.mockClear();

    unmount();

    expect(mockNreSetMap).toHaveBeenCalledWith(null);
  });
});

describe('ChoroplethMap legend interaction', () => {
  const mockApiKey = 'test-api-key';

  const mockRegionData: RegionData[] = [
    {
      id: 'r1',
      name: 'NRE A',
      value: 0.9,
      accessCount: 100,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    },
    {
      id: 'r2',
      name: 'NRE B',
      value: 0.3,
      accessCount: 50,
      geoJson: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = [];
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('renders all legend items as buttons', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const destaqueBtn = screen.getByText('Destaque').closest('button');
    const acimaBtn = screen.getByText('Acima da média').closest('button');
    const abaixoBtn = screen.getByText('Abaixo da média').closest('button');
    const atencaoBtn = screen.getByText('Ponto de atenção').closest('button');

    expect(destaqueBtn).toBeInTheDocument();
    expect(acimaBtn).toBeInTheDocument();
    expect(abaixoBtn).toBeInTheDocument();
    expect(atencaoBtn).toBeInTheDocument();
  });

  it('all legend classes start active with full opacity', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveStyle({ opacity: 1 });
    });
  });

  it('toggles legend class opacity on click', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const destaqueBtn = screen.getByText('Destaque').closest('button')!;
    expect(destaqueBtn).toHaveStyle({ opacity: 1 });

    act(() => {
      destaqueBtn.click();
    });

    expect(destaqueBtn).toHaveStyle({ opacity: 0.4 });
  });

  it('restores legend class opacity on second click', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const destaqueBtn = screen.getByText('Destaque').closest('button')!;

    act(() => {
      destaqueBtn.click();
    });
    expect(destaqueBtn).toHaveStyle({ opacity: 0.4 });

    act(() => {
      destaqueBtn.click();
    });
    expect(destaqueBtn).toHaveStyle({ opacity: 1 });
  });

  it('hides features on map when legend class is toggled off', async () => {
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.9 : null),
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };
    mockForEach.mockImplementation((cb: (f: typeof mockFeature) => void) => {
      cb(mockFeature);
    });

    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    mockOverrideStyle.mockClear();
    mockRevertStyle.mockClear();

    const destaqueBtn = screen.getByText('Destaque').closest('button')!;
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(mockOverrideStyle).toHaveBeenCalledWith(mockFeature, {
        visible: false,
      });
    });
  });

  it('shows features on map when legend class is toggled back on', async () => {
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.9 : null),
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };
    mockForEach.mockImplementation((cb: (f: typeof mockFeature) => void) => {
      cb(mockFeature);
    });

    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    const destaqueBtn = screen.getByText('Destaque').closest('button')!;

    // Toggle off
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(mockOverrideStyle).toHaveBeenCalledWith(mockFeature, {
        visible: false,
      });
    });

    mockOverrideStyle.mockClear();
    mockRevertStyle.mockClear();

    // Toggle back on
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(mockRevertStyle).toHaveBeenCalledWith(mockFeature);
    });
  });

  it('adjusts map zoom to fit visible features when legend toggled', async () => {
    const mockForEachLatLng = jest.fn();
    const mockFeature = {
      getProperty: (prop: string) => (prop === 'regionValue' ? 0.9 : null),
      getGeometry: () => ({ forEachLatLng: mockForEachLatLng }),
    };
    mockForEach.mockImplementation((cb: (f: typeof mockFeature) => void) => {
      cb(mockFeature);
    });

    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    mockFitBounds.mockClear();
    mockLatLngBounds.mockClear();

    // Toggle off "Abaixo da média" (index 2) — "Destaque" stays visible
    const abaixoBtn = screen.getByText('Abaixo da média').closest('button')!;
    act(() => {
      abaixoBtn.click();
    });

    await waitFor(() => {
      expect(mockLatLngBounds).toHaveBeenCalled();
      expect(mockFitBounds).toHaveBeenCalledWith(expect.any(Object), 20);
    });
  });
});
