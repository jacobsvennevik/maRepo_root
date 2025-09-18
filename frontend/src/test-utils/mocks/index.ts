import { jest } from '@jest/globals';

/**
 * Standardized mock patterns for consistent testing across the application
 */

/**
 * API Mock Factory
 */
export const createAPIMocks = () => {
  const mockFetch = jest.fn();
  
  // Default successful responses
  const defaultResponses = {
    upload: {
      ok: true,
      status: 200,
      json: async () => ({ id: 123, status: 'pending' })
    },
    analysis: {
      ok: true,
      status: 200,
      json: async () => ({
        id: 123,
        status: 'completed',
        original_text: 'Mock analysis result',
        metadata: { course_title: 'Test Course' }
      })
    },
    error: {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Error message'
    }
  };

  const setupMockResponses = (responses: Record<string, any> = {}) => {
    const responseMap: Record<string, any> = { ...defaultResponses, ...responses };
    
    mockFetch.mockImplementation((url: string, options?: any) => {
      const method = options?.method || 'GET';
      const key = `${method}:${url}`;
      
      // Find matching response
      const response = responseMap[key] || responseMap.upload;
      
      return Promise.resolve({
        ...response,
        json: response.json || (async () => ({})),
        text: response.text || (async () => ''),
      });
    });
  };

  const mockNetworkError = () => {
    mockFetch.mockRejectedValue(new Error('Network error') as never);
  };

  const mockTimeout = (delay: number = 5000) => {
    mockFetch.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), delay)
      )
    );
  };

  return {
    mockFetch,
    setupMockResponses,
    mockNetworkError,
    mockTimeout,
    reset: () => mockFetch.mockReset()
  };
};

/**
 * Component Mock Factory
 */
export const createComponentMocks = () => {
  const React = require('react');

  const createMockComponent = (displayName: string, testId?: string) => {
    const MockComponent = (props: any) => 
      React.createElement('div', { 
        'data-testid': testId || displayName.toLowerCase(),
        ...props 
      }, props.children);
    
    MockComponent.displayName = displayName;
    return MockComponent;
  };

  const fileUploadMock = createMockComponent('FileUpload', 'file-upload');
  const buttonMock = createMockComponent('Button', 'button');
  const cardMock = createMockComponent('Card', 'card');
  const dialogMock = createMockComponent('Dialog', 'dialog');

  return {
    FileUpload: fileUploadMock,
    Button: buttonMock,
    Card: cardMock,
    Dialog: dialogMock,
    createMockComponent
  };
};

/**
 * Navigation Mock Factory
 */
export const createNavigationMocks = () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  };

  const mockUseRouter = () => mockRouter;

  const mockUsePathname = () => '/test-path';

  const mockUseSearchParams = () => new URLSearchParams();

  return {
    mockRouter,
    mockUseRouter,
    mockUsePathname,
    mockUseSearchParams,
    reset: () => {
      Object.values(mockRouter).forEach(mock => {
        if (typeof mock === 'function' && mock.mockReset) {
          mock.mockReset();
        }
      });
    }
  };
};

/**
 * File System Mock Factory
 */
export const createFileSystemMocks = () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };

  const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };

  const setupStorageMocks = () => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  };

  const mockFileReader = {
    readAsText: jest.fn(),
    readAsDataURL: jest.fn(),
    readAsArrayBuffer: jest.fn(),
    result: null,
    error: null,
    readyState: 0,
    onload: null,
    onerror: null,
    onloadend: null
  };

  return {
    mockLocalStorage,
    mockSessionStorage,
    mockFileReader,
    setupStorageMocks,
    reset: () => {
      Object.values(mockLocalStorage).forEach(mock => {
        if (typeof mock === 'function' && mock.mockReset) {
          mock.mockReset();
        }
      });
      Object.values(mockSessionStorage).forEach(mock => {
        if (typeof mock === 'function' && mock.mockReset) {
          mock.mockReset();
        }
      });
    }
  };
};

/**
 * MSW Handler Factory
 */
export const createMSWHandlers = () => {
  const handlers = [];

  const addHandler = (method: string, url: string, response: any, status = 200) => {
    handlers.push({
      method: method.toUpperCase(),
      url,
      response,
      status
    });
  };

  const createUploadHandler = (response: any = { id: 123, status: 'completed' }) => {
    addHandler('POST', '/backend/api/upload/', response);
  };

  const createAnalysisHandler = (response: any = { 
    id: 123, 
    status: 'completed', 
    original_text: 'Mock analysis' 
  }) => {
    addHandler('GET', '/backend/api/analysis/:id/', response);
  };

  const createErrorHandler = (status = 400, message = 'Error') => {
    addHandler('POST', '/backend/api/upload/', { error: message }, status);
  };

  return {
    handlers,
    addHandler,
    createUploadHandler,
    createAnalysisHandler,
    createErrorHandler,
    clear: () => handlers.length = 0
  };
};

/**
 * Environment Mock Factory
 */
export const createEnvironmentMocks = () => {
  const originalEnv = process.env;
  const originalWindow = window;

  const mockEnvironment = (env: Record<string, string>) => {
    process.env = { ...originalEnv, ...env };
  };

  const mockWindow = (props: Record<string, any>) => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, ...props },
      writable: true
    });
  };

  const resetEnvironment = () => {
    process.env = originalEnv;
    Object.defineProperty(window, 'location', {
      value: originalWindow.location,
      writable: true
    });
  };

  return {
    mockEnvironment,
    mockWindow,
    resetEnvironment
  };
};

/**
 * Main factory function that creates all standardized mocks
 */
export const createStandardMocks = () => {
  const apiMocks = createAPIMocks();
  const componentMocks = createComponentMocks();
  const navigationMocks = createNavigationMocks();
  const fileSystemMocks = createFileSystemMocks();
  const mswHandlers = createMSWHandlers();
  const environmentMocks = createEnvironmentMocks();

  const resetAll = () => {
    apiMocks.reset();
    navigationMocks.reset();
    fileSystemMocks.reset();
    mswHandlers.clear();
    environmentMocks.resetEnvironment();
  };

  const setupAll = () => {
    fileSystemMocks.setupStorageMocks();
    global.fetch = apiMocks.mockFetch as jest.MockedFunction<typeof fetch>;
  };

  return {
    apiMocks,
    componentMocks,
    navigationMocks,
    fileSystemMocks,
    mswHandlers,
    environmentMocks,
    resetAll,
    setupAll
  };
};

// Export main factory
export const standardMocks = createStandardMocks();
