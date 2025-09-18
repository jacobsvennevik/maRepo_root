/**
 * Example: How to Use Modular Test Patterns
 * 
 * This file demonstrates how to use the modular test patterns
 * for different types of components.
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import modular test utilities
import { 
  renderWithProviders,
  createAuthTestSuite,
  createFileUploadTestSuite,
  authScenarios,
  fileUploadScenarios,
  setupTestEnvironment
} from '../../test-utils';

// ============================================================================
// Example 1: Authentication Component Testing
// ============================================================================

// Mock component for demonstration
const AuthComponent = () => (
  <div>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Sign In</button>
  </div>
);

describe('AuthComponent - Modular Testing', () => {
  // Create a complete test suite
  const authSuite = createAuthTestSuite(AuthComponent);

  describe('Complete Authentication Suite', () => {
    it('successful login', async () => {
      await authSuite.testSuccessfulLogin();
    });

    it('login error', async () => {
      await authSuite.testLoginError();
    });

    it('form validation', async () => {
      await authSuite.testFormValidation();
    });

    it('accessibility', async () => {
      await authSuite.testAccessibility();
    });

    it('performance', async () => {
      await authSuite.testPerformance();
    });
  });
});

// ============================================================================
// Example 2: File Upload Component Testing
// ============================================================================

// Mock file upload component
const FileUploadComponent = ({ onUpload }: { onUpload: (files: File[]) => void }) => (
  <div>
    <input type="file" multiple />
    <button onClick={() => onUpload([])}>Upload</button>
  </div>
);

describe('FileUploadComponent - Modular Testing', () => {
  const mockOnUpload = jest.fn();
  
  // Create a complete test suite
  const fileUploadSuite = createFileUploadTestSuite(FileUploadComponent, { onUpload: mockOnUpload });

  describe('Complete File Upload Suite', () => {
    it('file upload', async () => {
      await fileUploadSuite.testFileUpload();
    });

    it('file validation', async () => {
      await fileUploadSuite.testFileValidation();
    });

    it('drag and drop', async () => {
      await fileUploadSuite.testDragAndDrop();
    });

    it('error handling', async () => {
      await fileUploadSuite.testErrorHandling();
    });

    it('accessibility', async () => {
      await fileUploadSuite.testAccessibility();
    });

    it('performance', async () => {
      await fileUploadSuite.testPerformance();
    });
  });
});

// ============================================================================
// Example 3: Custom Component with Manual Pattern Usage
// ============================================================================

const CustomComponent = () => (
  <div>
    <h1>Custom Component</h1>
    <button>Click me</button>
  </div>
);

describe('CustomComponent - Manual Pattern Usage', () => {
  // Setup test environment
  const testEnv = setupTestEnvironment({
    includeAuth: true,
    includeFileUpload: false,
    timeout: 5000
  });

  beforeEach(() => {
    testEnv.cleanup();
  });

  describe('Rendering', () => {
    it('renders with required elements', () => {
      renderWithProviders(<CustomComponent />);
      
      expect(screen.getByText('Custom Component')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles button click', async () => {
      renderWithProviders(<CustomComponent />);
      
      const button = screen.getByRole('button');
      // Add your interaction test here
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', () => {
      const startTime = performance.now();
      renderWithProviders(<CustomComponent />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

// ============================================================================
// Example 4: Data-Driven Testing
// ============================================================================

describe('Data-Driven Testing Examples', () => {
  describe('Authentication Scenarios', () => {
    // Test multiple credential scenarios
    authScenarios.validCredentials.forEach((credentials, index) => {
      it(`handles valid credentials ${index + 1}`, async () => {
        const authSuite = createAuthTestSuite(AuthComponent);
        // Custom test implementation using the credentials
      });
    });

    // Test multiple error scenarios
    authScenarios.errorScenarios.forEach((scenario) => {
      it(`handles ${scenario.name}`, async () => {
        const authSuite = createAuthTestSuite(AuthComponent);
        // Custom test implementation using the error scenario
      });
    });
  });

  describe('File Upload Scenarios', () => {
    // Test multiple file types
    fileUploadScenarios.validFiles.forEach((file) => {
      it(`handles ${file.name} upload`, async () => {
        const fileUploadSuite = createFileUploadTestSuite(FileUploadComponent);
        // Custom test implementation using the file
      });
    });

    // Test validation scenarios
    fileUploadScenarios.validationScenarios.forEach((scenario) => {
      it(`validates ${scenario.name}`, async () => {
        const fileUploadSuite = createFileUploadTestSuite(FileUploadComponent);
        // Custom test implementation using the validation scenario
      });
    });
  });
});

// ============================================================================
// Example 5: Custom Test Patterns
// ============================================================================

/**
 * Create custom test patterns for specific component types
 */
const createCustomTestPattern = (component: React.ComponentType<any>) => {
  return {
    async testCustomBehavior() {
      renderWithProviders(<component />);
      // Custom test implementation
    },

    async testCustomInteraction() {
      renderWithProviders(<component />);
      // Custom interaction test
    },

    async testCustomValidation() {
      renderWithProviders(<component />);
      // Custom validation test
    }
  };
};

describe('Custom Test Patterns', () => {
  const customPattern = createCustomTestPattern(CustomComponent);

  it('custom behavior', async () => {
    await customPattern.testCustomBehavior();
  });

  it('custom interaction', async () => {
    await customPattern.testCustomInteraction();
  });

  it('custom validation', async () => {
    await customPattern.testCustomValidation();
  });
});
