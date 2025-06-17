import '@testing-library/jest-dom';

let originalCrypto: Crypto;

beforeEach(() => {
  originalCrypto = global.crypto;

  Object.defineProperty(global, 'crypto', {
    value: {
      ...originalCrypto,
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