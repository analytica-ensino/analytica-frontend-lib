import type { Story } from '@ladle/react';
import ChoroplethMap from './ChoroplethMap';
import type { RegionData, MapBounds } from './ChoroplethMap.types';

/**
 * Google Maps API key for Ladle stories
 */
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.warn(
    'VITE_GOOGLE_MAPS_API_KEY is not set. Map stories will not load.'
  );
}

/**
 * Mock data with multiple cities per NRE to demonstrate NRE boundary merging
 */
const mockRegionData: RegionData[] = [
  {
    id: 'city-1',
    name: 'NRE Curitiba',
    code: 'CUR-1',
    value: 0.92,
    accessCount: 15420,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Curitiba' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-49.35, -25.35],
            [-49.2, -25.35],
            [-49.2, -25.5],
            [-49.35, -25.5],
            [-49.35, -25.35],
          ],
        ],
      },
    },
  },
  {
    id: 'city-2',
    name: 'NRE Curitiba',
    code: 'CUR-2',
    value: 0.85,
    accessCount: 12300,
    geoJson: {
      type: 'Feature',
      properties: { name: 'São José dos Pinhais' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-49.35, -25.5],
            [-49.2, -25.5],
            [-49.2, -25.65],
            [-49.35, -25.65],
            [-49.35, -25.5],
          ],
        ],
      },
    },
  },
  {
    id: 'city-3',
    name: 'NRE Curitiba',
    code: 'CUR-3',
    value: 0.78,
    accessCount: 9800,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Colombo' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-49.35, -25.2],
            [-49.2, -25.2],
            [-49.2, -25.35],
            [-49.35, -25.35],
            [-49.35, -25.2],
          ],
        ],
      },
    },
  },
  {
    id: 'city-4',
    name: 'NRE Londrina',
    code: 'LON-1',
    value: 0.68,
    accessCount: 8750,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Londrina' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-51.2, -23.2],
            [-51.05, -23.2],
            [-51.05, -23.35],
            [-51.2, -23.35],
            [-51.2, -23.2],
          ],
        ],
      },
    },
  },
  {
    id: 'city-5',
    name: 'NRE Londrina',
    code: 'LON-2',
    value: 0.62,
    accessCount: 7100,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Cambé' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-51.35, -23.2],
            [-51.2, -23.2],
            [-51.2, -23.35],
            [-51.35, -23.35],
            [-51.35, -23.2],
          ],
        ],
      },
    },
  },
  {
    id: 'city-6',
    name: 'NRE Maringá',
    code: 'MAR-1',
    value: 0.45,
    accessCount: 5200,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Maringá' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-52.0, -23.35],
            [-51.85, -23.35],
            [-51.85, -23.5],
            [-52.0, -23.5],
            [-52.0, -23.35],
          ],
        ],
      },
    },
  },
  {
    id: 'city-7',
    name: 'NRE Maringá',
    code: 'MAR-2',
    value: 0.38,
    accessCount: 4100,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Sarandi' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-52.0, -23.2],
            [-51.85, -23.2],
            [-51.85, -23.35],
            [-52.0, -23.35],
            [-52.0, -23.2],
          ],
        ],
      },
    },
  },
  {
    id: 'city-8',
    name: 'NRE Cascavel',
    code: 'CAS-1',
    value: 0.18,
    accessCount: 2100,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Cascavel' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-53.5, -24.9],
            [-53.35, -24.9],
            [-53.35, -25.05],
            [-53.5, -25.05],
            [-53.5, -24.9],
          ],
        ],
      },
    },
  },
  {
    id: 'city-9',
    name: 'NRE Cascavel',
    code: 'CAS-2',
    value: 0.12,
    accessCount: 1500,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Toledo' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-53.5, -25.05],
            [-53.35, -25.05],
            [-53.35, -25.2],
            [-53.5, -25.2],
            [-53.5, -25.05],
          ],
        ],
      },
    },
  },
];

const mockBounds: MapBounds = {
  north: -22.5,
  south: -26.5,
  east: -48.0,
  west: -54.5,
};

/**
 * Default story with multiple cities per NRE
 */
export const Default: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={mockRegionData}
      apiKey={apiKey}
      title="Performance por região"
      bounds={mockBounds}
      onRegionClick={(region) => {
        alert(`Região: ${region.name}\nAcessos: ${region.accessCount}`);
      }}
    />
  </div>
);

/**
 * Loading state
 */
export const Loading: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={[]}
      apiKey={apiKey}
      title="Performance por região"
      loading={true}
    />
  </div>
);

/**
 * Empty state (no data)
 */
export const EmptyData: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap data={[]} apiKey={apiKey} title="Performance por região" />
  </div>
);

/**
 * Custom title
 */
export const CustomTitle: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={mockRegionData}
      apiKey={apiKey}
      title="Acessos por NRE - Janeiro 2024"
      bounds={mockBounds}
    />
  </div>
);

/**
 * All regions with high performance (Destaque)
 */
export const AllHighPerformance: Story = () => {
  const highValues = [0.95, 0.88, 0.82, 0.91, 0.86, 0.93, 0.84, 0.97, 0.89];
  const highCounts = [
    14200, 12800, 11500, 13600, 12100, 14800, 11900, 14500, 13200,
  ];
  const highPerformanceData = mockRegionData.map((region, i) => ({
    ...region,
    value: highValues[i],
    accessCount: highCounts[i],
  }));

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ChoroplethMap
        data={highPerformanceData}
        apiKey={apiKey}
        title="Todas as regiões em destaque"
        bounds={mockBounds}
      />
    </div>
  );
};

/**
 * All regions with low performance (Ponto de atenção)
 */
export const AllLowPerformance: Story = () => {
  const lowValues = [0.18, 0.12, 0.22, 0.08, 0.15, 0.2, 0.1, 0.24, 0.06];
  const lowCounts = [720, 480, 890, 320, 610, 800, 410, 950, 250];
  const lowPerformanceData = mockRegionData.map((region, i) => ({
    ...region,
    value: lowValues[i],
    accessCount: lowCounts[i],
  }));

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ChoroplethMap
        data={lowPerformanceData}
        apiKey={apiKey}
        title="Todas as regiões em ponto de atenção"
        bounds={mockBounds}
      />
    </div>
  );
};

/**
 * With custom className
 */
export const CustomClassName: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={mockRegionData}
      apiKey={apiKey}
      title="Com classe customizada"
      bounds={mockBounds}
      className="shadow-lg"
    />
  </div>
);
