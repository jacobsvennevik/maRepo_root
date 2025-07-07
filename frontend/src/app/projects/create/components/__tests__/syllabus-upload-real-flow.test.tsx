// Set environment variables before any imports to ensure they're available when the component is loaded
process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_TEST_MODE = 'true';

import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SyllabusUploadStep } from '../steps/syllabus-upload-step';
import {
  createLocalStorageMock,
  createMockProjectSetup,
  createTestFile,
  createMockFetch,
  setupTestCleanup,
  simulateFileUpload
} from '../../../../../test-utils/test-helpers';
import {
  createAPIServiceMock,
  createUploadTestSetup
} from '../../../../../test-utils/upload-test-helpers';

// Setup test environment using shared utilities
const { mocks, createBeforeEach, createAfterEach } = createUploadTestSetup();
const localStorageMock = createLocalStorageMock();
const mockFetch = createMockFetch();

// Mock the API module using shared utilities
jest.mock('../../services/api', () => ({
  createProject: jest.fn().mockResolvedValue({
    id: 'project-123',
    name: 'Advanced Physics',
    project_type: 'school'
  }),
  uploadFileWithProgress: jest.fn(),
  APIError: jest.fn().mockImplementation((message: string, status: number) => {
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = status;
    return error;
  })
}));

describe('SyllabusUploadStep - Real Issue Reproduction', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnBack = jest.fn();

  setupTestCleanup([mockFetch, mockOnUploadComplete, mockOnBack]);

  describe('Production Flow - User Reported Issue', () => {
    beforeEach(() => {
      // Reset to production mode for these tests
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_TEST_MODE = 'false';
    });

    it('should handle successful PDF upload and processing flow correctly', async () => {
      // Mock the complete API flow that should happen
      let pollCount = 0;
      mockFetch
        // 1. Upload PDF - should succeed
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 123,
              filename: 'syllabus.pdf',
              status: 'pending'
            }),
          })
        )
        // 2. Start processing - should succeed
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              message: 'Processing started',
              document_id: 123
            }),
          })
        )
        // 3. Polling requests - return processing status, then completed
        .mockImplementation(() => {
          pollCount++;
          if (pollCount <= 3) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                id: 123,
                status: 'processing',
                original_text: '',
                metadata: {}
              }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                id: 123,
                status: 'completed',
                original_text: 'Course: Advanced Physics',
                processed_data: {
                  course_name: 'Advanced Physics',
                  topics: ['mechanics', 'thermodynamics']
                },
                metadata: {
                  course_name: 'Advanced Physics',
                  topics: ['mechanics', 'thermodynamics']
                }
              }),
            });
          }
        });

      const setup = createMockProjectSetup({ projectName: 'Advanced Physics' });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />
      );

      // Find the file input and upload the file
      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('syllabus.pdf', 'test pdf content');

      await simulateFileUpload(fileInput, testFile);

      // Wait for file to be displayed
      await waitFor(() => {
        expect(screen.getByText('syllabus.pdf')).toBeInTheDocument();
      });

      // Find and click the analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Wait for the processing to complete and callback to be called
      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            'project-123',
            expect.objectContaining({
              id: 123,
              status: 'completed',
              original_text: 'Course: Advanced Physics',
              metadata: expect.objectContaining({
                course_name: 'Advanced Physics',
                topics: ['mechanics', 'thermodynamics']
              })
            }),
            'syllabus.pdf'
          );
        },
        { timeout: 15000 }
      );
    });

    it('should handle API failure gracefully and show error message', async () => {
      // Mock upload failure
      mockFetch.mockRejectedValueOnce(new Error('Upload failed'));

      const setup = createMockProjectSetup({ projectName: 'Advanced Physics' });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('syllabus.pdf', 'test pdf content');

      await simulateFileUpload(fileInput, testFile);

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Should show error message - update to match actual error text
      await waitFor(() => {
        expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
      });
    });

    it('should handle processing timeout correctly', async () => {
      // Mock successful upload and processing start
      let pollCount = 0;
      mockFetch
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 123,
              filename: 'syllabus.pdf',
              status: 'pending'
            }),
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              message: 'Processing started',
              document_id: 123
            }),
          })
        )
        // Mock all polling requests to return processing status (simulating timeout)
        .mockImplementation(() => {
          pollCount++;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 123,
              status: 'processing',
              original_text: '',
              metadata: {}
            }),
          });
        });

      const setup = createMockProjectSetup({ projectName: 'Advanced Physics' });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('syllabus.pdf', 'test pdf content');

      await simulateFileUpload(fileInput, testFile);

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Wait for timeout to occur and callback to be called with timeout data
      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            'project-123',
            expect.objectContaining({
              id: 123,
              status: 'completed',
              metadata: expect.objectContaining({
                course_name: expect.any(String)
              })
            }),
            'syllabus.pdf'
          );
        },
        { timeout: 12000 }
      );
    });
  });

  describe('Test Mode Flow', () => {
    beforeEach(() => {
      // Ensure test mode is enabled for these tests
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    });

    it('should use mock data in test mode and skip API calls', async () => {
      const setup = createMockProjectSetup();

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />
      );

      // Should show test mode indicator
      expect(screen.getByText(/Test Mode Active/i)).toBeInTheDocument();

      const testFile = createTestFile('syllabus.pdf', 'test pdf content');
      const fileInput = screen.getByTestId('file-input');
      
      await simulateFileUpload(fileInput, testFile);

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Should use mock data and call the callback quickly
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          'project-123',
          expect.objectContaining({
            status: 'completed',
            metadata: expect.objectContaining({
              course_name: expect.any(String)
            })
          }),
          'syllabus.pdf'
        );
      }, { timeout: 3000 });

      // Should not make any real API calls
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
}); 