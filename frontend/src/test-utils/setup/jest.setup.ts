import '@testing-library/jest-dom';
import { urlMatchers } from '../../../tests/matchers/urlMatchers';

// Setup MSW server (optional)
let server: any = null;
try {
  const { setupServer } = require('msw/node');
  const { handlers } = require('../../tests/msw/handlers');
  server = setupServer(...handlers);
} catch (error) {
  console.warn('MSW not available, skipping server setup');
}

// Global test setup
beforeAll(() => {
  // Register custom Jest matchers
  expect.extend(urlMatchers);
  
  // Start MSW server if available
  if (server) {
    server.listen({ onUnhandledRequest: 'error' });
  }
  
  // Setup global mocks
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock scrollTo
  global.scrollTo = jest.fn();

  // Mock console methods to reduce noise in tests
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

// Reset handlers between tests
afterEach(() => {
  if (server) {
    server.resetHandlers();
  }
});

// Cleanup after all tests
afterAll(() => {
  if (server) {
    server.close();
  }
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveValue(value: string | string[] | number): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toStartWithApi(): R;
      toHaveNoDoubleSlash(): R;
      toBeSameBaseURLAs(other: any): R;
    }
  }
}
