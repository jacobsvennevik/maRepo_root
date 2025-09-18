/**
 * Test Utilities Index
 * 
 * Centralized exports for all test utilities, patterns, and helpers.
 */

// ============================================================================
// Core Test Utilities
// ============================================================================

export { renderWithProviders } from './setup/shared-setup';
export { testFactories } from './factories';
export { standardMocks } from './mocks';

// ============================================================================
// Test Patterns
// ============================================================================

// Authentication patterns
export {
  createLoginFlowTest,
  createTokenHandlingTest,
  createErrorScenarioTest,
  createAuthAccessibilityTest,
  createAuthPerformanceTest
} from './patterns/auth/login-flow.test';

// File upload patterns
export {
  createFileValidationTest,
  createDragDropTest,
  createUploadProgressTest,
  createFileListTest,
  createFileUploadErrorTest
} from './patterns/file-upload/validation.test';

// Form patterns
export {
  createFormRenderingTest,
  createFormValidationTest,
  createFormInteractionTest,
  createFormStateTest,
  createFormAccessibilityTest,
  createFormPerformanceTest
} from './patterns/forms/validation.test';

// ============================================================================
// Helper Functions
// ============================================================================

// Authentication helpers
export {
  authHelpers,
  authScenarios,
  authTestUtils
} from './helpers/auth-helpers';

// File upload helpers
export {
  fileUploadHelpers,
  fileValidationHelpers,
  fileUploadScenarios,
  fileUploadTestUtils
} from './helpers/file-helpers';

// ============================================================================
// Test Suite Creators
// ============================================================================

/**
 * Create a complete authentication test suite
 */
export const createAuthTestSuite = (component: React.ComponentType<any>, props: any = {}) => {
  const { authTestUtils } = require('./helpers/auth-helpers.ts');
  return authTestUtils.createAuthTestSuite(component, props);
};

/**
 * Create a complete file upload test suite
 */
export const createFileUploadTestSuite = (component: React.ComponentType<any>, props: any = {}) => {
  const { fileUploadTestUtils } = require('./helpers/file-helpers.ts');
  return fileUploadTestUtils.createFileUploadTestSuite(component, props);
};

// ============================================================================
// Common Test Scenarios
// ============================================================================

export const commonScenarios = {
  // Authentication scenarios
  auth: {
    validCredentials: [
      { email: 'test@example.com', password: 'password123' },
      { email: 'user@domain.org', password: 'securepass456' },
      { email: 'admin@company.com', password: 'adminpass789' }
    ],
    invalidCredentials: [
      { email: 'test@example.com', password: 'wrongpassword' },
      { email: 'nonexistent@example.com', password: 'password123' },
      { email: 'test@example.com', password: '' }
    ],
    errorScenarios: [
      {
        name: 'Invalid credentials',
        mockError: { response: { data: { detail: 'Invalid credentials' } } },
        expectedMessage: /invalid credentials/i
      },
      {
        name: 'Network error',
        mockError: new Error('Network Error'),
        expectedMessage: /network error/i
      },
      {
        name: 'Server error',
        mockError: { response: { status: 500, data: { detail: 'Internal server error' } } },
        expectedMessage: /internal server error/i
      }
    ]
  },

  // File upload scenarios
  fileUpload: {
    validFiles: [
      { name: 'test1.pdf', content: 'PDF content', type: 'application/pdf' },
      { name: 'test2.docx', content: 'DOCX content', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'test3.pptx', content: 'PPTX content', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
    ],
    invalidFiles: [
      { name: 'test.txt', content: 'TXT content', type: 'text/plain' },
      { name: 'test.jpg', content: 'JPG content', type: 'image/jpeg' },
      { name: 'large.pdf', content: 'x'.repeat(26 * 1024 * 1024), type: 'application/pdf' }
    ],
    validationScenarios: [
      {
        name: 'Valid PDF file',
        file: { name: 'valid.pdf', content: 'content', type: 'application/pdf' },
        shouldPass: true
      },
      {
        name: 'Valid DOCX file',
        file: { name: 'valid.docx', content: 'content', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        shouldPass: true
      },
      {
        name: 'Invalid TXT file',
        file: { name: 'invalid.txt', content: 'content', type: 'text/plain' },
        shouldPass: false,
        expectedError: 'is not a supported file type'
      },
      {
        name: 'File too large',
        file: { name: 'large.pdf', content: 'x'.repeat(26 * 1024 * 1024), type: 'application/pdf' },
        shouldPass: false,
        expectedError: 'File is too large'
      }
    ]
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Setup test environment with common mocks
 */
export const setupTestEnvironment = (options: {
  includeAuth?: boolean;
  includeFileUpload?: boolean;
  includeForms?: boolean;
  timeout?: number;
} = {}) => {
  const { standardMocks } = require('./mocks/index.ts');
  const { testFactories } = require('./factories/index.ts');
  
  const mocks = standardMocks;
  const factories = testFactories;
  
  // Setup common mocks based on options
  if (options.includeAuth) {
    // Setup authentication mocks
    mocks.mockAxiosAuth.post.mockClear();
    mocks.mockAxiosApi.get.mockClear();
  }
  
  if (options.includeFileUpload) {
    // Setup file upload mocks
    // Add file upload specific mock setup
  }
  
  if (options.includeForms) {
    // Setup form mocks
    // Add form specific mock setup
  }
  
  return {
    mocks,
    factories,
    cleanup: () => {
      jest.clearAllMocks();
    }
  };
};

/**
 * Create a test with automatic cleanup
 */
export const createTestWithCleanup = (testFn: () => void | Promise<void>) => {
  return async () => {
    try {
      await testFn();
    } finally {
      jest.clearAllMocks();
    }
  };
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface TestConfig {
  component: React.ComponentType<any>;
  props?: any;
  mocks?: any;
  setup?: () => void;
  teardown?: () => void;
}

export interface AuthTestConfig extends TestConfig {
  mockResponses?: {
    login?: any;
    profile?: any;
    error?: any;
  };
}

export interface FileUploadTestConfig extends TestConfig {
  mockResponses?: {
    upload?: any;
    progress?: any;
    error?: any;
  };
}

export interface FormTestConfig extends TestConfig {
  fields: Array<{
    name: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
    label: string;
    required?: boolean;
    placeholder?: string;
  }>;
  validationRules?: Array<{
    field: string;
    rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
    value?: any;
    message: string;
  }>;
}