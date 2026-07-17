/* global google */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import union from '@turf/union';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { cn } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';
import Text from '../Text/Text';
import Alert from '../Alert/Alert';
import type {
  ChoroplethMapProps,
  ColorClass,
  RegionData,
} from './ChoroplethMap.types';

/**
 * Stable ID for the Google Maps script loader singleton.
 * Must NOT use useId() — the loader rejects re-initialization with different IDs.
 */
const GOOGLE_MAPS_LOADER_ID = 'google-maps-script';

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
    fillColor: getCssVar('--color-map-highlight', '#66b584'),
    strokeColor: getCssVar('--color-map-highlight', '#66b584'),
    label: 'Destaque (≥75% com acesso)',
  },
  {
    min: 0.5,
    max: 0.75,
    fillColor: getCssVar('--color-map-above-avg', '#f8cc2e'),
    strokeColor: getCssVar('--color-map-above-avg', '#f8cc2e'),
    label: 'Acima da média (50 a 74% com acesso)',
  },
  {
    min: 0.26,
    max: 0.5,
    fillColor: getCssVar('--color-map-below-avg', '#fb954b'),
    strokeColor: getCssVar('--color-map-below-avg', '#fb954b'),
    label: 'Abaixo da média (26 a 49% com acesso)',
  },
  {
    min: 0.01,
    max: 0.26,
    fillColor: getCssVar('--color-map-attention', '#b91c1c'),
    strokeColor: getCssVar('--color-map-attention', '#b91c1c'),
    label: 'Ponto de atenção (1 a 25% com acesso)',
  },
  {
    min: -0.01,
    max: 0.01,
    fillColor: getCssVar('--color-map-no-access', '#2f2f2f'),
    strokeColor: getCssVar('--color-map-no-access', '#2f2f2f'),
    label: 'Sem acesso (0%)',
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
 * Compute NRE boundary polygons by merging city polygons that share the same
 * group (the NRE). Grouping uses `groupName` (the NRE label); when a region has
 * no `groupName`, it falls back to its own `name` so it forms its own group.
 * @param data - Array of region data with individual city GeoJSON features
 * @returns Array of GeoJSON features representing NRE boundaries
 */
const computeNREBoundaries = (
  data: RegionData[]
): Feature<Polygon | MultiPolygon>[] => {
  const groups = new Map<string, RegionData[]>();
  data.forEach((region) => {
    const groupKey = region.groupName ?? region.name;
    const existing = groups.get(groupKey) ?? [];
    existing.push(region);
    groups.set(groupKey, existing);
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
 *
 * Regions flagged as not managed by the logged user ignore the color
 * classes and are rendered with the unmanaged gray fill.
 *
 * @param opacity - Current fill opacity
 * @param colorClasses - Array of color class configurations
 * @param strokeCityColor - Stroke color for city borders
 * @param unmanagedFillColor - Fill color for regions outside the user scope
 * @returns Style function for map.data.setStyle
 */
const createStyleFunction = (
  opacity: number,
  colorClasses: ColorClass[],
  strokeCityColor: string,
  unmanagedFillColor: string
) => {
  return (feature: google.maps.Data.Feature) => {
    if (feature.getProperty('regionIsManaged') === false) {
      return {
        fillColor: unmanagedFillColor,
        fillOpacity: opacity,
        strokeColor: strokeCityColor,
        strokeWeight: 0.3,
        cursor: 'default',
      };
    }
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
  countLabel = 'Acessos',
  loading = false,
  bounds,
  onRegionClick,
  headerAction,
  infoText,
  className,
}: ChoroplethMapProps) => {
  const mapId = GOOGLE_MAPS_LOADER_ID;
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [infoPosition, setInfoPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeClasses, setActiveClasses] = useState<Set<number>>(
    new Set([0, 1, 2, 3, 4])
  );
  const fadeAnimationRef = useRef<number | null>(null);
  const hoverAnimationsRef = useRef<Map<string, number>>(new Map());
  const nreBoundaryLayerRef = useRef<google.maps.Data | null>(null);
  const onRegionClickRef = useRef(onRegionClick);
  onRegionClickRef.current = onRegionClick;

  const { isDark } = useTheme();

  const dataSignature = useMemo(
    () =>
      data
        .map((d) => {
          const b = d.accessBreakdown;
          const breakdown = b
            ? `${b.students.withAccess}/${b.students.withoutAccess}/${b.teachers.withAccess}/${b.teachers.withoutAccess}/${b.managers.withAccess}/${b.managers.withoutAccess}`
            : '';
          return `${d.id}:${d.value}:${d.name}:${d.groupName ?? ''}:${d.accessCount}:${
            d.isManagedRegion === false ? 0 : 1
          }:${breakdown}`;
        })
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

      // Fit bounds if provided so the whole region is framed on load.
      // fitBounds snaps the zoom down to the next level that fits, often
      // leaving the region small in the container. After the fit settles,
      // grow the (fractional) zoom by exactly how much slack is left, so the
      // region fills the container without cropping its edges.
      if (bounds) {
        const googleBounds = new google.maps.LatLngBounds(
          { lat: bounds.south, lng: bounds.west },
          { lat: bounds.north, lng: bounds.east }
        );
        mapInstance.fitBounds(googleBounds, 20);
        google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
          const view = mapInstance.getBounds();
          const zoom = mapInstance.getZoom();
          if (!view || zoom == null) return;

          const viewSpanLat =
            view.getNorthEast().lat() - view.getSouthWest().lat();
          const viewSpanLng =
            view.getNorthEast().lng() - view.getSouthWest().lng();
          const targetSpanLat = bounds.north - bounds.south;
          const targetSpanLng = bounds.east - bounds.west;
          if (targetSpanLat <= 0 || targetSpanLng <= 0) return;

          // Largest extra zoom that keeps both spans inside the viewport,
          // with a small safety margin for Mercator distortion
          const extraZoom =
            Math.min(
              Math.log2(viewSpanLat / targetSpanLat),
              Math.log2(viewSpanLng / targetSpanLng)
            ) - 0.05;

          if (extraZoom > 0) {
            mapInstance.setZoom(zoom + Math.min(extraZoom, 1));
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

    const strokeCityColor = getCssVar('--color-map-stroke-city', '#ffffff');
    const unmanagedFillColor = getCssVar(
      '--color-map-unmanaged-region',
      '#e0e0e0'
    );
    const strokeNreColor = getCssVar('--color-map-stroke-nre', '#ffffff');

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
            f.setProperty('regionIsManaged', region.isManagedRegion !== false);
          });
        }
      } catch (error) {
        console.error(
          `Failed to add GeoJSON for region ${region.name}:`,
          error
        );
      }
    });

    // Build per-city feature index for O(1) lookup by region id.
    // Hover highlight and click-zoom operate per municipality (not per NRE).
    const cityFeatureIndex = new Map<string, google.maps.Data.Feature[]>();
    map.data.forEach((f) => {
      const id = f.getProperty('regionId') as string;
      if (id) {
        const list = cityFeatureIndex.get(id) ?? [];
        list.push(f);
        cityFeatureIndex.set(id, list);
      }
    });

    // Start with opacity 0 for fade-in animation
    map.data.setStyle(
      createStyleFunction(0, colorClasses, strokeCityColor, unmanagedFillColor)
    );

    // Add NRE boundary overlay
    const nreLayer = new google.maps.Data();
    nreBoundaries.forEach((boundary) => {
      nreLayer.addGeoJson(boundary);
    });
    nreLayer.setStyle({
      fillOpacity: 0,
      strokeColor: strokeNreColor,
      strokeWeight: 1,
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
        createStyleFunction(
          currentOpacity,
          colorClasses,
          strokeCityColor,
          unmanagedFillColor
        )
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
     * Animate hover transition for a group of features.
     * Animations are tracked per NRE group so a new animation only cancels
     * a running one for the SAME group — revert and highlight of different
     * groups must run concurrently.
     * @param groupKey - NRE group name identifying this animation
     * @param features - Target features to animate
     * @param from - Starting opacity
     * @param to - Target opacity
     * @param fromWeight - Starting stroke weight
     * @param toWeight - Target stroke weight
     */
    const animateHover = (
      groupKey: string,
      features: google.maps.Data.Feature[],
      from: number,
      to: number,
      fromWeight: number,
      toWeight: number
    ) => {
      const running = hoverAnimationsRef.current.get(groupKey);
      if (running) {
        cancelAnimationFrame(running);
      }
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / HOVER_DURATION, 1);
        const opacity = from + (to - from) * progress;
        const weight = fromWeight + (toWeight - fromWeight) * progress;
        applyHoverStyle(features, opacity, weight);
        if (progress < 1) {
          hoverAnimationsRef.current.set(
            groupKey,
            requestAnimationFrame(animate)
          );
        } else {
          hoverAnimationsRef.current.delete(groupKey);
        }
      };
      hoverAnimationsRef.current.set(groupKey, requestAnimationFrame(animate));
    };

    // Handle hover events - highlight only the hovered city
    let currentCityId: string | null = null;
    let revertTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Collect all features belonging to a given city id (O(1) index lookup)
     * @param cityId - Region (city) id to match
     * @returns Array of matching features
     */
    const collectCityFeatures = (
      cityId: string
    ): google.maps.Data.Feature[] => {
      return cityFeatureIndex.get(cityId) ?? [];
    };

    const mouseoverListener = map.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        // Cancel pending revert (when moving between adjacent cities)
        if (revertTimeout) {
          clearTimeout(revertTimeout);
          revertTimeout = null;
        }

        const regionId = event.feature.getProperty('regionId') as string;
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

        // Animate highlight for the hovered city only
        if (currentCityId !== regionId) {
          if (currentCityId) {
            const prevFeatures = collectCityFeatures(currentCityId);
            animateHover(
              currentCityId,
              prevFeatures,
              1,
              TARGET_OPACITY,
              1,
              0.5
            );
          }
          currentCityId = regionId;
          const cityFeatures = collectCityFeatures(regionId);
          animateHover(regionId, cityFeatures, TARGET_OPACITY, 1, 0.5, 1);
        }
      }
    );

    const mouseoutListener = map.data.addListener('mouseout', () => {
      // Defer revert to avoid flicker when moving between adjacent cities
      revertTimeout = setTimeout(() => {
        setHoveredRegion(null);
        setInfoPosition(null);
        if (currentCityId) {
          const prevFeatures = collectCityFeatures(currentCityId);
          animateHover(currentCityId, prevFeatures, 1, TARGET_OPACITY, 1, 0.5);
          currentCityId = null;
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
     * Compute bounds for all features matching a given city id
     * @param cityId - Region (city) id to match
     * @returns LatLngBounds encompassing all matching features
     */
    const computeCityBounds = (cityId: string): google.maps.LatLngBounds => {
      const cityBounds = new google.maps.LatLngBounds();
      for (const f of collectCityFeatures(cityId)) {
        f.getGeometry()?.forEachLatLng((latLng: google.maps.LatLng) => {
          cityBounds.extend(latLng);
        });
      }
      return cityBounds;
    };

    // Handle click events - zoom to the clicked city
    const clickListener = map.data.addListener(
      'click',
      (event: google.maps.Data.MouseEvent) => {
        const regionId = event.feature.getProperty('regionId') as string;
        const region = stableData.find((r) => r.id === regionId);
        if (region && region.isManagedRegion !== false) {
          onRegionClickRef.current?.(region);
        }

        const cityBounds = computeCityBounds(regionId);
        if (!cityBounds.isEmpty()) {
          map.fitBounds(cityBounds, 20);
        }
      }
    );

    return () => {
      if (fadeAnimationRef.current)
        cancelAnimationFrame(fadeAnimationRef.current);
      hoverAnimationsRef.current.forEach((id) => cancelAnimationFrame(id));
      hoverAnimationsRef.current.clear();
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
   * and adjust map bounds to fit visible features.
   *
   * Bounds are only refit while a legend filter is active: with every class
   * enabled the initial framing comes from the `bounds` prop (whole state),
   * which keeps unmanaged regions in view for region-scoped managers.
   */
  useEffect(() => {
    if (!map || !stableData.length) return;

    const isFiltering = activeClasses.size < colorClasses.length;
    const visibleBounds = new google.maps.LatLngBounds();
    let hasVisibleFeatures = false;

    map.data.forEach((feature: google.maps.Data.Feature) => {
      // Unmanaged regions don't belong to any legend class: always visible,
      // and they never drive the fit-bounds of the visible selection.
      if (feature.getProperty('regionIsManaged') === false) {
        map.data.overrideStyle(feature, { visible: true });
        return;
      }

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

    if (isFiltering && hasVisibleFeatures && !visibleBounds.isEmpty()) {
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
        <div className="flex flex-row items-center gap-4">
          <Text
            as="h2"
            size="lg"
            weight="bold"
            className="flex-1 leading-[21px] tracking-[0.2px]"
          >
            {title}
          </Text>
          {headerAction}
        </div>

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
            className="fixed z-50 flex flex-col gap-2 bg-background-900 shadow-hard-shadow-2 rounded px-3 py-1 pointer-events-none"
            style={{
              left: Math.min(infoPosition.x + 10, window.innerWidth - 460),
              top: Math.min(infoPosition.y + 10, window.innerHeight - 160),
            }}
          >
            <Text size="md" weight="semibold" color="text-text-50">
              {hoveredRegion.name}
            </Text>
            {hoveredRegion.isManagedRegion !== false && (
              <>
                <div className="h-px self-stretch bg-border-200" />
                {hoveredRegion.accessBreakdown ? (
                  <div className="flex flex-col gap-1">
                    <Text size="md" color="text-text-50">
                      Estudantes:{' '}
                      {hoveredRegion.accessBreakdown.students.withAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      com acesso,{' '}
                      {hoveredRegion.accessBreakdown.students.withoutAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      sem acessos
                    </Text>
                    <Text size="md" color="text-text-50">
                      Professores(as):{' '}
                      {hoveredRegion.accessBreakdown.teachers.withAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      com acesso,{' '}
                      {hoveredRegion.accessBreakdown.teachers.withoutAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      sem acessos
                    </Text>
                    <Text size="md" color="text-text-50">
                      Diretores(as):{' '}
                      {hoveredRegion.accessBreakdown.managers.withAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      com acesso,{' '}
                      {hoveredRegion.accessBreakdown.managers.withoutAccess.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      sem acessos
                    </Text>
                  </div>
                ) : (
                  <Text size="md" color="text-text-50">
                    {countLabel}:{' '}
                    {hoveredRegion.accessCount.toLocaleString('pt-BR')}
                  </Text>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Info alert below the map, inside the card */}
      {infoText && (
        <Alert
          action="info"
          variant="solid"
          description={infoText}
          className="w-full"
        />
      )}
    </div>
  );
};

export default ChoroplethMap;
