// Shared test utilities for upload step tests
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';

/**
 * Environment setup utilities
 */
export const mockProcessEnv = (isTestMode: boolean) => {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    NODE_ENV: isTestMode ? 'development' : 'production',
    NEXT_PUBLIC_TEST_MODE: isTestMode ? 'true' : 'false'
  };
  return originalEnv;
};

export const mockWindow = (isTestMode: boolean) => {
  Object.defineProperty(window, 'location', {
    value: {
      hostname: isTestMode ? 'localhost' : 'production.app'
    },
    writable: true
  });
};

/**
 * API mocking utilities
 */
export const createAPIErrorMock = () => {
  return jest.fn().mockImplementation((...args: unknown[]) => {
    const message = args[0] as string;
    const status = args[1] as number;
    const error = new Error(message) as Error & { status: number; statusCode: number };
    error.status = status;
    error.statusCode = status;
    return error;
  });
};

export const createAPIServiceMock = () => ({
  uploadFileWithProgress: jest.fn(),
  APIError: createAPIErrorMock(),
  createProject: jest.fn()
});

/**
 * Component mocking utilities
 */
export const createFileUploadMock = () => {
  const React = require('react');
  return {
    FileUpload: ({ onUpload, onRemove, files, uploadProgress, title, description, accept, error }: any) => 
      React.createElement('div', { 'data-testid': 'file-upload' },
        React.createElement('h3', null, title),
        React.createElement('p', null, description),
        React.createElement('div', { 'data-testid': 'accepted-types' }, accept),
        error && React.createElement('div', { 
          'data-testid': 'error-message', 
          className: 'bg-red-50 border border-red-200 rounded-lg p-3' 
        },
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('span', { className: 'text-red-600 text-sm' }, '⚠️'),
            React.createElement('span', { className: 'text-red-800 text-sm font-medium' }, error)
          )
        ),
        React.createElement('input', {
          type: 'file',
          'data-testid': 'file-input',
          onChange: (e: any) => {
            if (e.target.files) {
              onUpload(Array.from(e.target.files));
            }
          },
          multiple: true,
          accept: accept
        }),
        React.createElement('div', { 'data-testid': 'file-list' },
          (files || []).map((file: File, index: number) =>
            React.createElement('div', { key: file.name, 'data-testid': `file-item-${file.name}` },
              React.createElement('span', { 'data-testid': `filename-${file.name}` }, file.name),
              React.createElement('button', { 
                'data-testid': `remove-${file.name}`, 
                onClick: () => onRemove(file) 
              }, 'Remove'),
              (uploadProgress || {})[file.name] && 
                React.createElement('div', { 'data-testid': `progress-${file.name}` }, 
                  (uploadProgress || {})[file.name] + '%'
                )
            )
          )
        )
      )
  };
};

export const createNavigationMock = () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  })
});

export const createUIComponentMocks = () => {
  const React = require('react');
  return {
    Card: ({ children, className }: any) => 
      React.createElement('div', { className, 'data-testid': 'card' }, children),
    CardHeader: ({ children, className, onClick }: any) => 
      React.createElement('div', { className, onClick, 'data-testid': 'card-header' }, children),
    CardContent: ({ children, className }: any) => 
      React.createElement('div', { className, 'data-testid': 'card-content' }, children),
    CardTitle: ({ children, className }: any) => 
      React.createElement('div', { className, 'data-testid': 'card-title' }, children),
    Button: ({ children, onClick, className, variant, size, disabled }: any) => 
      React.createElement('button', {
        onClick,
        className,
        disabled,
        'data-testid': `button-${variant || 'default'}-${size || 'default'}`
      }, children)
  };
};

/**
 * Sets up common test environment cleanup
 */
export const setupTestCleanup = (mocks: any[] = []) => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.forEach((mock) => {
      if (mock && typeof mock.mockClear === "function") {
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
 * Test setup utilities
 */
export const createUploadTestSetup = (options: {
  timeout?: number;
  includeNavigation?: boolean;
  includeUIComponents?: boolean;
} = {}) => {
  const {
    timeout = 30000,
    includeNavigation = true,
    includeUIComponents = false
  } = options;

  // Set jest timeout
  jest.setTimeout(timeout);

  // Create mocks
  const mocks = {
    onUploadComplete: jest.fn(),
    onAnalysisComplete: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn(),
    originalEnv: process.env
  };

  const createBeforeEach = (isTestMode: boolean) => () => {
    // Reset mocks
    Object.values(mocks).forEach(mock => {
      if (typeof mock === 'function' && mock.mockReset) {
        mock.mockReset();
      }
    });
    jest.clearAllMocks();

    // Setup environment
    mockProcessEnv(isTestMode);
    mockWindow(isTestMode);

    // Setup localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
    });
  };

  const createAfterEach = () => () => {
    process.env = mocks.originalEnv;
  };

  return {
    mocks,
    createBeforeEach,
    createAfterEach
  };
}

/**
 * Upload progress mock utilities
 */
export const createUploadProgressMock = (
  responses: Array<{ id: number; status: string; metadata?: any; original_text?: string }>,
  progressSteps: number[] = [0, 50, 100]
) => {
  return jest.fn().mockImplementation(async (...args: unknown[]) => {
    const file = args[0] as File;
    const onProgress = args[1] as (progress: number) => void;
    // Simulate progress
    for (const step of progressSteps) {
      onProgress(step);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Find matching response based on filename
    const response = responses.find(r => 
      r.metadata?.source_file === file.name || 
      responses.length === 1
    ) || responses[0];

    return response;
  });
};

/**
 * Upload failure mock utilities
 */
export const createUploadFailureMock = (errorMessage: string, delay: number = 100) => {
  return jest.fn().mockImplementation(async (...args: unknown[]) => {
    const file = args[0] as File;
    const onProgress = args[1] as (progress: number) => void;
    onProgress(0);
    await new Promise(resolve => setTimeout(resolve, delay));
    onProgress(50);
    await new Promise(resolve => setTimeout(resolve, delay));
    throw new Error(errorMessage);
  });
};

/**
 * Common test assertion utilities
 */
export const expectUploadComplete = (
  mockFn: jest.Mock,
  expectedFiles: string[],
  expectedMetadata?: any
) => {
  expect(mockFn).toHaveBeenCalledWith(
    expect.arrayContaining(
      expectedFiles.map(fileName => 
        expect.objectContaining({
          metadata: expect.objectContaining({
            source_file: fileName,
            ...expectedMetadata
          })
        })
      )
    ),
    expectedFiles
  );
};

/**
 * Test mode detection utilities
 */
export const expectTestModeBanner = (shouldExist: boolean = true) => {
  const banner = document.querySelector('[data-testid="test-mode-banner"]');
  if (shouldExist) {
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toMatch(/Test Mode Active/i);
  } else {
    expect(banner).toBeNull();
  }
};
