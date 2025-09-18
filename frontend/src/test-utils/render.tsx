import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function with providers for consistent testing
 */

// Simple test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
}

const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean;
  mockRouter?: boolean;
  mockAPI?: boolean;
}

/**
 * Custom render function with providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    withProviders = true,
    mockRouter = true,
    mockAPI = true,
    ...renderOptions
  } = options;

  // Setup mocks if requested
  if (mockRouter) {
    // Router mocks are handled by Jest mocks
  }

  if (mockAPI) {
    // API mocks are handled by Jest mocks
  }

  const Wrapper = withProviders 
    ? ({ children }: { children: React.ReactNode }) => (
        <TestProviders>
          {children}
        </TestProviders>
      )
    : undefined;

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render function specifically for file upload components
 */
export const renderFileUploadComponent = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { fileSystemMocks } = standardMocks;
  
  // Setup file system mocks
  fileSystemMocks.setupStorageMocks();

  return renderWithProviders(ui, {
    withProviders: true,
    mockRouter: true,
    mockAPI: true,
    ...options
  });
};

/**
 * Render function for wizard components
 */
export const renderWizardComponent = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { navigationMocks } = standardMocks;
  
  // Setup navigation mocks
  navigationMocks.reset();

  return renderWithProviders(ui, {
    withProviders: true,
    mockRouter: true,
    mockAPI: true,
    ...options
  });
};

/**
 * Render function for API-dependent components
 */
export const renderAPIComponent = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { apiMocks } = standardMocks;
  
  // Setup API mocks
  apiMocks.setupMockResponses();

  return renderWithProviders(ui, {
    withProviders: true,
    mockRouter: true,
    mockAPI: true,
    ...options
  });
};

/**
 * Render function for isolated unit tests
 */
export const renderIsolatedComponent = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  return renderWithProviders(ui, {
    withProviders: false,
    mockRouter: false,
    mockAPI: false,
    ...options
  });
};

/**
 * Helper to create a test wrapper with custom providers
 */
export const createTestWrapper = (
  additionalProviders?: React.ComponentType<{ children: React.ReactNode }>
) => {
  return ({ children }: { children: React.ReactNode }) => {
    const content = additionalProviders 
      ? React.createElement(additionalProviders, { children })
      : children;

    return (
      <TestProviders>
        {content}
      </TestProviders>
    );
  };
};

/**
 * Helper to render with specific context providers
 */
export const renderWithContext = (
  ui: React.ReactElement,
  contextProviders: React.ComponentType<{ children: React.ReactNode }>[],
  options: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return contextProviders.reduceRight(
      (acc, Provider) => React.createElement(Provider, { children: acc }),
      children
    );
  };

  return renderWithProviders(ui, {
    ...options,
    wrapper: ({ children }) => (
      <TestProviders>
        <Wrapper>{children}</Wrapper>
      </TestProviders>
    )
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render functions
export {
  renderWithProviders,
  renderFileUploadComponent,
  renderWizardComponent,
  renderAPIComponent,
  renderIsolatedComponent,
  createTestWrapper,
  renderWithContext,
  TestProviders
};
