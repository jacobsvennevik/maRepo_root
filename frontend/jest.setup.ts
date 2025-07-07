import '@testing-library/jest-dom'
require('jest-fetch-mock').enableMocks()

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  const React = require('react');
  return function MockLink({ children, href, ...props }: any) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  })
) as jest.Mock;

// Suppress console errors during tests unless they're expected
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock process.env for all tests
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

// Helper to set environment variables in tests
global.setTestEnvironment = (env: Partial<typeof processEnvMock>) => {
  Object.assign(processEnvMock, env);
};

// Helper to reset environment variables
global.resetTestEnvironment = () => {
  Object.assign(processEnvMock, {
    NODE_ENV: 'test',
    NEXT_PUBLIC_TEST_MODE: 'false'
  });
};

// Add type definitions
declare global {
  var setTestEnvironment: (env: Partial<typeof processEnvMock>) => void;
  var resetTestEnvironment: () => void;
} 