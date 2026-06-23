const path = require('path');

/** @type {import('jest').Config} */
const config = {
  // rootDir is the project root (c:\proj\gr-groups-nextjs)
  rootDir: '../',

  // Only pick up tests inside tests/unit and tests/integration
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx}',
  ],

  // jsdom for React component rendering
  testEnvironment: 'jest-environment-jsdom',

  // Run jest-dom matchers and global polyfills
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    '<rootDir>/tests/jest.setup.js'
  ],

  // Transform with Babel (supports JSX + ESM)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      { configFile: path.resolve(__dirname, '.babelrc') },
    ],
  },

  // Map @/ path alias and framework mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|ico|webp)$': '<rootDir>/tests/mocks/file-mock.js',
    '^next/navigation$': '<rootDir>/tests/mocks/next-navigation.js',
    '^next/server$': '<rootDir>/tests/mocks/next-server.js',
    '^next/link$': '<rootDir>/tests/mocks/next-link.js',
    '^next/image$': '<rootDir>/tests/mocks/next-image.js',
    '^react-hot-toast$': '<rootDir>/tests/mocks/react-hot-toast.js',
  },

  // Exclude E2E tests (run with Playwright separately)
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/.next/',
    '<rootDir>/__tests__/',   // ignore old __tests__ folder
    '<rootDir>/e2e/',         // ignore old e2e folder
  ],

  // Coverage settings
  collectCoverageFrom: [
    'src/services/**/*.{js,jsx}',
    'src/lib/**/*.{js,jsx}',
    'src/utils/**/*.{js,jsx}',
    'src/app/api/**/*.{js,jsx}',
    '!**/*.d.ts',
  ],
  coverageDirectory: '<rootDir>/tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};

module.exports = config;
