/**
 * Shared test utilities and helpers
 */

// Mock localStorage implementation
export const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

// Mock project setup for tests
export const createMockProjectSetup = () => ({
  projectName: 'Test Project',
  educationLevel: 'undergraduate',
  courseData: {
    courseName: 'Test Course',
    topics: ['topic1', 'topic2'],
  },
  testData: {
    testDate: '2024-12-31',
    testType: 'final',
  },
  files: [],
});

// Mock file creation
export const createMockFile = (name: string, type: string = 'application/pdf', size: number = 1024) => {
  return new File(['mock content'], name, { type });
};

// API response mocks
export const createMockApiResponse = <T>(data: T, status: number = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Form event helpers
export const createMockFormEvent = (value: string) => ({
  target: { value },
  preventDefault: jest.fn(),
  currentTarget: { value },
} as any);

// Upload progress mock
export const createMockUploadProgress = (loaded: number, total: number) => ({
  loaded,
  total,
  lengthComputable: true,
  type: 'progress',
});

export default {
  createLocalStorageMock,
  createMockProjectSetup,
  createMockFile,
  createMockApiResponse,
  createMockFormEvent,
  createMockUploadProgress,
};
