import unionDefault from '@turf/union';
import {
  computeNREBoundariesAsync,
  yieldToMain,
  NRE_UNION_SLICE_MS,
} from './nreBoundaries';
import type { RegionData } from './ChoroplethMap.types';

// The test environment has no DOM MessageChannel. Provide a minimal one that
// honours the onmessage/postMessage contract yieldToMain uses, delivering to the
// opposite port on a macrotask (like the real thing).
class FakePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other!: FakePort;
  postMessage(data: unknown) {
    const target = this.other;
    setTimeout(() => target.onmessage?.({ data }), 0);
  }
}
class FakeMessageChannel {
  port1 = new FakePort();
  port2 = new FakePort();
  constructor() {
    this.port1.other = this.port2;
    this.port2.other = this.port1;
  }
}
(globalThis as { MessageChannel?: unknown }).MessageChannel =
  globalThis.MessageChannel ?? FakeMessageChannel;

// Merge stub: return the first feature so `merged` stays truthy.
jest.mock('@turf/union', () => ({
  __esModule: true,
  default: jest.fn((fc: { features: unknown[] }) => fc.features[0]),
}));

const union = unionDefault as unknown as jest.Mock;

const city = (id: string, groupName?: string): RegionData => ({
  id,
  name: id,
  groupName,
  value: 0.5,
  accessCount: 1,
  geoJson: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    },
  },
});

/** Make performance.now advance past the slice budget on every call. */
const advanceClockPastBudget = () => {
  let elapsed = 0;
  jest
    .spyOn(performance, 'now')
    .mockImplementation(() => (elapsed += NRE_UNION_SLICE_MS + 100));
};

describe('computeNREBoundariesAsync', () => {
  beforeEach(() => {
    union.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('merges cities that share an NRE into one boundary', async () => {
    const result = await computeNREBoundariesAsync(
      [city('c1', 'NRE 1'), city('c2', 'NRE 1')],
      () => false
    );

    expect(union).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it('groups regions without an NRE under their own name (no union)', async () => {
    const result = await computeNREBoundariesAsync(
      [city('a'), city('b')],
      () => false
    );

    expect(union).not.toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('returns an empty array for empty data', async () => {
    await expect(computeNREBoundariesAsync([], () => false)).resolves.toEqual(
      []
    );
  });

  it('skips regions whose geoJson is not a Feature', async () => {
    const notAFeature = {
      ...city('x', 'NRE 1'),
      geoJson: { type: 'FeatureCollection', features: [] },
    } as unknown as RegionData;

    const result = await computeNREBoundariesAsync(
      [notAFeature, city('y', 'NRE 1')],
      () => false
    );

    // 'x' is skipped, so only 'y' remains — no merge needed.
    expect(union).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('yields to the browser when a slice exceeds the time budget', async () => {
    advanceClockPastBudget();

    const result = await computeNREBoundariesAsync(
      [city('c1', 'NRE 1'), city('c2', 'NRE 1')],
      () => false
    );

    expect(result).toHaveLength(1);
  });

  it('aborts and returns null when cancelled between slices', async () => {
    advanceClockPastBudget();

    let cancel = false;
    // Runs synchronously up to the first `await yieldToMain()`, then suspends.
    const pending = computeNREBoundariesAsync(
      [city('c1', 'NRE 1')],
      () => cancel
    );
    cancel = true;

    await expect(pending).resolves.toBeNull();
  });

  it('produces no boundary for a group with only invalid features', async () => {
    const notAFeature = {
      ...city('x', 'NRE 1'),
      geoJson: { type: 'FeatureCollection', features: [] },
    } as unknown as RegionData;

    // The one region is skipped, so the group never yields a merged polygon.
    await expect(
      computeNREBoundariesAsync([notAFeature], () => false)
    ).resolves.toEqual([]);
  });

  it('keeps the running merge when union returns null', async () => {
    union.mockReturnValueOnce(null);

    // union fails on the second city, so `merged` stays the first one.
    const result = await computeNREBoundariesAsync(
      [city('c1', 'NRE 1'), city('c2', 'NRE 1')],
      () => false
    );

    expect(result).toHaveLength(1);
  });
});

describe('yieldToMain', () => {
  it('resolves on the next macrotask', async () => {
    await expect(yieldToMain()).resolves.toBeUndefined();
  });
});
