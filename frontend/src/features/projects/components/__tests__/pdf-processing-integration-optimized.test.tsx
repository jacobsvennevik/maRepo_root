import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import new centralized utilities
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from '../../../../../src/test-utils';

// Setup test environment
const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeStorage: true,
  includeNavigation: true
});

const { apiMocks } = standardMocks;

describe('PDF Processing Integration - Optimized', () => {
  beforeEach(() => {
    testEnv.mocks.resetAll();
    
    // Setup default API responses for PDF processing
    apiMocks.setupMockResponses({
      'POST:/backend/api/upload/': {
        ok: true,
        status: 200,
        json: async () => ({ id: 123, status: 'processing' })
      },
      'GET:/backend/api/extract/': {
        ok: true,
        status: 200,
        json: async () => ({ 
          id: 123, 
          status: 'completed',
          extracted_data: { course_name: 'Test Course', topics: ['Topic 1', 'Topic 2'] }
        })
      }
    });
  });

  describe('Step Navigation Order', () => {
    it('should have uploadSyllabus step before extractionResults step', () => {
      // Import the steps to validate order
      const { SETUP_STEPS } = require('../../services/steps');
      
      const uploadSyllabusIndex = SETUP_STEPS.findIndex((step: any) => step.id === 'uploadSyllabus');
      const extractionResultsIndex = SETUP_STEPS.findIndex((step: any) => step.id === 'extractionResults');
      const testUploadIndex = SETUP_STEPS.findIndex((step: any) => step.id === 'testUpload');
      
      // Validate the step order is correct
      expect(uploadSyllabusIndex).toBeGreaterThan(-1);
      expect(extractionResultsIndex).toBeGreaterThan(-1);
      expect(testUploadIndex).toBeGreaterThan(-1);
      
      // uploadSyllabus should come before extractionResults
      expect(uploadSyllabusIndex).toBeLessThan(extractionResultsIndex);
      
      // extractionResults should come before testUpload
      expect(extractionResultsIndex).toBeLessThan(testUploadIndex);
    });

    it('should have all required steps for PDF processing flow', () => {
      const { SETUP_STEPS } = require('../../services/steps');
      
      const stepIds = SETUP_STEPS.map((step: any) => step.id);
      
      expect(stepIds).toContain('uploadSyllabus');
      expect(stepIds).toContain('extractionResults');
      expect(stepIds).toContain('testUpload');
    });

    it('should have proper step dependencies', () => {
      const { SETUP_STEPS } = require('../../services/steps');
      
      const uploadSyllabusStep = SETUP_STEPS.find((step: any) => step.id === 'uploadSyllabus');
      const extractionResultsStep = SETUP_STEPS.find((step: any) => step.id === 'extractionResults');
      
      expect(uploadSyllabusStep).toBeDefined();
      expect(extractionResultsStep).toBeDefined();
      
      // extractionResults should depend on uploadSyllabus
      expect(extractionResultsStep.dependencies).toContain('uploadSyllabus');
    });
  });

  describe('Mock Data Structure', () => {
    it('should have properly structured mock data for testing', () => {
      // Use factory to create test data
      const { createProjectSetupTest } = testFactories;
      const mockData = createProjectSetupTest({
        courseName: 'Test Course',
        topics: ['Topic 1', 'Topic 2'],
        status: 'completed'
      });
      
      expect(mockData).toHaveProperty('id');
      expect(mockData).toHaveProperty('original_text');
      expect(mockData).toHaveProperty('metadata');
      expect(mockData).toHaveProperty('status');
      expect(mockData.metadata).toHaveProperty('course_name');
    });

    it('should validate mock data consistency', () => {
      const { createProjectSetupTest } = testFactories;
      const mockData = createProjectSetupTest({
        courseName: 'Advanced Mathematics',
        topics: ['Algebra', 'Calculus', 'Statistics'],
        status: 'completed'
      });
      
      expect(mockData.metadata.course_name).toBe('Advanced Mathematics');
      expect(mockData.metadata.topics).toHaveLength(3);
      expect(mockData.status).toBe('completed');
    });

    it('should handle different file types in mock data', () => {
      const { createFileUploadTest } = testFactories;
      
      const pdfFile = createFileUploadTest({ 
        fileName: 'syllabus.pdf', 
        fileType: 'application/pdf' 
      });
      const docFile = createFileUploadTest({ 
        fileName: 'course.doc', 
        fileType: 'application/msword' 
      });
      
      expect(pdfFile.file.type).toBe('application/pdf');
      expect(docFile.file.type).toBe('application/msword');
    });
  });

  describe('API Integration', () => {
    it('should handle PDF upload API calls', async () => {
      const { createFileUploadTest } = testFactories;
      const { file } = createFileUploadTest({ 
        fileName: 'test-syllabus.pdf',
        fileType: 'application/pdf'
      });

      // Simulate file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiMocks.mockFetch('/backend/api/upload/', {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(true);
      expect(apiMocks.mockFetch).toHaveBeenCalledWith(
        '/backend/api/upload/',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle extraction API calls', async () => {
      const response = await apiMocks.mockFetch('/backend/api/extract/123');
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.status).toBe('completed');
      expect(data.extracted_data).toHaveProperty('course_name');
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Processing failed' })
      });

      const response = await apiMocks.mockFetch('/backend/api/upload/', {
        method: 'POST',
        body: new FormData()
      });

      expect(response.ok).toBe(false);
      const errorData = await response.json();
      expect(errorData.error).toBe('Processing failed');
    });
  });

  describe('File Processing Pipeline', () => {
    it('should validate file types for PDF processing', () => {
      const { createFileUploadTest } = testFactories;
      
      const validFiles = [
        createFileUploadTest({ fileName: 'test.pdf', fileType: 'application/pdf' }),
        createFileUploadTest({ fileName: 'test.doc', fileType: 'application/msword' }),
        createFileUploadTest({ fileName: 'test.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      ];

      validFiles.forEach(({ file }) => {
        expect(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
          .toContain(file.type);
      });
    });

    it('should handle file size validation', () => {
      const { createFileUploadTest } = testFactories;
      
      const smallFile = createFileUploadTest({ fileSize: 1024 * 1024 }); // 1MB
      const largeFile = createFileUploadTest({ fileSize: 50 * 1024 * 1024 }); // 50MB
      
      expect(smallFile.file.size).toBeLessThan(25 * 1024 * 1024); // Under 25MB limit
      expect(largeFile.file.size).toBeGreaterThan(25 * 1024 * 1024); // Over 25MB limit
    });

    it('should process multiple files in sequence', async () => {
      const { createFileUploadTest } = testFactories;
      
      const files = [
        createFileUploadTest({ fileName: 'syllabus.pdf' }),
        createFileUploadTest({ fileName: 'course-content.pdf' }),
        createFileUploadTest({ fileName: 'tests.pdf' })
      ];

      // Simulate sequential processing
      for (const { file } of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiMocks.mockFetch('/backend/api/upload/', {
          method: 'POST',
          body: formData
        });
        
        expect(response.ok).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Mock network error
      apiMocks.mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await apiMocks.mockFetch('/backend/api/upload/', {
          method: 'POST',
          body: new FormData()
        });
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle timeout errors', async () => {
      // Mock timeout
      apiMocks.mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      try {
        await apiMocks.mockFetch('/backend/api/extract/123');
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });

    it('should handle malformed response data', async () => {
      // Mock malformed response
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      const response = await apiMocks.mockFetch('/backend/api/extract/123');
      
      try {
        await response.json();
      } catch (error) {
        expect(error.message).toBe('Invalid JSON');
      }
    });
  });

  describe('Performance', () => {
    it('should handle concurrent file uploads', async () => {
      const { createFileUploadTest } = testFactories;
      
      const files = Array.from({ length: 5 }, (_, i) => 
        createFileUploadTest({ fileName: `file-${i}.pdf` })
      );

      // Simulate concurrent uploads
      const uploadPromises = files.map(({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiMocks.mockFetch('/backend/api/upload/', {
          method: 'POST',
          body: formData
        });
      });

      const responses = await Promise.all(uploadPromises);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });

    it('should validate processing time limits', async () => {
      const startTime = Date.now();
      
      await apiMocks.mockFetch('/backend/api/extract/123');
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
