# 🧪 Test Utilities Documentation

This document explains how to use the centralized test utilities for consistent, maintainable, and efficient testing across the application.

## 📁 Structure Overview

```
src/test-utils/
├── factories/           # Test data factories
│   └── index.ts        # Centralized factories
├── mocks/              # Standardized mocks
│   └── index.ts        # Mock patterns
├── setup/              # Test environment setup
│   └── shared-setup.ts # Shared setup/teardown
├── render.tsx          # Custom render functions
├── index.ts            # Main entry point
├── test-helpers.ts     # Legacy utilities (backward compatibility)
└── upload-test-helpers.tsx # Legacy upload utilities
```

## 🚀 Quick Start

### Basic Setup

```typescript
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from '@/test-utils';

// Setup test environment
const testEnv = setupFullTestEnvironment();

describe('MyComponent', () => {
  beforeEach(() => {
    testEnv.mocks.resetAll();
  });

  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    // Your test assertions
  });
});
```

## 🏭 Test Factories

### File Upload Testing

```typescript
import { testFactories } from '@/test-utils';

const { createTestFile, createFileValidationTestCases } = testFactories;

// Create a single test file
const { file } = createTestFile({
  fileName: 'test.pdf',
  fileType: 'application/pdf',
  fileSize: 1024 * 1024,
  content: 'test content'
});

// Create multiple test files
const files = Array.from({ length: 3 }, (_, i) => 
  createTestFile({ fileName: `test${i + 1}.pdf` })
);

// Use predefined validation test cases
const testCases = createFileValidationTestCases();
```

### Project Setup Testing

```typescript
const { createProjectSetupTest } = testFactories;

// Create default project setup
const projectSetup = createProjectSetupTest();

// Create with overrides
const customProject = createProjectSetupTest({
  projectName: 'Custom Project',
  purpose: 'research',
  testLevel: 'final'
});
```

### API Response Testing

```typescript
const { createMockAPIResponses } = testFactories;

const scenarios = [
  {
    endpoint: '/api/upload',
    method: 'POST',
    response: { id: 123, status: 'completed' }
  },
  {
    endpoint: '/api/analysis/123',
    method: 'GET',
    response: { result: 'analysis complete' }
  }
];

const mockAPI = createMockAPIResponses(scenarios);
```

## 🎭 Standardized Mocks

### API Mocks

```typescript
import { standardMocks } from '@/test-utils';

const { apiMocks } = standardMocks;

// Setup default responses
apiMocks.setupMockResponses({
  'POST:/api/upload': {
    ok: true,
    status: 200,
    json: async () => ({ id: 123, status: 'pending' })
  }
});

// Mock network errors
apiMocks.mockNetworkError();

// Mock timeouts
apiMocks.mockTimeout(5000);

// Reset mocks
apiMocks.reset();
```

### Component Mocks

```typescript
const { componentMocks } = standardMocks;

// Use predefined component mocks
const { FileUpload, Button, Card } = componentMocks;

// Create custom component mock
const CustomMock = componentMocks.createMockComponent('CustomComponent', 'custom-test-id');
```

### Navigation Mocks

```typescript
const { navigationMocks } = standardMocks;

// Access router mocks
const { mockRouter, mockUseRouter } = navigationMocks;

// Use in tests
const router = mockUseRouter();
expect(router.push).toHaveBeenCalledWith('/expected-path');
```

### File System Mocks

```typescript
const { fileSystemMocks } = standardMocks;

// Setup storage mocks
fileSystemMocks.setupStorageMocks();

// Access mocks
const { mockLocalStorage, mockSessionStorage } = fileSystemMocks;

// Use in tests
mockLocalStorage.getItem.mockReturnValue('stored-value');
```

## 🎨 Custom Render Functions

### Basic Rendering

```typescript
import { renderWithProviders } from '@/test-utils';

// Render with all providers
renderWithProviders(<MyComponent />);

// Render without providers
renderWithProviders(<MyComponent />, { withProviders: false });

// Render with custom query client
const customClient = createTestQueryClient();
renderWithProviders(<MyComponent />, { queryClient: customClient });
```

### Specialized Render Functions

```typescript
import {
  renderFileUploadComponent,
  renderWizardComponent,
  renderAPIComponent,
  renderIsolatedComponent
} from '@/test-utils';

// For file upload components
renderFileUploadComponent(<FileUploadComponent />);

// For wizard components
renderWizardComponent(<WizardComponent />);

// For API-dependent components
renderAPIComponent(<APIComponent />);

// For isolated unit tests
renderIsolatedComponent(<PureComponent />);
```

### Custom Context Providers

```typescript
import { renderWithContext } from '@/test-utils';

const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={mockAuthValue}>
    {children}
  </AuthContext.Provider>
);

renderWithContext(
  <MyComponent />,
  [AuthProvider],
  { withProviders: true }
);
```

## ⚙️ Test Environment Setup

### Full Environment Setup

```typescript
import { setupFullTestEnvironment } from '@/test-utils';

const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeFileSystem: true,
  includeNavigation: true,
  resetMocks: true
});

// Access utilities
const { api, files, navigation, environment, mocks, factories } = testEnv;
```

### Individual Environment Setup

```typescript
import {
  setupAPITestEnvironment,
  setupFileUploadTestEnvironment,
  setupNavigationTestEnvironment
} from '@/test-utils';

// API environment
const apiEnv = setupAPITestEnvironment();
const { mockFetch, setupMockResponses } = apiEnv;

// File upload environment
const fileEnv = setupFileUploadTestEnvironment();
const { createTestFile, mockLocalStorage } = fileEnv;

// Navigation environment
const navEnv = setupNavigationTestEnvironment();
const { mockRouter } = navEnv;
```

## 📊 Parameterized Testing

### Data-Driven Tests

```typescript
import { createFileValidationTestCases } from '@/test-utils';

const testCases = createFileValidationTestCases();

describe.each(testCases)('File Validation', ({ name, type, size, valid, description }) => {
  it(`should ${valid ? 'accept' : 'reject'} ${description}`, async () => {
    const { file } = createTestFile({
      fileName: name,
      fileType: type,
      fileSize: size
    });

    // Test implementation
  });
});
```

### Custom Test Cases

```typescript
const customTestCases = [
  { mode: 'test', expectedBanner: true },
  { mode: 'production', expectedBanner: false }
];

describe.each(customTestCases)('Test Mode Detection', ({ mode, expectedBanner }) => {
  it(`should ${expectedBanner ? 'show' : 'hide'} banner in ${mode} mode`, () => {
    // Test implementation
  });
});
```

## 🔧 Performance Testing

```typescript
import { setupPerformanceTest } from '@/test-utils';

const perfTest = setupPerformanceTest();

it('should render within performance budget', () => {
  perfTest.startMeasurement('render');
  
  renderWithProviders(<LargeComponent />);
  
  const duration = perfTest.endMeasurement('render');
  expect(duration).toBeLessThan(1000); // 1 second budget
});
```

## 🧹 Cleanup Utilities

```typescript
import { createTestCleanup } from '@/test-utils';

const cleanup = createTestCleanup();

it('should cleanup resources', () => {
  // Add cleanup functions
  cleanup.addCleanup(() => {
    // Custom cleanup logic
  });

  // Cleanup runs automatically after test
});
```

## 📈 Best Practices

### 1. Use Factories for Test Data

```typescript
// ✅ Good
const { file } = createTestFile({ fileName: 'test.pdf' });

// ❌ Avoid
const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
```

### 2. Use Centralized Mocks

```typescript
// ✅ Good
const { apiMocks } = standardMocks;
apiMocks.setupMockResponses();

// ❌ Avoid
global.fetch = jest.fn().mockResolvedValue({ ok: true });
```

### 3. Use Custom Render Functions

```typescript
// ✅ Good
renderWithProviders(<Component />);

// ❌ Avoid
render(<Component />);
```

### 4. Use Parameterized Tests

```typescript
// ✅ Good
describe.each(testCases)('Validation', ({ input, expected }) => {
  it(`should validate ${input}`, () => {
    // Single test implementation
  });
});

// ❌ Avoid
it('should validate valid input', () => { /* ... */ });
it('should validate invalid input', () => { /* ... */ });
```

### 5. Use Environment Setup

```typescript
// ✅ Good
const testEnv = setupFullTestEnvironment();
beforeEach(() => testEnv.mocks.resetAll());

// ❌ Avoid
beforeEach(() => {
  jest.clearAllMocks();
  // Manual setup for each test
});
```

## 🔄 Migration Guide

### From Legacy Test Helpers

```typescript
// Old way
import { createTestFile, simulateFileUpload } from '@/test-utils/test-helpers';

// New way
import { testFactories, renderWithProviders } from '@/test-utils';
const { createTestFile } = testFactories;
```

### From Manual Mock Setup

```typescript
// Old way
beforeEach(() => {
  global.fetch = jest.fn();
  Object.defineProperty(window, 'localStorage', { value: mockStorage });
});

// New way
const testEnv = setupFullTestEnvironment();
beforeEach(() => testEnv.mocks.resetAll());
```

## 🐛 Troubleshooting

### Common Issues

1. **Mocks not resetting**: Ensure you call `resetAll()` in `beforeEach`
2. **Provider errors**: Use `renderWithProviders` instead of `render`
3. **File upload issues**: Use `renderFileUploadComponent` for file components
4. **API mock not working**: Check endpoint format in `setupMockResponses`

### Debug Tips

```typescript
// Enable debug logging
const testEnv = setupFullTestEnvironment({ debug: true });

// Check mock calls
console.log(apiMocks.mockFetch.mock.calls);

// Verify environment setup
console.log(testEnv.mocks.getAllResponses());
```

## 📚 Examples

See the following files for complete examples:
- `test-upload-step-optimized.test.tsx` - File upload testing
- `test-factories-examples.test.tsx` - Factory usage
- `test-mocks-examples.test.tsx` - Mock patterns
- `test-render-examples.test.tsx` - Custom rendering
