/* global google */
import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { cn } from '../../utils/utils';
import type {
  ChoroplethMapProps,
  ColorClass,
  RegionData,
} from './ChoroplethMap.types';

/**
 * Color classes for the choropleth map (4 classes)
 * Based on value ranges from 0 to 1
 */
const COLOR_CLASSES: ColorClass[] = [
  {
    min: 0.75,
    max: 1.01,
    fillColor: '#1C61B2',
    strokeColor: '#1C61B2',
    label: 'Destaque',
  },
  {
    min: 0.5,
    max: 0.75,
    fillColor: '#2883D7',
    strokeColor: '#2883D7',
    label: 'Acima da média',
  },
  {
    min: 0.25,
    max: 0.5,
    fillColor: '#91C7F1',
    strokeColor: '#91C7F1',
    label: 'Abaixo da média',
  },
  {
    min: 0,
    max: 0.25,
    fillColor: '#E3F1FB',
    strokeColor: '#1C61B2',
    label: 'Ponto de atenção',
  },
];

/**
 * Get color class based on value
 * @param value - Normalized value between 0 and 1
 * @returns Color class configuration
 */
const getColorClass = (value: number): ColorClass => {
  for (const colorClass of COLOR_CLASSES) {
    if (value >= colorClass.min && value < colorClass.max) {
      return colorClass;
    }
  }
  return COLOR_CLASSES[COLOR_CLASSES.length - 1];
};

/**
 * Map container style
 * Note: Google Maps requires explicit pixel dimensions to render properly
 */
const containerStyle = {
  width: '100%',
  height: '415px',
};

/**
 * Default map center (Paraná, Brazil)
 */
const defaultCenter = {
  lat: -24.7,
  lng: -51.5,
};

/**
 * Map options for clean display
 */
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#F6F6F6' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#C9E4FA' }],
    },
  ],
};

/**
 * Legend Item component for the map
 */
const LegendItem = ({
  color,
  label,
  borderColor,
}: {
  color: string;
  label: string;
  borderColor?: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full"
      style={{
        backgroundColor: color,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      }}
    />
    <span className="text-sm font-medium text-[#737373]">{label}</span>
  </div>
);

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#F6F6F6] rounded-lg animate-pulse">
    <div className="text-[#9CA3AF] text-sm">Carregando mapa...</div>
  </div>
);

/**
 * ChoroplethMap component for displaying regional performance data
 *
 * Displays an interactive Google Map with colored regions based on normalized values.
 * Uses 4 color classes to represent different performance levels.
 *
 * @param data - Array of region data with GeoJSON and values
 * @param apiKey - Google Maps API key
 * @param title - Optional title for the map section
 * @param loading - Loading state indicator
 * @param bounds - Map bounds for initial view
 * @param onRegionClick - Callback when a region is clicked
 * @param className - Additional CSS classes
 * @returns Choropleth map component
 *
 * @example
 * ```tsx
 * <ChoroplethMap
 *   data={regionData}
 *   apiKey="your-api-key"
 *   title="Performance por região"
 *   loading={false}
 *   onRegionClick={(region) => console.log(region)}
 * />
 * ```
 */
const ChoroplethMap = ({
  data,
  apiKey,
  title = 'Performance por região',
  loading = false,
  bounds,
  onRegionClick,
  className,
}: ChoroplethMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [infoPosition, setInfoPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  /**
   * Handle map load event
   */
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      // Fit bounds if provided
      if (bounds) {
        const googleBounds = new google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        );
        mapInstance.fitBounds(googleBounds, 20);
      }
    },
    [bounds]
  );

  /**
   * Handle map unmount
   */
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  /**
   * Add GeoJSON data to map
   */
  useEffect(() => {
    if (!map || !data.length) return;

    // Clear existing data
    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    // Add each region's GeoJSON
    data.forEach((region) => {
      try {
        const feature = map.data.addGeoJson(region.geoJson);
        // Store region data in the feature
        if (feature && feature.length > 0) {
          feature.forEach((f) => {
            f.setProperty('regionId', region.id);
            f.setProperty('regionName', region.name);
            f.setProperty('regionValue', region.value);
            f.setProperty('regionAccessCount', region.accessCount);
          });
        }
      } catch (error) {
        console.error(
          `Failed to add GeoJSON for region ${region.name}:`,
          error
        );
      }
    });

    // Style the features based on value
    map.data.setStyle((feature) => {
      const value = feature.getProperty('regionValue') as number;
      const colorClass = getColorClass(value ?? 0);

      return {
        fillColor: colorClass.fillColor,
        fillOpacity: 0.8,
        strokeColor: colorClass.strokeColor,
        strokeWeight: 1,
        cursor: 'pointer',
      };
    });

    // Handle hover events - highlight all cities in the same NRE
    let currentNRE: string | null = null;
    let revertTimeout: ReturnType<typeof setTimeout> | null = null;

    const mouseoverListener = map.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        // Cancel pending revert (when moving between cities in same NRE)
        if (revertTimeout) {
          clearTimeout(revertTimeout);
          revertTimeout = null;
        }

        const regionId = event.feature.getProperty('regionId') as string;
        const regionName = event.feature.getProperty('regionName') as string;
        const region = data.find((r) => r.id === regionId);
        if (region) {
          setHoveredRegion(region);
          if (event.domEvent) {
            setInfoPosition({
              x: (event.domEvent as MouseEvent).clientX,
              y: (event.domEvent as MouseEvent).clientY,
            });
          }
        }

        // Highlight all features in the same NRE group
        if (currentNRE !== regionName) {
          if (currentNRE) {
            const prevNRE = currentNRE;
            map.data.forEach((f) => {
              if (f.getProperty('regionName') === prevNRE) {
                map.data.revertStyle(f);
              }
            });
          }
          currentNRE = regionName;
          map.data.forEach((f) => {
            if (f.getProperty('regionName') === regionName) {
              map.data.overrideStyle(f, {
                fillOpacity: 1,
                strokeWeight: 2,
              });
            }
          });
        }
      }
    );

    const mouseoutListener = map.data.addListener('mouseout', () => {
      // Defer revert to avoid flicker when moving between cities in same NRE
      revertTimeout = setTimeout(() => {
        setHoveredRegion(null);
        setInfoPosition(null);
        if (currentNRE) {
          const prevNRE = currentNRE;
          map.data.forEach((f) => {
            if (f.getProperty('regionName') === prevNRE) {
              map.data.revertStyle(f);
            }
          });
          currentNRE = null;
        }
      }, 50);
    });

    const mousemoveListener = map.data.addListener(
      'mousemove',
      (event: google.maps.Data.MouseEvent) => {
        if (event.domEvent) {
          setInfoPosition({
            x: (event.domEvent as MouseEvent).clientX,
            y: (event.domEvent as MouseEvent).clientY,
          });
        }
      }
    );

    // Handle click events
    const clickListener = map.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        const regionId = event.feature.getProperty('regionId') as string;
        const region = data.find((r) => r.id === regionId);
        if (region && onRegionClick) {
          onRegionClick(region);
        }
      }
    );

    return () => {
      if (revertTimeout) clearTimeout(revertTimeout);
      google.maps.event.removeListener(mouseoverListener);
      google.maps.event.removeListener(mouseoutListener);
      google.maps.event.removeListener(mousemoveListener);
      google.maps.event.removeListener(clickListener);
    };
  }, [map, data, onRegionClick]);

  if (loadError) {
    return (
      <div className="p-5 bg-white border border-[#F3F3F3] rounded-xl">
        <p className="text-error-700">Erro ao carregar o mapa</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-5 bg-white border border-[#F3F3F3] rounded-xl flex flex-col gap-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg leading-[21px] tracking-[0.2px] text-[#171717]">
          {title}
        </h2>

        {/* Legend */}
        <div className="flex flex-wrap gap-8">
          <LegendItem color="#1C61B2" label="Destaque" />
          <LegendItem color="#2883D7" label="Acima da média" />
          <LegendItem color="#91C7F1" label="Abaixo da média" />
          <LegendItem
            color="#E3F1FB"
            borderColor="#1C61B2"
            label="Ponto de atenção"
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-[#F6F6F6] rounded-lg h-[415px] relative">
        {loading || !isLoaded ? (
          <LoadingSkeleton />
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={7}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          />
        )}

        {/* Tooltip */}
        {hoveredRegion && infoPosition && (
          <div
            className="fixed z-50 bg-white shadow-lg rounded-lg p-3 pointer-events-none"
            style={{
              left: infoPosition.x + 10,
              top: infoPosition.y + 10,
            }}
          >
            <p className="font-semibold text-sm text-[#171717]">
              {hoveredRegion.name}
            </p>
            <p className="text-xs text-[#525252]">
              Acessos: {hoveredRegion.accessCount.toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoroplethMap;
