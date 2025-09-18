import { beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { cleanup, render, RenderOptions } from '@testing-library/react';
import React from 'react';
import { standardMocks } from '../mocks';
import { testFactories } from '../factories';

/**
 * Shared test environment setup and teardown utilities
 */

interface TestEnvironmentOptions {
  timeout?: number;
  includeMSW?: boolean;
  includeStorage?: boolean;
  includeNavigation?: boolean;
  includeAPI?: boolean;
  resetMocks?: boolean;
}

/**
 * Global test environment setup
 */
export const setupGlobalTestEnvironment = (options: TestEnvironmentOptions = {}) => {
  const {
    timeout = 10000,
    includeMSW = true,
    includeStorage = true,
    includeNavigation = true,
    includeAPI = true,
    resetMocks = true
  } = options;

  // Set global timeout
  jest.setTimeout(timeout);

  beforeAll(() => {
    // Setup all mocks
    if (includeAPI) {
      standardMocks.setupAll();
    }
    
    if (includeStorage) {
      standardMocks.fileSystemMocks.setupStorageMocks();
    }

    // Setup MSW if needed
    if (includeMSW) {
      // MSW setup will be handled by the MSW setup file
      console.log('MSW setup handled by setup file');
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    if (resetMocks) {
      jest.clearAllMocks();
      standardMocks.resetAll();
    }

    // Cleanup React Testing Library
    cleanup();
  });

  afterEach(() => {
    // Additional cleanup if needed
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Global cleanup
    standardMocks.resetAll();
  });
};

/**
 * Component-specific test setup
 */
export const setupComponentTestEnvironment = (componentName: string) => {
  beforeEach(() => {
    // Component-specific setup
    console.log(`Setting up test environment for ${componentName}`);
  });

  afterEach(() => {
    // Component-specific cleanup
    cleanup();
  });
};

/**
 * API test environment setup
 */
export const setupAPITestEnvironment = () => {
  const { apiMocks } = standardMocks;

  beforeEach(() => {
    // Reset API mocks
    apiMocks.reset();
    
    // Setup default successful responses
    apiMocks.setupMockResponses({
      'POST:/backend/api/upload/': {
        ok: true,
        status: 200,
        json: async () => ({ id: 123, status: 'pending' })
      },
      'GET:/backend/api/analysis/123/': {
        ok: true,
        status: 200,
        json: async () => ({
          id: 123,
          status: 'completed',
          original_text: 'Mock analysis result'
        })
      }
    });
  });

  return {
    mockFetch: apiMocks.mockFetch,
    setupMockResponses: apiMocks.setupMockResponses,
    mockNetworkError: apiMocks.mockNetworkError,
    mockTimeout: apiMocks.mockTimeout
  };
};

/**
 * File upload test environment setup
 */
export const setupFileUploadTestEnvironment = () => {
  const { fileSystemMocks } = standardMocks;
  const { createFileUploadTest } = testFactories;

  beforeEach(() => {
    // Setup file system mocks
    fileSystemMocks.setupStorageMocks();
    
    // Reset file system mocks
    fileSystemMocks.reset();
  });

  const createTestFile = (options = {}) => {
    return createFileUploadTest(options);
  };

  const createMultipleTestFiles = (count: number, options = {}) => {
    return Array.from({ length: count }, (_, index) => 
      createFileUploadTest({ 
        fileName: `test${index + 1}.pdf`,
        ...options 
      })
    );
  };

  return {
    createTestFile,
    createMultipleTestFiles,
    mockLocalStorage: fileSystemMocks.mockLocalStorage,
    mockSessionStorage: fileSystemMocks.mockSessionStorage,
    mockFileReader: fileSystemMocks.mockFileReader
  };
};

/**
 * Navigation test environment setup
 */
export const setupNavigationTestEnvironment = () => {
  const { navigationMocks } = standardMocks;

  beforeEach(() => {
    // Reset navigation mocks
    navigationMocks.reset();
  });

  return {
    mockRouter: navigationMocks.mockRouter,
    mockUseRouter: navigationMocks.mockUseRouter,
    mockUsePathname: navigationMocks.mockUsePathname,
    mockUseSearchParams: navigationMocks.mockUseSearchParams
  };
};

/**
 * Environment variable test setup
 */
export const setupEnvironmentTest = (env: Record<string, string> = {}) => {
  const { environmentMocks } = standardMocks;
  const originalEnv = process.env;

  beforeEach(() => {
    // Set test environment
    environmentMocks.mockEnvironment({
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true',
      ...env
    });
  });

  afterEach(() => {
    // Reset environment
    environmentMocks.resetEnvironment();
  });

  return {
    setEnv: environmentMocks.mockEnvironment,
    resetEnv: environmentMocks.resetEnvironment
  };
};

/**
 * Comprehensive test setup that combines all environments
 */
export const setupFullTestEnvironment = (options: TestEnvironmentOptions = {}) => {
  const apiEnv = setupAPITestEnvironment();
  const fileEnv = setupFileUploadTestEnvironment();
  const navEnv = setupNavigationTestEnvironment();
  const envTest = setupEnvironmentTest();

  // Setup global environment
  setupGlobalTestEnvironment(options);

  return {
    api: apiEnv,
    files: fileEnv,
    navigation: navEnv,
    environment: envTest,
    mocks: standardMocks,
    factories: testFactories
  };
};

/**
 * Test cleanup utilities
 */
export const createTestCleanup = () => {
  const cleanupFunctions: (() => void)[] = [];

  const addCleanup = (fn: () => void) => {
    cleanupFunctions.push(fn);
  };

  const runCleanup = () => {
    cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    cleanupFunctions.length = 0;
  };

  afterEach(() => {
    runCleanup();
  });

  return {
    addCleanup,
    runCleanup
  };
};

/**
 * Performance test setup
 */
export const setupPerformanceTest = () => {
  const startTime = Date.now();
  const measurements: Record<string, number> = {};

  const startMeasurement = (name: string) => {
    measurements[name] = Date.now();
  };

  const endMeasurement = (name: string) => {
    const duration = Date.now() - measurements[name];
    console.log(`Performance: ${name} took ${duration}ms`);
    return duration;
  };

  const getTotalTime = () => Date.now() - startTime;

  return {
    startMeasurement,
    endMeasurement,
    getTotalTime
  };
};

/**
 * Simple render function for testing components
 */
export const renderWithProviders = (
  component: React.ReactElement,
  options?: RenderOptions
) => {
  return render(component, options);
};

