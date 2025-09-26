import '@testing-library/jest-dom';

let originalCrypto: Crypto | undefined;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeEach(() => {
  originalCrypto = global.crypto;

   Object.defineProperty(global, 'crypto', {
       value: {
         ...(originalCrypto ?? {}),
         randomUUID: () => 'mock-uuid-123-1-1',
       },
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(global, 'crypto', {
    value: originalCrypto,
    configurable: true,
  });
});