/**
 * Upload-specific test utilities
 */

import { createMockFile, createMockApiResponse } from './test-helpers';

// Mock API service for upload tests
export const createAPIServiceMock = () => ({
  uploadFile: jest.fn().mockResolvedValue(createMockApiResponse({ 
    documentId: 'mock-doc-123',
    url: 'mock-url'
  })),
  processDocument: jest.fn().mockResolvedValue(createMockApiResponse({
    taskId: 'mock-task-456',
    status: 'processing'
  })),
  getDocumentStatus: jest.fn().mockResolvedValue(createMockApiResponse({
    status: 'completed',
    extractedData: {
      courseName: 'Mock Course',
      topics: ['topic1', 'topic2']
    }
  })),
});

// Setup upload test environment
export const createUploadTestSetup = () => {
  const mockFiles = [
    createMockFile('test.pdf', 'application/pdf'),
    createMockFile('syllabus.pdf', 'application/pdf'),
  ];

  const mockApiService = createAPIServiceMock();

  const mockProps = {
    onUploadComplete: jest.fn(),
    onAnalysisComplete: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn(),
  };

  return {
    mockFiles,
    mockApiService,
    mockProps,
  };
};

export default {
  createAPIServiceMock,
  createUploadTestSetup,
};
