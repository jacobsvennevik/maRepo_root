/** @type {import('jest').Config} */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Enhanced setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts', 
    '<rootDir>/tests/setup/jest.setup.ts',
    '<rootDir>/src/test-utils/setup/jest.setup.ts'
  ],
  testEnvironment: 'jest-environment-jsdom',
  
  // Module mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
  },
  
  // Performance optimizations
  maxWorkers: '50%', // Use half of available CPU cores for parallel execution
  testTimeout: 15000, // Increased timeout for complex tests
  
  // Test discovery patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/test-utils/**', // Exclude test utilities from coverage
    '!src/**/*.config.{js,ts}',
    '!src/**/index.{js,ts}', // Exclude barrel exports
  ],
  
  // Enhanced coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75,
    },
    // Feature-specific thresholds
    'src/features/projects/': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    'src/features/diagnostics/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    'src/features/flashcards/': {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    // Higher thresholds for utilities
    'src/app/projects/create/utils/cleanup-utils.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/app/projects/create/utils/upload-utils.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporting
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Test result processing
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Cache configuration
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output for debugging
  verbose: false,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 