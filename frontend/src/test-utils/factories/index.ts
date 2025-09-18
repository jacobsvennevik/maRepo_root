import { ProjectSetup } from '../../features/projects/types/index';

// Types for test factories
export interface FileUploadTestOptions {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  content?: string;
  multiple?: boolean;
}

export interface APIScenario {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response: any;
  status?: number;
  delay?: number;
}

export interface ComponentTestOptions {
  props?: Record<string, any>;
  withProviders?: boolean;
  mockRouter?: boolean;
  mockAPI?: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * Centralized test factories for creating consistent test data
 */
export const createTestFactories = () => {
  /**
   * File upload test factory
   */
  const createFileUploadTest = (options: FileUploadTestOptions = {}) => {
    const {
      fileName = 'test.pdf',
      fileType = 'application/pdf',
      fileSize = 1024 * 1024, // 1MB default
      content = 'test content',
      multiple = false
    } = options;

    const file = new File([content], fileName, { type: fileType }) as File;
    
    // Override size if specified
    if (fileSize !== 1024 * 1024) {
      Object.defineProperty(file, 'size', { value: fileSize });
    }

    return {
      file,
      files: multiple ? [file] : file,
      fileName,
      fileType,
      fileSize,
      content
    };
  };

  /**
   * Project setup test factory
   */
  const createProjectSetupTest = (overrides: Partial<ProjectSetup> = {}): ProjectSetup => ({
    projectName: 'Test Project',
    purpose: 'school' as const,
    testLevel: 'midterm' as const,
    courseFiles: [],
    testFiles: [],
    importantDates: [],
    uploadedFiles: [],
    timeframe: 'semester' as const,
    goal: 'pass' as const,
    studyFrequency: 'weekly' as const,
    collaboration: 'solo' as const,
    ...overrides,
  });

  /**
   * Mock API responses factory
   */
  const createMockAPIResponses = (scenarios: APIScenario[]) => {
    const mockResponses = new Map();
    
    scenarios.forEach(scenario => {
      const key = `${scenario.method}:${scenario.endpoint}`;
      mockResponses.set(key, {
        status: scenario.status || 200,
        response: scenario.response,
        delay: scenario.delay || 0
      });
    });

    return {
      getResponse: (method: string, endpoint: string) => {
        const key = `${method}:${endpoint}`;
        return mockResponses.get(key);
      },
      getAllResponses: () => Array.from(mockResponses.entries()),
      clear: () => mockResponses.clear()
    };
  };

  /**
   * Component test factory
   */
  const createComponentTest = (Component: React.ComponentType<any>, options: ComponentTestOptions = {}) => {
    const {
      props = {},
      withProviders = true,
      mockRouter = true,
      mockAPI = true
    } = options;

    return {
      Component,
      props,
      withProviders,
      mockRouter,
      mockAPI,
      render: () => {
        // This will be implemented with the render utilities
        return { Component, props };
      }
    };
  };

  /**
   * Wizard test factory
   */
  const createWizardTest = (steps: WizardStep[]) => {
    return {
      steps,
      currentStep: 0,
      totalSteps: steps.length,
      getCurrentStep: () => steps[0],
      getStepById: (id: string) => steps.find(step => step.id === id),
      getAllSteps: () => steps
    };
  };

  /**
   * File validation test cases factory
   */
  const createFileValidationTestCases = () => {
    return [
      // Valid files
      { 
        name: 'valid.pdf', 
        type: 'application/pdf', 
        size: 1024 * 1024, 
        valid: true, 
        description: 'Valid PDF file' 
      },
      { 
        name: 'valid.jpg', 
        type: 'image/jpeg', 
        size: 512 * 1024, 
        valid: true, 
        description: 'Valid JPEG image' 
      },
      { 
        name: 'valid.png', 
        type: 'image/png', 
        size: 256 * 1024, 
        valid: true, 
        description: 'Valid PNG image' 
      },
      // Invalid files
      { 
        name: 'invalid.txt', 
        type: 'text/plain', 
        size: 1024, 
        valid: false, 
        description: 'Invalid file type' 
      },
      { 
        name: 'oversized.pdf', 
        type: 'application/pdf', 
        size: 16 * 1024 * 1024, 
        valid: false, 
        description: 'File too large (>15MB)' 
      },
      { 
        name: 'empty.pdf', 
        type: 'application/pdf', 
        size: 0, 
        valid: false, 
        description: 'Empty file' 
      }
    ];
  };

  /**
   * Test environment factory
   */
  const createTestEnvironment = (env: Record<string, string> = {}) => {
    const defaultEnv: Record<string, string> = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true',
      NEXT_PUBLIC_API_URL: 'http://localhost:3000/backend/api',
      ...env
    };

    return {
      env: defaultEnv,
      setEnv: (key: string, value: string) => {
        defaultEnv[key] = value;
      },
      resetEnv: () => {
        Object.keys(defaultEnv).forEach(key => {
          if (!['NODE_ENV'].includes(key)) {
            delete defaultEnv[key];
          }
        });
      }
    };
  };

  /**
   * Mock data factory for different test scenarios
   */
  const createMockDataFactory = () => {
    const mockData = {
      // Upload responses
      uploadSuccess: {
        id: 123,
        status: 'completed',
        original_text: 'Mock test content',
        metadata: {
          course_title: 'Natural Language Interaction',
          test_title: 'Mock Test',
          source_file: 'test.pdf'
        }
      },
      
      uploadError: {
        error: 'Upload failed',
        status: 400,
        message: 'Invalid file format'
      },

      // Project data
      project: {
        id: 'project-123',
        name: 'Test Project',
        project_type: 'school',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },

      // Analysis results
      analysisResult: {
        id: 123,
        status: 'completed',
        original_text: 'Language Technology Quiz',
        processed_data: {
          test_type: 'Quiz',
          topics_covered: ['Natural Language Processing', 'Machine Learning'],
          difficulty_level: 'Intermediate',
          estimated_duration: '30 minutes'
        }
      }
    };

    return {
      get: (key: keyof typeof mockData) => mockData[key],
      getAll: () => mockData,
      create: (key: string, data: any) => {
        (mockData as any)[key] = data;
      }
    };
  };

  return {
    createFileUploadTest,
    createProjectSetupTest,
    createMockAPIResponses,
    createComponentTest,
    createWizardTest,
    createFileValidationTestCases,
    createTestEnvironment,
    createMockDataFactory
  };
};

// Export individual factories for convenience
export const {
  createFileUploadTest,
  createProjectSetupTest,
  createMockAPIResponses,
  createComponentTest,
  createWizardTest,
  createFileValidationTestCases,
  createTestEnvironment,
  createMockDataFactory
} = createTestFactories();

// Export factory instance
export const testFactories = createTestFactories();