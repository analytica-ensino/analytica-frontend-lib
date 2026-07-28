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

/** A merged NRE outline polygon. */
type NreBoundary = Feature<Polygon | MultiPolygon>;

/** Group regions by their NRE label, falling back to the region's own name. */
const groupRegionsByNRE = (data: RegionData[]): Map<string, RegionData[]> => {
  const groups = new Map<string, RegionData[]>();
  for (const region of data) {
    const key = region.groupName ?? region.name;
    const existing = groups.get(key) ?? [];
    existing.push(region);
    groups.set(key, existing);
  }
  return groups;
};

/**
 * A time-sliced yielder: returns `true` to keep going, or yields to the browser
 * once the current slice runs past its budget. After a yield it returns whether
 * the work should continue (i.e. it was not cancelled).
 */
const createSlicer = (isCancelled: () => boolean): (() => Promise<boolean>) => {
  let sliceStart = performance.now();
  return async () => {
    if (performance.now() - sliceStart <= NRE_UNION_SLICE_MS) return true;
    await yieldToMain();
    sliceStart = performance.now();
    return !isCancelled();
  };
};

/** Merge one NRE group's city polygons into a single outline, yielding between
 * slices. Reports `cancelled` when the shared slicer aborts mid-merge. */
const mergeRegionGroup = async (
  regions: RegionData[],
  slice: () => Promise<boolean>
): Promise<{ boundary: NreBoundary | null; cancelled: boolean }> => {
  let merged: NreBoundary | null = null;
  for (const region of regions) {
    if (region.geoJson.type !== 'Feature') continue;
    const feature = region.geoJson as NreBoundary;
    merged = merged
      ? (union({ type: 'FeatureCollection', features: [merged, feature] }) ??
        merged)
      : feature;
    if (!(await slice())) return { boundary: merged, cancelled: true };
  }
  return { boundary: merged, cancelled: false };
};

/**
 * Compute NRE boundary polygons by merging city polygons that share the same
 * group (the NRE) — WITHOUT blocking the main thread. Grouping uses `groupName`
 * (the NRE label); a region with no `groupName` forms its own group.
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
): Promise<NreBoundary[] | null> => {
  const groups = groupRegionsByNRE(data);
  const slice = createSlicer(isCancelled);
  const boundaries: NreBoundary[] = [];

  for (const regions of groups.values()) {
    const { boundary, cancelled } = await mergeRegionGroup(regions, slice);
    if (cancelled) return null;
    if (boundary) boundaries.push(boundary);
  }

  return boundaries;
};
