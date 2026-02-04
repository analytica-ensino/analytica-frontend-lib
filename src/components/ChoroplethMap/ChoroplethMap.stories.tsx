import type { Story } from '@ladle/react';
import ChoroplethMap from './ChoroplethMap';
import type { RegionData, MapBounds } from './ChoroplethMap.types';

/**
 * Mock data for NREs (Núcleos Regionais de Educação) in Paraná
 */
const mockRegionData: RegionData[] = [
  {
    id: 'nre-1',
    name: 'NRE Curitiba',
    code: 'CUR',
    value: 0.92,
    accessCount: 15420,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Curitiba' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-49.4, -25.3],
            [-49.2, -25.3],
            [-49.2, -25.5],
            [-49.4, -25.5],
            [-49.4, -25.3],
          ],
        ],
      },
    },
  },
  {
    id: 'nre-2',
    name: 'NRE Londrina',
    code: 'LON',
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
            [-51.0, -23.2],
            [-51.0, -23.4],
            [-51.2, -23.4],
            [-51.2, -23.2],
          ],
        ],
      },
    },
  },
  {
    id: 'nre-3',
    name: 'NRE Maringá',
    code: 'MAR',
    value: 0.45,
    accessCount: 5200,
    geoJson: {
      type: 'Feature',
      properties: { name: 'Maringá' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-52.0, -23.3],
            [-51.8, -23.3],
            [-51.8, -23.5],
            [-52.0, -23.5],
            [-52.0, -23.3],
          ],
        ],
      },
    },
  },
  {
    id: 'nre-4',
    name: 'NRE Cascavel',
    code: 'CAS',
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
            [-53.3, -24.9],
            [-53.3, -25.1],
            [-53.5, -25.1],
            [-53.5, -24.9],
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
 * Default story with sample data
 */
export const Default: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={mockRegionData}
      apiKey="YOUR_API_KEY_HERE"
      title="Performance por região"
      bounds={mockBounds}
      onRegionClick={(region) => {
        console.log('Clicked region:', region);
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
      apiKey="YOUR_API_KEY_HERE"
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
    <ChoroplethMap
      data={[]}
      apiKey="YOUR_API_KEY_HERE"
      title="Performance por região"
    />
  </div>
);

/**
 * Custom title
 */
export const CustomTitle: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen">
    <ChoroplethMap
      data={mockRegionData}
      apiKey="YOUR_API_KEY_HERE"
      title="Acessos por NRE - Janeiro 2024"
      bounds={mockBounds}
    />
  </div>
);

/**
 * All regions with high performance (Destaque)
 */
export const AllHighPerformance: Story = () => {
  const highPerformanceData = mockRegionData.map((region) => ({
    ...region,
    value: 0.8 + Math.random() * 0.2,
    accessCount: 10000 + Math.floor(Math.random() * 5000),
  }));

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ChoroplethMap
        data={highPerformanceData}
        apiKey="YOUR_API_KEY_HERE"
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
  const lowPerformanceData = mockRegionData.map((region) => ({
    ...region,
    value: Math.random() * 0.25,
    accessCount: Math.floor(Math.random() * 1000),
  }));

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <ChoroplethMap
        data={lowPerformanceData}
        apiKey="YOUR_API_KEY_HERE"
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
      apiKey="YOUR_API_KEY_HERE"
      title="Com classe customizada"
      bounds={mockBounds}
      className="shadow-lg"
    />
  </div>
);
