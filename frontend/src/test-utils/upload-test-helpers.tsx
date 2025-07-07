// Shared test utilities for upload step tests
import React from 'react';
import { jest } from '@jest/globals';

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
  return jest.fn().mockImplementation((message: string, status: number) => {
    const error = new Error(message) as Error & { status: number; statusCode: number };
    error.status = status;
    error.statusCode = status;
    return error;
  });
};

export const createAPIServiceMock = () => ({
  uploadFileWithProgress: jest.fn(),
  APIError: createAPIErrorMock(),
  createProject: jest.fn().mockResolvedValue({
    id: 'project-123',
    name: 'Test Project',
    project_type: 'school'
  })
});

/**
 * Component mocking utilities
 */
export const createFileUploadMock = () => ({
  FileUpload: ({ onUpload, onRemove, files, uploadProgress, title, description, accept, error }: any) => (
    <div data-testid="file-upload">
      <h3>{title}</h3>
      <p>{description}</p>
      <div data-testid="accepted-types">{accept}</div>
      {error && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => {
          if (e.target.files) {
            onUpload(Array.from(e.target.files));
          }
        }}
        multiple
        accept={accept}
      />
      <div data-testid="file-list">
        {files.map((file: File, index: number) => (
          <div key={file.name} data-testid={`file-item-${file.name}`}>
            <span data-testid={`filename-${file.name}`}>{file.name}</span>
            <button data-testid={`remove-${file.name}`} onClick={() => onRemove(file)}>Remove</button>
            {uploadProgress[file.name] && (
              <div data-testid={`progress-${file.name}`}>{uploadProgress[file.name]}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
});

export const createNavigationMock = () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  })
});

export const createUIComponentMocks = () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="card-header">{children}</div>
  ),
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className} data-testid="card-title">{children}</div>,
  Button: ({ children, onClick, className, variant, size, disabled }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-testid={`button-${variant || 'default'}-${size || 'default'}`}
    >
      {children}
    </button>
  )
});

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
};

/**
 * Upload progress mock utilities
 */
export const createUploadProgressMock = (
  responses: Array<{ id: number; status: string; metadata?: any; original_text?: string }>,
  progressSteps: number[] = [0, 50, 100]
) => {
  return jest.fn().mockImplementation(async (file: File, onProgress: (progress: number) => void) => {
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
  return jest.fn().mockImplementation(async (file: File, onProgress: (progress: number) => void) => {
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
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Test Mode Active/i);
  } else {
    expect(banner).not.toBeInTheDocument();
  }
}; 