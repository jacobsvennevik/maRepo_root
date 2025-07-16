import { ProjectSetup } from '../app/projects/create/types';
import { fireEvent, act } from '@testing-library/react';

/**
 * Creates a mock localStorage object for testing
 */
export const createLocalStorageMock = () => {
  const storage: { [key: string]: string } = {};
  
  const localStorageMock = {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
};

/**
 * Creates a mock Next.js router for testing
 */
export const createRouterMock = () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockPrefetch = jest.fn();
  const mockBack = jest.fn();
  const mockForward = jest.fn();
  const mockRefresh = jest.fn();

  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
    }),
  }));

  return {
    mockPush,
    mockReplace,
    mockPrefetch,
    mockBack,
    mockForward,
    mockRefresh,
  };
};

/**
 * Creates a default project setup object for testing
 */
export const createMockProjectSetup = (overrides: Partial<ProjectSetup> = {}): ProjectSetup => ({
  projectName: 'Test Project',
  purpose: 'school' as const,
  testLevel: 'midterm' as const,
  courseFiles: [],
  evaluationTypes: [],
  testFiles: [],
  importantDates: [],
  uploadedFiles: [],
  timeframe: 'semester' as const,
  goal: 'pass' as const,
  studyFrequency: 'weekly' as const,
  collaboration: 'solo' as const,
  courseType: 'stem',
  learningStyle: 'visual',
  assessmentType: 'cumulative-final',
  studyPreference: 'mixed',
  learningDifficulties: '',
  ...overrides,
});

/**
 * Creates a test file for file upload testing
 */
export const createTestFile = (
  name: string = 'test.pdf',
  content: string = 'test content',
  type: string = 'application/pdf'
): File => {
  return new File([content], name, { type });
};

/**
 * Creates mock backend data structure
 */
export const createMockBackendData = (overrides: any = {}) => ({
  id: 123,
  original_text: 'Course content',
  metadata: { course_name: 'Test Course' },
  status: 'completed',
  ...overrides,
});

/**
 * Sets up common test environment cleanup
 */
export const setupTestCleanup = (mocks: any[] = []) => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.forEach(mock => {
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    });
  });
};

/**
 * Creates a mock fetch implementation for API testing
 */
export const createMockFetch = () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;
  return mockFetch;
};

/**
 * Helper to simulate file upload in tests
 */
export const simulateFileUpload = async (fileInput: HTMLElement, files: File | File[]) => {
  const fileList = Array.isArray(files) ? files : [files];
  await act(async () => {
    fireEvent.change(fileInput, {
      target: {
        files: fileList,
      },
    });
  });
};

/**
 * Helper to wait for async operations with act wrapper
 */
export const actAndWait = async (callback: () => void | Promise<void>) => {
  const { act, waitFor } = await import('@testing-library/react');
  
  await act(async () => {
    await callback();
  });
  
  return waitFor;
};

/**
 * Creates environment variable setup for tests
 */
export const setupTestEnvironment = (env: Record<string, string>) => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ...env
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
};

/**
 * Creates a comprehensive test setup with all common mocks
 */
export const setupFullTestEnvironment = () => {
  const localStorageMock = createLocalStorageMock();
  const routerMocks = createRouterMock();
  const mockFetch = createMockFetch();
  
  setupTestCleanup([mockFetch]);
  
  return {
    localStorageMock,
    routerMocks,
    mockFetch,
  };
};

// Environment helpers
const processEnvMock = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_TEST_MODE: 'false'
};

Object.defineProperty(process, 'env', {
  get: () => processEnvMock,
  set: (value) => {
    Object.assign(processEnvMock, value);
  }
});

export const setTestEnvironment = (env: Partial<typeof processEnvMock>) => {
  Object.assign(processEnvMock, env);
};

export const resetTestEnvironment = () => {
  Object.assign(processEnvMock, {
    NODE_ENV: 'test',
    NEXT_PUBLIC_TEST_MODE: 'false'
  });
}; 