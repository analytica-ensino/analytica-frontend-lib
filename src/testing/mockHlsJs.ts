/**
 * Jest double for hls.js. jsdom has no Media Source Extensions, so tests
 * replace the library and drive it by emitting its events:
 *
 * ```ts
 * jest.mock('hls.js', () => ({
 *   __esModule: true,
 *   default: jest.requireActual('../../testing/mockHlsJs').MockHls,
 * }));
 * ```
 */

type Listener = (event: string, data: unknown) => void;

export interface MockLevel {
  height: number;
  bitrate: number;
}

export class MockHls {
  static readonly Events = {
    MANIFEST_PARSED: 'hlsManifestParsed',
    ERROR: 'hlsError',
  };

  static readonly ErrorTypes = {
    NETWORK_ERROR: 'networkError',
    MEDIA_ERROR: 'mediaError',
    OTHER_ERROR: 'otherError',
  };

  static readonly isSupported = jest.fn(() => true);

  /** Every instance created since the last `reset()`. */
  static instances: MockHls[] = [];

  /** When set, the constructor throws it (a failed library load). */
  static constructorError: Error | null = null;

  static reset() {
    MockHls.instances = [];
    MockHls.constructorError = null;
    MockHls.isSupported.mockReset();
    MockHls.isSupported.mockReturnValue(true);
  }

  static get last(): MockHls {
    const instance = MockHls.instances.at(-1);
    if (!instance) throw new Error('no hls.js instance was created');
    return instance;
  }

  readonly config: unknown;
  levels: MockLevel[] = [];
  startLevel = -1;
  currentLevel = -1;
  nextLevel = -1;
  readonly loadSource = jest.fn();
  readonly attachMedia = jest.fn();
  readonly startLoad = jest.fn();
  readonly recoverMediaError = jest.fn();
  readonly destroy = jest.fn(() => {
    this.listeners.clear();
  });
  private readonly listeners = new Map<string, Listener[]>();

  constructor(config: unknown) {
    if (MockHls.constructorError) throw MockHls.constructorError;
    this.config = config;
    MockHls.instances.push(this);
  }

  on(event: string, listener: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
  }

  emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(event, data));
  }

  /** Emits MANIFEST_PARSED with these levels, sorted as hls.js sorts them. */
  parseManifest(levels: MockLevel[]) {
    this.levels = [...levels].sort((a, b) => a.height - b.height);
    this.emit(MockHls.Events.MANIFEST_PARSED, { levels: this.levels });
  }

  /** Emits an ERROR event. */
  fail(type: string, fatal: boolean, details = 'testError') {
    this.emit(MockHls.Events.ERROR, { type, fatal, details });
  }
}
