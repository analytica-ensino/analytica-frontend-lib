/**
 * Helper to mock window.location in jsdom environments where
 * Object.defineProperty(window, 'location', ...) no longer works.
 *
 * jsdom marks window.location as [Unforgeable] (non-configurable),
 * but we can override properties via the internal impl symbol.
 */

type LocationProps = {
  hostname?: string;
  protocol?: string;
  port?: string;
  href?: string;
  search?: string;
  origin?: string;
  pathname?: string;
  hash?: string;
  replace?: (url: string) => void;
  assign?: (url: string) => void;
  reload?: () => void;
};

type MockLocationResult = {
  restore: () => void;
  getMockLocation: () => LocationProps;
};

function getLocationImpl(): {
  impl: Record<string, unknown>;
  symbol: symbol;
} {
  const loc = window.location;
  const implSymbol = Object.getOwnPropertySymbols(loc).find(
    (s) => s.toString() === 'Symbol(impl)'
  );

  if (!implSymbol) {
    throw new Error(
      'Could not find jsdom impl symbol on window.location. ' +
        'This helper only works with jsdom environments.'
    );
  }

  return {
    impl: (loc as unknown as Record<symbol, Record<string, unknown>>)[
      implSymbol
    ],
    symbol: implSymbol,
  };
}

/**
 * Mock window.location properties in jsdom.
 *
 * Usage:
 *   const { restore } = mockWindowLocation({ hostname: 'example.com', protocol: 'https:', port: '' });
 *   // ... test code ...
 *   restore();
 *
 * For href setter capture:
 *   const mockLoc = { href: '' };
 *   const { restore } = mockWindowLocation(mockLoc);
 *   // code sets window.location.href = 'http://...'
 *   expect(mockLoc.href).toBe('http://...');
 *   restore();
 */
export function mockWindowLocation(props: LocationProps): MockLocationResult {
  const { impl } = getLocationImpl();
  const proto = Object.getPrototypeOf(impl);

  const savedDescriptors: Record<string, PropertyDescriptor | undefined> = {};

  for (const key of Object.keys(props) as (keyof LocationProps)[]) {
    // Save original descriptor (from prototype or own)
    savedDescriptors[key] =
      Object.getOwnPropertyDescriptor(impl, key) ||
      Object.getOwnPropertyDescriptor(proto, key);

    const value = props[key];

    if (typeof value === 'function') {
      // For methods like replace, assign, reload
      Object.defineProperty(impl, key, {
        value,
        configurable: true,
        writable: true,
      });
    } else {
      // For string properties, create getter/setter backed by the props object
      Object.defineProperty(impl, key, {
        get: () => props[key],
        set: (val: string) => {
          (props as Record<string, unknown>)[key] = val;
        },
        configurable: true,
      });
    }
  }

  const restore = () => {
    for (const key of Object.keys(savedDescriptors)) {
      // Remove own property override to restore prototype behavior
      if (Object.prototype.hasOwnProperty.call(impl, key)) {
        delete (impl as Record<string, unknown>)[key];
      }
    }
  };

  return { restore, getMockLocation: () => props };
}
