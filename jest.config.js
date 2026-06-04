// jest.config.js
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          // TS 6 requires an explicit rootDir whenever declaration emit is on
          // (inherited from the base config); set it for the test compilation.
          declaration: false,
          declarationMap: false,
          rootDir: 'src',
          // Allow transforming the ESM .js files from html-react-parser &
          // friends (allowlisted in transformIgnorePatterns) down to CJS.
          allowJs: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'katex/dist/katex.min.css': 'identity-obj-proxy',
    [String.raw`\.(css|less|scss|sass)$`]: 'identity-obj-proxy',
    [String.raw`\.(png|jpg|jpeg|gif|svg|webp)$`]: '<rootDir>/jest.fileMock.js',
    // Stub ESM-only markdown packages with local doubles (ts-jest can't
    // transform node_modules ESM without heavy config).
    '^react-markdown$': '<rootDir>/src/testing/mockReactMarkdown.tsx',
    '^remark-gfm$': '<rootDir>/src/testing/mockRemarkGfm.ts',
    '^remark-math$': '<rootDir>/src/testing/mockRemarkMath.ts',
    '^rehype-katex$': '<rootDir>/src/testing/mockRehypeKatex.ts',
  },
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/index.ts',
    '!src/testing/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.ladle/',
    String.raw`.*\.stories\.(ts|tsx)$`,
  ],
  // html-react-parser v6 (and its html-dom-parser dep) ship ESM only, which
  // ts-jest (CommonJS) can't load without transforming. Allow those packages
  // through the node_modules transform.
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(html-react-parser|html-dom-parser|domhandler|domelementtype|domutils|entities|dom-serializer)/)',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Only add sonar reporter when explicitly needed
if (process.env.SONAR_REPORTER === 'true') {
  config.testResultsProcessor = 'jest-sonar-reporter';
}

module.exports = config;
