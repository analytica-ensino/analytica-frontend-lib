import union from '@turf/union';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import type { RegionData } from './ChoroplethMap.types';

/** Work budget per slice before yielding the main thread back to the browser. */
export const NRE_UNION_SLICE_MS = 8;

/**
 * Yield control to the browser so it can paint and handle input between slices
 * of a long computation. MessageChannel avoids the ~4ms clamp of setTimeout(0).
 */
export const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(undefined);
  });

/**
 * Compute NRE boundary polygons by merging city polygons that share the same
 * group (the NRE) — WITHOUT blocking the main thread. Grouping uses `groupName`
 * (the NRE label); when a region has no `groupName`, it falls back to its own
 * `name` so it forms its own group.
 *
 * Merging hundreds of municipal polygons with `union` is heavy (seconds), so the
 * work is sliced: after ~`NRE_UNION_SLICE_MS` of merging it yields to the
 * browser, keeping the page responsive while the outlines fill in a beat after
 * the cities. Resolves to `null` when `isCancelled` flips (the geometry changed
 * mid-flight), so a stale result is never applied.
 *
 * @param data - Array of region data with individual city GeoJSON features
 * @param isCancelled - Polled between slices; return true to abort
 * @returns NRE boundary features, or null if cancelled
 */
export const computeNREBoundariesAsync = async (
  data: RegionData[],
  isCancelled: () => boolean
): Promise<Feature<Polygon | MultiPolygon>[] | null> => {
  const groups = new Map<string, RegionData[]>();
  data.forEach((region) => {
    const groupKey = region.groupName ?? region.name;
    const existing = groups.get(groupKey) ?? [];
    existing.push(region);
    groups.set(groupKey, existing);
  });

  const boundaries: Feature<Polygon | MultiPolygon>[] = [];
  let sliceStart = performance.now();

  for (const regions of groups.values()) {
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

      if (performance.now() - sliceStart > NRE_UNION_SLICE_MS) {
        await yieldToMain();
        if (isCancelled()) return null;
        sliceStart = performance.now();
      }
    }
    if (merged) boundaries.push(merged);
  }

  return boundaries;
};
