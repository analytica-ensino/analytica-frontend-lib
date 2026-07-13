/* global google */
/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChoroplethMap from './ChoroplethMap';
import type {
  RegionData,
  MapBounds,
  ChoroplethMapProps,
} from './ChoroplethMap.types';

// Mock useTheme - return light mode by default
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

// Mock @turf/union - returns first argument for simplicity
jest.mock('@turf/union', () => ({
  __esModule: true,
  default: jest.fn((a: unknown) => a),
}));

// Mock requestAnimationFrame for animation tests.
// cancelAnimationFrame must faithfully drop the callback so tests can
// detect animations being wrongly cancelled (stuck hover regression).
let rafCallbacks = new Map<number, (time: number) => void>();
let rafIdCounter = 0;
jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
  rafIdCounter += 1;
  rafCallbacks.set(rafIdCounter, cb);
  return rafIdCounter;
});
jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
  rafCallbacks.delete(id);
});
jest.spyOn(performance, 'now').mockReturnValue(0);

/**
 * Flush all pending requestAnimationFrame callbacks
 * @param time - Simulated timestamp to pass to callbacks
 */
const flushRAF = (time: number) => {
  const callbacks = [...rafCallbacks.values()];
  rafCallbacks = new Map();
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
const mockGetBounds = jest.fn();

const mockMap = {
  fitBounds: mockFitBounds,
  getZoom: mockGetZoom,
  setZoom: mockSetZoom,
  getBounds: mockGetBounds,
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
    rafCallbacks = new Map();
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

    expect(screen.getByText('Destaque (75% com acesso)')).toBeInTheDocument();
    expect(
      screen.getByText('Acima da média (50 até 74% com acesso)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Abaixo da média (25 até 49% com acesso)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ponto de atenção (Abaixo de 25% com acesso)')
    ).toBeInTheDocument();
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

  it('grows the fractional zoom by the remaining slack after fitBounds', async () => {
    // Viewport spans are exactly twice the target bounds spans
    // (lat 8 vs 4, lng 14 vs 7) → slack of 1 zoom level minus safety margin
    mockGetBounds.mockReturnValue({
      getNorthEast: () => ({ lat: () => -21, lng: () => -44.5 }),
      getSouthWest: () => ({ lat: () => -29, lng: () => -58.5 }),
    });

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} bounds={mockBounds} />);

    await waitFor(() => {
      expect(mockFitBounds).toHaveBeenCalledWith(expect.anything(), 20);
    });

    await waitFor(() => {
      expect(mockSetZoom).toHaveBeenCalledWith(7.95);
    });
  });

  it('does not zoom past the fitted bounds when there is no slack', async () => {
    // Viewport spans match the target bounds spans exactly: no room to grow
    mockGetBounds.mockReturnValue({
      getNorthEast: () => ({ lat: () => -23, lng: () => -48 }),
      getSouthWest: () => ({ lat: () => -27, lng: () => -55 }),
    });

    render(<ChoroplethMap data={[]} apiKey={mockApiKey} bounds={mockBounds} />);

    await waitFor(() => {
      expect(mockFitBounds).toHaveBeenCalledWith(expect.anything(), 20);
    });

    // Zooming past the fitted bounds would crop the edges of the state
    expect(mockSetZoom).not.toHaveBeenCalled();
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
    rafCallbacks = new Map();
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
    rafCallbacks = new Map();
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
    rafCallbacks = new Map();
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
    expect(initialStyle.strokeColor).toBe('#ffffff');
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

  /**
   * Render the map and fire a `mouseover` on a single region, leaving the
   * hover tooltip visible.
   * @param props - Extra props forwarded to ChoroplethMap (e.g. countLabel)
   * @returns The mocked Data.Feature that received the hover
   */
  const renderAndHoverRegion = async (
    props: Partial<ChoroplethMapProps> = {}
  ): Promise<{ feature: unknown }> => {
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

    render(<ChoroplethMap data={mockRegion} apiKey={mockApiKey} {...props} />);

    await waitFor(() => {
      expect(mouseoverHandler).not.toBeNull();
    });

    act(() => {
      (mouseoverHandler as unknown as (event: unknown) => void)({
        feature: mockFeatureObj,
        domEvent: { clientX: 100, clientY: 200 },
      });
    });

    return { feature: mockFeatureObj };
  };

  it('triggers hover animation with overrideStyle on mouseover', async () => {
    const { feature } = await renderAndHoverRegion();

    // Flush hover animation to completion (time >= HOVER_DURATION 200ms)
    act(() => {
      flushRAF(300);
    });

    // After animation, overrideStyle should have been called with target values
    expect(mockOverrideStyle).toHaveBeenCalledWith(
      feature,
      expect.objectContaining({
        strokeColor: '#ffffff',
      })
    );
  });

  it('keeps the revert animation of the previous NRE running when hovering another NRE', async () => {
    let mouseoverHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'mouseover') {
        mouseoverHandler = handler;
      }
      return {};
    });

    /**
     * Build a mocked Data.Feature for a given region
     * @param id - Region id returned by getProperty('regionId')
     * @param name - NRE name returned by getProperty('regionName')
     * @returns Mocked feature object
     */
    const makeFeature = (id: string, name: string) => ({
      getProperty: (prop: string) => {
        if (prop === 'regionId') return id;
        if (prop === 'regionName') return name;
        if (prop === 'regionValue') return 0.5;
        return null;
      },
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    });
    const featureA = makeFeature('rA', 'NRE A');
    const featureB = makeFeature('rB', 'NRE B');

    mockForEach.mockImplementation((cb) => {
      cb(featureA);
      cb(featureB);
    });

    const data: RegionData[] = [
      {
        id: 'rA',
        name: 'NRE A',
        value: 0.5,
        accessCount: 10,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
      {
        id: 'rB',
        name: 'NRE B',
        value: 0.5,
        accessCount: 20,
        geoJson: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[]] },
        },
      },
    ];

    render(<ChoroplethMap data={data} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mouseoverHandler).not.toBeNull();
    });

    // Hover NRE A, then move straight to NRE B while A's animation runs
    act(() => {
      (mouseoverHandler as unknown as (event: unknown) => void)({
        feature: featureA,
        domEvent: { clientX: 0, clientY: 0 },
      });
    });
    act(() => {
      (mouseoverHandler as unknown as (event: unknown) => void)({
        feature: featureB,
        domEvent: { clientX: 0, clientY: 0 },
      });
    });

    // Complete all running animations (time >= HOVER_DURATION 200ms)
    act(() => {
      flushRAF(600);
    });

    // NRE A must be reverted to resting style (not stuck in hover style)
    expect(mockOverrideStyle).toHaveBeenCalledWith(
      featureA,
      expect.objectContaining({ fillOpacity: 0.8, strokeWeight: 0.5 })
    );
    // NRE B must reach the hover style
    expect(mockOverrideStyle).toHaveBeenCalledWith(
      featureB,
      expect.objectContaining({ fillOpacity: 1, strokeWeight: 1 })
    );
  });

  it('shows the default "Acessos" count label in the region tooltip', async () => {
    await renderAndHoverRegion();

    expect(screen.getByText(/Acessos: 200/)).toBeInTheDocument();
  });

  it('shows a custom countLabel in the region tooltip', async () => {
    await renderAndHoverRegion({ countLabel: 'Atividades realizadas' });

    expect(screen.getByText(/Atividades realizadas: 200/)).toBeInTheDocument();
  });

  it('shows the per-profile breakdown in the tooltip when accessBreakdown is present', async () => {
    await renderAndHoverRegion({
      data: [
        {
          id: 'r1',
          name: 'NRE Test',
          value: 0.5,
          accessCount: 200,
          accessBreakdown: {
            students: { withAccess: 300, withoutAccess: 1000 },
            teachers: { withAccess: 40, withoutAccess: 5 },
            managers: { withAccess: 2, withoutAccess: 8 },
          },
          geoJson: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Polygon', coordinates: [[]] },
          },
        },
      ],
    });

    expect(
      screen.getByText(/Estudantes: 300 com acesso, 1\.000 sem acessos/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Professores\(as\): 40 com acesso, 5 sem acessos/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Diretores\(as\): 2 com acesso, 8 sem acessos/)
    ).toBeInTheDocument();
    // Falls back away from the single-count label
    expect(screen.queryByText(/Acessos: 200/)).not.toBeInTheDocument();
  });

  it('renders a headerAction on the right of the header', () => {
    render(
      <ChoroplethMap
        data={[]}
        apiKey={mockApiKey}
        headerAction={<button type="button">Todos dispositivos</button>}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Todos dispositivos' })
    ).toBeInTheDocument();
  });

  it('renders an info alert below the map when infoText is provided', () => {
    render(
      <ChoroplethMap
        data={[]}
        apiKey={mockApiKey}
        infoText="Dados do mapa somam acessos por escola."
      />
    );

    expect(
      screen.getByText('Dados do mapa somam acessos por escola.')
    ).toBeInTheDocument();
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
    expect(rafCallbacks.size).toBeGreaterThan(0);
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
    rafCallbacks = new Map();
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
        strokeColor: '#ffffff',
        strokeWeight: 1,
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
    rafCallbacks = new Map();
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  it('renders all legend items as buttons', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button');
    const acimaBtn = screen
      .getByText('Acima da média (50 até 74% com acesso)')
      .closest('button');
    const abaixoBtn = screen
      .getByText('Abaixo da média (25 até 49% com acesso)')
      .closest('button');
    const atencaoBtn = screen
      .getByText('Ponto de atenção (Abaixo de 25% com acesso)')
      .closest('button');

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

    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;
    expect(destaqueBtn).toHaveStyle({ opacity: 1 });

    act(() => {
      destaqueBtn.click();
    });

    expect(destaqueBtn).toHaveStyle({ opacity: 0.4 });
  });

  it('restores legend class opacity on second click', () => {
    render(<ChoroplethMap data={[]} apiKey={mockApiKey} />);

    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;

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
      getProperty: (prop: string) => {
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        return null;
      },
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

    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;
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
      getProperty: (prop: string) => {
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        return null;
      },
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };
    mockForEach.mockImplementation((cb: (f: typeof mockFeature) => void) => {
      cb(mockFeature);
    });

    render(<ChoroplethMap data={mockRegionData} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;

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

    // Toggle back on
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(mockOverrideStyle).toHaveBeenCalledWith(mockFeature, {
        visible: true,
      });
    });
  });

  it('adjusts map zoom to fit visible features when legend toggled', async () => {
    const mockForEachLatLng = jest.fn();
    const mockFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        return null;
      },
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
    const abaixoBtn = screen
      .getByText('Abaixo da média (25 até 49% com acesso)')
      .closest('button')!;
    act(() => {
      abaixoBtn.click();
    });

    await waitFor(() => {
      expect(mockLatLngBounds).toHaveBeenCalled();
      expect(mockFitBounds).toHaveBeenCalledWith(expect.any(Object), 20);
    });
  });
});

describe('ChoroplethMap isManagedRegion', () => {
  const mockApiKey = 'test-api-key';

  /**
   * Build a minimal GeoJSON polygon feature for region fixtures
   * @returns GeoJSON feature with an empty polygon geometry
   */
  const makeGeoJson = (): RegionData['geoJson'] => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [[]] },
  });

  const managedRegion: RegionData = {
    id: 'managed-1',
    name: 'NRE Gerido',
    value: 0.9,
    accessCount: 350,
    geoJson: makeGeoJson(),
  };

  const explicitManagedRegion: RegionData = {
    id: 'managed-2',
    name: 'NRE Gerido Explicito',
    value: 0.6,
    accessCount: 120,
    isManagedRegion: true,
    geoJson: makeGeoJson(),
  };

  const unmanagedRegion: RegionData = {
    id: 'unmanaged-1',
    name: 'NRE Fora do Escopo',
    value: 0.2,
    accessCount: 40,
    isManagedRegion: false,
    geoJson: makeGeoJson(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockForEach.mockReset();
    rafCallbacks = new Map();
    mockAddGeoJson.mockReturnValue([{ setProperty: jest.fn() }]);
  });

  /**
   * Render the map with the given data and fire a `mouseover` on one region
   * @param data - Region data passed to the component
   * @param hovered - Region whose feature receives the mouseover event
   */
  const renderAndHover = async (data: RegionData[], hovered: RegionData) => {
    let mouseoverHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'mouseover') {
        mouseoverHandler = handler;
      }
      return {};
    });

    const featureObj = {
      getProperty: (prop: string) => {
        if (prop === 'regionId') return hovered.id;
        if (prop === 'regionName') return hovered.name;
        if (prop === 'regionValue') return hovered.value;
        if (prop === 'regionIsManaged')
          return hovered.isManagedRegion !== false;
        return null;
      },
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };
    mockForEach.mockImplementation((cb) => cb(featureObj));

    render(<ChoroplethMap data={data} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mouseoverHandler).not.toBeNull();
    });

    act(() => {
      (mouseoverHandler as unknown as (event: unknown) => void)({
        feature: featureObj,
        domEvent: { clientX: 100, clientY: 200 },
      });
    });
  };

  it('styles unmanaged regions with the unmanaged fill color and default cursor', async () => {
    render(
      <ChoroplethMap
        data={[managedRegion, unmanagedRegion]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    // First setStyle call is the fade-in start (opacity 0)
    const styleFn = mockSetStyle.mock.calls[0][0];

    const unmanagedFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return false;
        if (prop === 'regionValue') return 0.2;
        return null;
      },
    };
    expect(styleFn(unmanagedFeature)).toEqual({
      fillColor: '#e0e0e0',
      fillOpacity: 0,
      strokeColor: '#ffffff',
      strokeWeight: 0.3,
      cursor: 'default',
    });

    const managedFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return true;
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 500;
        return null;
      },
    };
    expect(styleFn(managedFeature)).toEqual({
      fillColor: '#66b584',
      fillOpacity: 0,
      strokeColor: '#ffffff',
      strokeWeight: 0.3,
      cursor: 'pointer',
    });
  });

  it('keeps the unmanaged style at target opacity after fade-in completes', async () => {
    render(<ChoroplethMap data={[unmanagedRegion]} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    act(() => {
      flushRAF(500);
    });

    const styleFn = mockSetStyle.mock.calls.at(-1)![0];
    const unmanagedFeature = {
      getProperty: (prop: string) =>
        prop === 'regionIsManaged' ? false : null,
    };
    expect(styleFn(unmanagedFeature)).toEqual({
      fillColor: '#e0e0e0',
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 0.3,
      cursor: 'default',
    });
  });

  it('sets regionIsManaged property according to each region flag', async () => {
    const createdFeatures: Array<{ setProperty: jest.Mock }> = [];
    mockAddGeoJson.mockImplementation(() => {
      const feature = { setProperty: jest.fn() };
      createdFeatures.push(feature);
      return [feature];
    });

    render(
      <ChoroplethMap
        data={[explicitManagedRegion, managedRegion, unmanagedRegion]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(3);
    });

    // Explicit true
    expect(createdFeatures[0].setProperty).toHaveBeenCalledWith(
      'regionIsManaged',
      true
    );
    // Undefined is treated as managed
    expect(createdFeatures[1].setProperty).toHaveBeenCalledWith(
      'regionIsManaged',
      true
    );
    // Explicit false
    expect(createdFeatures[2].setProperty).toHaveBeenCalledWith(
      'regionIsManaged',
      false
    );
  });

  it('shows a name-only tooltip when hovering an unmanaged region', async () => {
    await renderAndHover([managedRegion, unmanagedRegion], unmanagedRegion);

    expect(screen.getByText('NRE Fora do Escopo')).toBeInTheDocument();
    expect(screen.queryByText(/Acessos:/)).not.toBeInTheDocument();
  });

  it('shows name and access count when hovering a managed region', async () => {
    await renderAndHover([managedRegion, unmanagedRegion], managedRegion);

    expect(screen.getByText('NRE Gerido')).toBeInTheDocument();
    expect(screen.getByText(/Acessos: 350/)).toBeInTheDocument();
  });

  /**
   * Render the map and fire a click on the feature of the given region
   * @param data - Region data passed to the component
   * @param clicked - Region whose feature receives the click event
   * @param onRegionClick - Click callback forwarded to the component
   */
  const renderAndClick = async (
    data: RegionData[],
    clicked: RegionData,
    onRegionClick: jest.Mock
  ) => {
    let clickHandler: ((event: unknown) => void) | null = null;
    mockAddListener.mockImplementation((event, handler) => {
      if (event === 'click') {
        clickHandler = handler;
      }
      return {};
    });

    const mockForEachLatLng = jest.fn();
    mockForEach.mockImplementation((cb) => {
      cb({
        getProperty: (prop: string) => {
          if (prop === 'regionName') return clicked.name;
          return null;
        },
        getGeometry: () => ({ forEachLatLng: mockForEachLatLng }),
      });
    });

    render(
      <ChoroplethMap
        data={data}
        apiKey={mockApiKey}
        onRegionClick={onRegionClick}
      />
    );

    await waitFor(() => {
      expect(clickHandler).not.toBeNull();
    });

    act(() => {
      (clickHandler as unknown as (event: unknown) => void)({
        feature: {
          getProperty: (prop: string) => {
            if (prop === 'regionId') return clicked.id;
            if (prop === 'regionName') return clicked.name;
            return null;
          },
        },
      });
    });
  };

  it('does not call onRegionClick for an unmanaged region but still zooms to it', async () => {
    const onRegionClick = jest.fn();

    await renderAndClick(
      [managedRegion, unmanagedRegion],
      unmanagedRegion,
      onRegionClick
    );

    expect(onRegionClick).not.toHaveBeenCalled();
    // NRE zoom still happens for unmanaged regions
    expect(mockFitBounds).toHaveBeenCalledWith(expect.any(Object), 20);
  });

  it('calls onRegionClick for a managed region', async () => {
    const onRegionClick = jest.fn();

    await renderAndClick(
      [managedRegion, unmanagedRegion],
      managedRegion,
      onRegionClick
    );

    expect(onRegionClick).toHaveBeenCalledWith(managedRegion);
  });

  it('keeps unmanaged features visible and out of fit bounds when a legend class is toggled off', async () => {
    const managedLatLng = jest.fn();
    const unmanagedLatLng = jest.fn();

    const managedFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return true;
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        if (prop === 'regionName') return 'NRE Gerido';
        return null;
      },
      getGeometry: () => ({ forEachLatLng: managedLatLng }),
    };
    const unmanagedFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return false;
        if (prop === 'regionValue') return 0.2;
        if (prop === 'regionName') return 'NRE Fora do Escopo';
        return null;
      },
      getGeometry: () => ({ forEachLatLng: unmanagedLatLng }),
    };
    mockForEach.mockImplementation((cb) => {
      cb(managedFeature);
      cb(unmanagedFeature);
    });

    render(
      <ChoroplethMap
        data={[managedRegion, unmanagedRegion]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    mockOverrideStyle.mockClear();
    mockFitBounds.mockClear();
    unmanagedLatLng.mockClear();

    // Toggle off "Destaque" — the managed feature (value 0.9) belongs to it
    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(mockOverrideStyle).toHaveBeenCalledWith(managedFeature, {
        visible: false,
      });
      expect(mockOverrideStyle).toHaveBeenCalledWith(unmanagedFeature, {
        visible: true,
      });
    });

    // Unmanaged geometry never extends the visible bounds, and with no
    // visible managed feature left, fitBounds must not run
    expect(unmanagedLatLng).not.toHaveBeenCalled();
    expect(mockFitBounds).not.toHaveBeenCalled();
  });

  it('does not refit bounds on mount when all legend classes are active', async () => {
    const managedFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return true;
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        if (prop === 'regionName') return 'NRE Gerido';
        return null;
      },
      getGeometry: () => ({ forEachLatLng: jest.fn() }),
    };
    mockForEach.mockImplementation((cb) => {
      cb(managedFeature);
    });

    render(<ChoroplethMap data={[managedRegion]} apiKey={mockApiKey} />);

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    // Without a legend filter the initial framing comes from the bounds
    // prop, so the visibility effect must not zoom into managed regions
    expect(mockFitBounds).not.toHaveBeenCalled();
  });

  it('refits bounds to visible managed features when a legend class is toggled off', async () => {
    const highValueLatLng = jest.fn();
    const lowValueLatLng = jest.fn();

    const highValueFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return true;
        if (prop === 'regionValue') return 0.9;
        if (prop === 'regionAccessCount') return 100;
        if (prop === 'regionName') return 'NRE Destaque';
        return null;
      },
      getGeometry: () => ({ forEachLatLng: highValueLatLng }),
    };
    const lowValueFeature = {
      getProperty: (prop: string) => {
        if (prop === 'regionIsManaged') return true;
        if (prop === 'regionValue') return 0.1;
        if (prop === 'regionAccessCount') return 20;
        if (prop === 'regionName') return 'NRE Atenção';
        return null;
      },
      getGeometry: () => ({ forEachLatLng: lowValueLatLng }),
    };
    mockForEach.mockImplementation((cb) => {
      cb(highValueFeature);
      cb(lowValueFeature);
    });

    render(
      <ChoroplethMap
        data={[managedRegion, unmanagedRegion]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockSetStyle).toHaveBeenCalled();
    });

    mockFitBounds.mockClear();
    lowValueLatLng.mockClear();

    // Toggle off "Destaque": the low-value managed feature stays visible
    // and the map refits to it
    const destaqueBtn = screen
      .getByText('Destaque (75% com acesso)')
      .closest('button')!;
    act(() => {
      destaqueBtn.click();
    });

    await waitFor(() => {
      expect(lowValueLatLng).toHaveBeenCalled();
      expect(mockFitBounds).toHaveBeenCalledWith(expect.anything(), 20);
    });
  });

  it('re-adds GeoJSON data when only isManagedRegion changes', async () => {
    const { rerender } = render(
      <ChoroplethMap
        data={[managedRegion, unmanagedRegion]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(2);
    });

    // Same signature (new array, same values): data is NOT re-added
    rerender(
      <ChoroplethMap
        data={[{ ...managedRegion }, { ...unmanagedRegion }]}
        apiKey={mockApiKey}
      />
    );
    expect(mockAddGeoJson).toHaveBeenCalledTimes(2);

    // Only the isManagedRegion flag changes: signature differs, data re-added
    rerender(
      <ChoroplethMap
        data={[
          { ...managedRegion, isManagedRegion: false },
          { ...unmanagedRegion },
        ]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(4);
    });
  });

  it('re-adds GeoJSON data when only groupName changes (NRE reassignment)', async () => {
    const { rerender } = render(
      <ChoroplethMap
        data={[{ ...managedRegion, groupName: 'NRE A' }]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(1);
    });

    // Only the NRE (groupName) changes while every other field stays the same:
    // signature must differ so stableData/nreBoundaries recompute.
    rerender(
      <ChoroplethMap
        data={[{ ...managedRegion, groupName: 'NRE B' }]}
        apiKey={mockApiKey}
      />
    );

    await waitFor(() => {
      expect(mockAddGeoJson).toHaveBeenCalledTimes(2);
    });
  });
});
