/* global google */
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import union from '@turf/union';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { cn } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';
import Text from '../Text/Text';
import type {
  ChoroplethMapProps,
  ColorClass,
  RegionData,
} from './ChoroplethMap.types';

/**
 * Fade-in animation duration in milliseconds
 */
const FADE_DURATION = 400;

/**
 * Hover animation duration in milliseconds
 */
const HOVER_DURATION = 200;

/**
 * Target fill opacity for polygons
 */
const TARGET_OPACITY = 0.8;

/**
 * Read a CSS custom property value from the document root
 * @param name - CSS variable name (e.g. '--color-map-highlight')
 * @param fallback - Fallback value when running outside browser
 * @returns Resolved CSS variable value
 */
const getCssVar = (name: string, fallback = ''): string => {
  if (typeof document === 'undefined') return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
};

/**
 * Build color classes from CSS variables
 * @returns Color class array for the choropleth map
 */
const getColorClasses = (): ColorClass[] => [
  {
    min: 0.75,
    max: 1.01,
    fillColor: getCssVar('--color-map-highlight', '#1C61B2'),
    strokeColor: getCssVar('--color-map-highlight', '#1C61B2'),
    label: 'Destaque',
  },
  {
    min: 0.5,
    max: 0.75,
    fillColor: getCssVar('--color-map-above-avg', '#2883D7'),
    strokeColor: getCssVar('--color-map-above-avg', '#2883D7'),
    label: 'Acima da média',
  },
  {
    min: 0.25,
    max: 0.5,
    fillColor: getCssVar('--color-map-below-avg', '#91C7F1'),
    strokeColor: getCssVar('--color-map-below-avg', '#91C7F1'),
    label: 'Abaixo da média',
  },
  {
    min: 0,
    max: 0.25,
    fillColor: getCssVar('--color-map-attention', '#E3F1FB'),
    strokeColor: getCssVar('--color-map-highlight', '#1C61B2'),
    label: 'Ponto de atenção',
  },
];

/**
 * Get color class based on value
 * @param value - Normalized value between 0 and 1
 * @param colorClasses - Array of color class configurations
 * @returns Color class configuration
 */
const getColorClass = (
  value: number,
  colorClasses: ColorClass[]
): ColorClass => {
  for (const colorClass of colorClasses) {
    if (value >= colorClass.min && value < colorClass.max) {
      return colorClass;
    }
  }
  return colorClasses[0];
};

/**
 * Compute NRE boundary polygons by merging city polygons that share the same regionName
 * @param data - Array of region data with individual city GeoJSON features
 * @returns Array of GeoJSON features representing NRE boundaries
 */
const computeNREBoundaries = (
  data: RegionData[]
): Feature<Polygon | MultiPolygon>[] => {
  const groups = new Map<string, RegionData[]>();
  data.forEach((region) => {
    const existing = groups.get(region.name) ?? [];
    existing.push(region);
    groups.set(region.name, existing);
  });

  const boundaries: Feature<Polygon | MultiPolygon>[] = [];
  groups.forEach((regions) => {
    let merged: Feature<Polygon | MultiPolygon> | null = null;
    for (const region of regions) {
      if (region.geoJson.type !== 'Feature') continue;
      const feature: Feature<Polygon | MultiPolygon> = region.geoJson;
      if (merged) {
        const result: Feature<Polygon | MultiPolygon> | null = union({
          type: 'FeatureCollection' as const,
          features: [merged, feature],
        });
        if (result) merged = result;
      } else {
        merged = feature;
      }
    }
    if (merged) boundaries.push(merged);
  });

  return boundaries;
};

/**
 * Create style function for Data Layer features
 * @param opacity - Current fill opacity
 * @param colorClasses - Array of color class configurations
 * @param strokeCityColor - Stroke color for city borders
 * @returns Style function for map.data.setStyle
 */
const createStyleFunction = (
  opacity: number,
  colorClasses: ColorClass[],
  strokeCityColor: string
) => {
  return (feature: google.maps.Data.Feature) => {
    const value = feature.getProperty('regionValue') as number;
    const colorClass = getColorClass(value ?? 0, colorClasses);
    return {
      fillColor: colorClass.fillColor,
      fillOpacity: opacity,
      strokeColor: strokeCityColor,
      strokeWeight: 0.3,
      cursor: 'pointer',
    };
  };
};

/**
 * Map container style
 * Note: Google Maps requires explicit pixel dimensions to render properly
 */
const containerStyle = {
  width: '100%',
  height: '415px',
  borderRadius: '0.5rem',
};

/**
 * Default map center (Paraná, Brazil)
 */
const defaultCenter = {
  lat: -24.7,
  lng: -51.5,
};

/**
 * Legend Item component for the map
 * @param color - Fill color of the legend circle
 * @param label - Text label for the legend item
 * @param borderColor - Optional border color for the legend circle
 * @param active - Whether the legend class is active (visible on map)
 * @param onClick - Callback when the legend item is clicked
 */
const LegendItem = ({
  color,
  label,
  borderColor,
  active = true,
  onClick,
}: {
  color: string;
  label: string;
  borderColor?: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <Text
    as="button"
    type="button"
    aria-pressed={active}
    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
    style={{ opacity: active ? 1 : 0.4 }}
    onClick={onClick}
  >
    <div
      className="w-3 h-3 rounded-full"
      style={{
        backgroundColor: color,
        border: borderColor ? `1px solid ${borderColor}` : 'none',
      }}
    />
    <Text as="span" size="sm" weight="medium" color="text-text-600">
      {label}
    </Text>
  </Text>
);

/**
 * Loading skeleton component
 */
const LoadingSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center bg-background-50 rounded-lg animate-pulse">
    <Text size="sm" color="text-text-400">
      Carregando mapa...
    </Text>
  </div>
);

/**
 * ChoroplethMap component for displaying regional performance data
 *
 * Displays an interactive Google Map with colored regions based on normalized values.
 * Uses 4 color classes to represent different performance levels.
 * Includes fade-in animation, smooth hover transitions, and zoom-to-region on click.
 * NRE boundaries are rendered as a separate overlay with thicker strokes.
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
  const mapId = useId();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [infoPosition, setInfoPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeClasses, setActiveClasses] = useState<Set<number>>(
    new Set([0, 1, 2, 3])
  );
  const fadeAnimationRef = useRef<number | null>(null);
  const hoverAnimationRef = useRef<number | null>(null);
  const nreBoundaryLayerRef = useRef<google.maps.Data | null>(null);
  const onRegionClickRef = useRef(onRegionClick);
  onRegionClickRef.current = onRegionClick;

  const { isDark } = useTheme();

  const dataSignature = useMemo(
    () =>
      data
        .map((d) => `${d.id}:${d.value}:${d.name}:${d.accessCount}`)
        .join('|'),
    [data]
  );
  const stableData = useMemo(() => data, [dataSignature]);

  const colorClasses = useMemo(() => getColorClasses(), [isDark]);

  const mapOptions: google.maps.MapOptions = useMemo(() => {
    const bgColor = getCssVar('--color-background-50', '#F6F6F6');
    return {
      disableDefaultUI: true,
      zoomControl: true,
      scrollwheel: true,
      draggable: true,
      backgroundColor: bgColor,
      styles: [
        {
          stylers: [{ color: bgColor }],
        },
        {
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          elementType: 'geometry.stroke',
          stylers: [{ visibility: 'off' }],
        },
      ],
    };
  }, [isDark]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: mapId,
    googleMapsApiKey: apiKey,
  });

  /**
   * Handle map load event
   */
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      // Fit bounds if provided, then bump zoom to fill the container
      if (bounds) {
        const googleBounds = new google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        );
        mapInstance.fitBounds(googleBounds, 0);
        google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
          const currentZoom = mapInstance.getZoom();
          if (currentZoom) {
            mapInstance.setZoom(currentZoom + 0.8);
          }
        });
      }
    },
    [bounds]
  );

  /**
   * Handle map unmount
   */
  const onUnmount = useCallback(() => {
    if (nreBoundaryLayerRef.current) {
      nreBoundaryLayerRef.current.setMap(null);
    }
    setMap(null);
  }, []);

  const nreBoundaries = useMemo(
    () => computeNREBoundaries(stableData),
    [stableData]
  );

  /**
   * Add GeoJSON data to map with animations
   */
  useEffect(() => {
    if (!map || !stableData.length) return;

    const strokeCityColor = getCssVar('--color-map-stroke-city', '#64B5F6');
    const strokeNreColor = getCssVar('--color-map-stroke-nre', '#1565C0');

    // Clear existing data
    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    // Clear existing NRE boundary layer
    if (nreBoundaryLayerRef.current) {
      nreBoundaryLayerRef.current.setMap(null);
      nreBoundaryLayerRef.current = null;
    }

    // Add each region's GeoJSON
    stableData.forEach((region) => {
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

    // Build NRE feature index for O(1) lookup by region name
    const nreFeatureIndex = new Map<string, google.maps.Data.Feature[]>();
    map.data.forEach((f) => {
      const name = f.getProperty('regionName') as string;
      if (name) {
        const list = nreFeatureIndex.get(name) ?? [];
        list.push(f);
        nreFeatureIndex.set(name, list);
      }
    });

    // Start with opacity 0 for fade-in animation
    map.data.setStyle(createStyleFunction(0, colorClasses, strokeCityColor));

    // Add NRE boundary overlay
    const nreLayer = new google.maps.Data();
    nreBoundaries.forEach((boundary) => {
      nreLayer.addGeoJson(boundary);
    });
    nreLayer.setStyle({
      fillOpacity: 0,
      strokeColor: strokeNreColor,
      strokeWeight: 1.5,
      clickable: false,
    });
    nreLayer.setMap(map);
    nreBoundaryLayerRef.current = nreLayer;

    // Animate fade-in from 0 to TARGET_OPACITY
    const startTime = performance.now();
    const animateFadeIn = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      const currentOpacity = progress * TARGET_OPACITY;

      map.data.setStyle(
        createStyleFunction(currentOpacity, colorClasses, strokeCityColor)
      );

      if (progress < 1) {
        fadeAnimationRef.current = requestAnimationFrame(animateFadeIn);
      } else {
        fadeAnimationRef.current = null;
      }
    };
    fadeAnimationRef.current = requestAnimationFrame(animateFadeIn);

    /**
     * Apply style overrides to a list of features
     * @param features - Features to style
     * @param opacity - Fill opacity
     * @param weight - Stroke weight
     */
    const applyHoverStyle = (
      features: google.maps.Data.Feature[],
      opacity: number,
      weight: number
    ) => {
      features.forEach((f) => {
        map.data.overrideStyle(f, {
          fillOpacity: opacity,
          strokeColor: strokeCityColor,
          strokeWeight: weight,
        });
      });
    };

    /**
     * Animate hover transition for a group of features
     * @param features - Target features to animate
     * @param from - Starting opacity
     * @param to - Target opacity
     * @param fromWeight - Starting stroke weight
     * @param toWeight - Target stroke weight
     */
    const animateHover = (
      features: google.maps.Data.Feature[],
      from: number,
      to: number,
      fromWeight: number,
      toWeight: number
    ) => {
      if (hoverAnimationRef.current) {
        cancelAnimationFrame(hoverAnimationRef.current);
      }
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / HOVER_DURATION, 1);
        const opacity = from + (to - from) * progress;
        const weight = fromWeight + (toWeight - fromWeight) * progress;
        applyHoverStyle(features, opacity, weight);
        if (progress < 1) {
          hoverAnimationRef.current = requestAnimationFrame(animate);
        } else {
          hoverAnimationRef.current = null;
        }
      };
      hoverAnimationRef.current = requestAnimationFrame(animate);
    };

    // Handle hover events - highlight all cities in the same NRE
    let currentNRE: string | null = null;
    let revertTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Collect all features belonging to a given NRE name (O(1) index lookup)
     * @param nreName - NRE region name to match
     * @returns Array of matching features
     */
    const collectNREFeatures = (
      nreName: string
    ): google.maps.Data.Feature[] => {
      return nreFeatureIndex.get(nreName) ?? [];
    };

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
        const region = stableData.find((r) => r.id === regionId);
        if (region) {
          setHoveredRegion(region);
          if (event.domEvent) {
            setInfoPosition({
              x: (event.domEvent as MouseEvent).clientX,
              y: (event.domEvent as MouseEvent).clientY,
            });
          }
        }

        // Animate highlight for all features in the same NRE group
        if (currentNRE !== regionName) {
          if (currentNRE) {
            const prevFeatures = collectNREFeatures(currentNRE);
            animateHover(prevFeatures, 1, TARGET_OPACITY, 1.5, 0.5);
          }
          currentNRE = regionName;
          const nreFeatures = collectNREFeatures(regionName);
          animateHover(nreFeatures, TARGET_OPACITY, 1, 0.5, 1.5);
        }
      }
    );

    const mouseoutListener = map.data.addListener('mouseout', () => {
      // Defer revert to avoid flicker when moving between cities in same NRE
      revertTimeout = setTimeout(() => {
        setHoveredRegion(null);
        setInfoPosition(null);
        if (currentNRE) {
          const prevFeatures = collectNREFeatures(currentNRE);
          animateHover(prevFeatures, 1, TARGET_OPACITY, 1.5, 0.5);
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

    /**
     * Compute bounds for all features matching a given NRE name
     * @param nreName - NRE region name to match
     * @returns LatLngBounds encompassing all matching features
     */
    const computeNREBounds = (nreName: string): google.maps.LatLngBounds => {
      const nreBounds = new google.maps.LatLngBounds();
      for (const f of collectNREFeatures(nreName)) {
        f.getGeometry()?.forEachLatLng((latLng) => {
          nreBounds.extend(latLng);
        });
      }
      return nreBounds;
    };

    // Handle click events - zoom to NRE region
    const clickListener = map.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        const regionId = event.feature.getProperty('regionId') as string;
        const regionName = event.feature.getProperty('regionName') as string;
        const region = stableData.find((r) => r.id === regionId);
        if (region) {
          onRegionClickRef.current?.(region);
        }

        const nreBounds = computeNREBounds(regionName);
        if (!nreBounds.isEmpty()) {
          map.fitBounds(nreBounds, 20);
        }
      }
    );

    return () => {
      if (fadeAnimationRef.current)
        cancelAnimationFrame(fadeAnimationRef.current);
      if (hoverAnimationRef.current)
        cancelAnimationFrame(hoverAnimationRef.current);
      if (revertTimeout) clearTimeout(revertTimeout);
      if (nreBoundaryLayerRef.current) {
        nreBoundaryLayerRef.current.setMap(null);
        nreBoundaryLayerRef.current = null;
      }
      google.maps.event.removeListener(mouseoverListener);
      google.maps.event.removeListener(mouseoutListener);
      google.maps.event.removeListener(mousemoveListener);
      google.maps.event.removeListener(clickListener);
    };
  }, [map, stableData, colorClasses, nreBoundaries]);

  /**
   * Apply visibility filter based on active legend classes
   * and adjust map bounds to fit visible features
   */
  useEffect(() => {
    if (!map || !stableData.length) return;

    const visibleBounds = new google.maps.LatLngBounds();
    let hasVisibleFeatures = false;

    map.data.forEach((feature: google.maps.Data.Feature) => {
      const value = feature.getProperty('regionValue') as number;
      const colorClass = getColorClass(value ?? 0, colorClasses);
      const classIndex = colorClasses.indexOf(colorClass);

      if (activeClasses.has(classIndex)) {
        map.data.overrideStyle(feature, { visible: true });
        feature.getGeometry()?.forEachLatLng((latLng) => {
          visibleBounds.extend(latLng);
        });
        hasVisibleFeatures = true;
      } else {
        map.data.overrideStyle(feature, { visible: false });
      }
    });

    if (hasVisibleFeatures && !visibleBounds.isEmpty()) {
      map.fitBounds(visibleBounds, 20);
    }
  }, [map, stableData, activeClasses, colorClasses]);

  /**
   * Toggle a color class on/off in the legend filter
   * @param index - Index of the color class in colorClasses
   */
  const toggleClass = (index: number) => {
    setActiveClasses((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (loadError) {
    return (
      <div className="p-5 bg-background border border-border-50 rounded-xl">
        <Text color="text-error-700">Erro ao carregar o mapa</Text>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-5 bg-background border border-border-50 rounded-xl flex flex-col gap-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Text
          as="h2"
          size="lg"
          weight="bold"
          className="leading-[21px] tracking-[0.2px]"
        >
          {title}
        </Text>

        {/* Legend */}
        <div className="flex flex-wrap gap-8">
          {colorClasses.map((colorClass, index) => (
            <LegendItem
              key={colorClass.label}
              color={colorClass.fillColor}
              borderColor={
                colorClass.fillColor === colorClass.strokeColor
                  ? undefined
                  : colorClass.strokeColor
              }
              label={colorClass.label}
              active={activeClasses.has(index)}
              onClick={() => toggleClass(index)}
            />
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-background-50 rounded-lg h-[415px] relative overflow-hidden">
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
            className="fixed z-50 bg-background border border-border-50 shadow-lg rounded-lg p-3 pointer-events-none"
            style={{
              left: Math.min(infoPosition.x + 10, window.innerWidth - 220),
              top: Math.min(infoPosition.y + 10, window.innerHeight - 80),
            }}
          >
            <Text size="sm" weight="semibold">
              {hoveredRegion.name}
            </Text>
            <Text size="xs" color="text-text-700">
              Acessos: {hoveredRegion.accessCount.toLocaleString('pt-BR')}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoroplethMap;
