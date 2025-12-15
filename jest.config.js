// jest.config.js
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'katex/dist/katex.min.css': 'identity-obj-proxy',
    [String.raw`\.(css|less|scss|sass)$`]: 'identity-obj-proxy',
    [String.raw`\.(png|jpg|jpeg|gif|svg|webp)$`]: '<rootDir>/jest.fileMock.js',
  },
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/index.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.ladle/',
    String.raw`.*\.stories\.(ts|tsx)$`,
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
