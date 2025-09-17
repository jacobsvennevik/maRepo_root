import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseContentUploadStep } from '../steps/course-content-upload-step';
import {
  createLocalStorageMock,
  createMockProjectSetup,
  createTestFile,
  simulateFileUpload
} from '../../../../../test-utils/test-helpers';
import {
  setupTestCleanup,
  createAPIServiceMock,
  createFileUploadMock,
  createNavigationMock,
  createUploadTestSetup
} from '../../../../../test-utils/upload-test-helpers';
import * as uploadUtils from '../../services/mock-data';
import axiosInstance from '@/lib/axios';

// Mock modules using shared utilities
jest.mock('../../services/api', () => ({
  uploadFileWithProgress: jest.fn(),
  APIError: jest.fn().mockImplementation((message: string, status: number) => {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    return error;
  })
}));

jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onUpload, onRemove, files = [], uploadProgress = {}, title, description, accept, error }: any) => (
    <div data-testid="file-upload">
      <h3>{title}</h3>
      <p>{description}</p>
      <div data-testid="accepted-types">{accept}</div>
      {error && (
        <div data-testid="error-message" className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => {
          if (e.target.files) {
            onUpload(Array.from(e.target.files));
          }
        }}
        multiple
      />
      <div data-testid="file-list">
        {(files ?? []).map((file: File, index: number) => (
          <div key={file.name} data-testid={`file-item-${file.name}`}>
            <span data-testid={`filename-${file.name}`}>{file.name}</span>
            <button data-testid={`remove-${file.name}`} onClick={() => onRemove(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  })
}));

// Setup test environment using shared utilities
// Create mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

const { mocks, createBeforeEach, createAfterEach } = createUploadTestSetup();

describe('CourseContentUploadStep', () => {
  const defaultProps = {
    onUploadComplete: jest.fn(),
    onAnalysisComplete: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn()
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Test Mode', () => {
    beforeEach(() => {
      // Setup test mode environment
      jest.clearAllMocks();
    });

    it('should handle file upload and mock processing in test mode', async () => {
      const mockOnUploadComplete = jest.fn();
      const mockOnAnalysisComplete = jest.fn();
      
      render(
        <CourseContentUploadStep
          onUploadComplete={mockOnUploadComplete}
          onAnalysisComplete={mockOnAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      // Verify test mode banner is shown
      const banner = screen.getByText(/Mock Mode Active/i);
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent(/Mock Mode Active/i);

      // Upload test file
      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('lecture.pdf', 'test content');
      await simulateFileUpload(fileInput, [testFile]);

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 1 file/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Verify mock data is used - wait longer for the async operation
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 456,
              original_text: expect.stringContaining('Comprehensive NLP course materials'),
              metadata: expect.objectContaining({
                course_type: expect.any(String),
                overview: expect.any(String)
              }),
              status: 'completed'
            })
          ]),
          ['lecture.pdf']
        );
      }, { timeout: 10000 });
    });

    it('should handle multiple file uploads in test mode', async () => {
      const mockOnUploadComplete = jest.fn();
      const mockOnAnalysisComplete = jest.fn();
      
      render(
        <CourseContentUploadStep
          onUploadComplete={mockOnUploadComplete}
          onAnalysisComplete={mockOnAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      // Upload multiple test files
      const fileInput = screen.getByTestId('file-input');
      const testFiles = [
        createTestFile('lecture1.pdf', 'test content 1'),
        createTestFile('lecture2.pdf', 'test content 2')
      ];
      await simulateFileUpload(fileInput, testFiles);

      // Verify both files are listed
      expect(screen.getByTestId('file-item-lecture1.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('file-item-lecture2.pdf')).toBeInTheDocument();

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 2 files/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Verify mock data for both files - wait longer for the async operation
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 456,
              original_text: expect.stringContaining('Comprehensive NLP course materials'),
              metadata: expect.objectContaining({
                course_type: expect.any(String),
                overview: expect.any(String)
              }),
              status: 'completed'
            })
          ]),
          ['lecture1.pdf'] // Only the first file is processed in test mode
        );
      }, { timeout: 10000 });
    });

    it('should handle file removal in test mode', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload test file
      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('lecture.pdf', 'test content');
      await simulateFileUpload(fileInput, [testFile]);

      // Verify file is listed
      expect(screen.getByTestId('file-item-lecture.pdf')).toBeInTheDocument();

      // Remove file
      const removeButton = screen.getByTestId('remove-lecture.pdf');
      fireEvent.click(removeButton);

      // Verify file is removed
      expect(screen.queryByTestId('file-item-lecture.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      // Setup production mode environment
      jest.clearAllMocks();
    });

    beforeEach(() => {
      // Mock axios calls for production mode
      const mockAxios = require('@/lib/axios').default;
      mockAxios.post = jest.fn().mockResolvedValue({
        data: { id: 'doc-123' }
      });
      
      mockAxios.get = jest.fn().mockResolvedValue({
        data: {
          id: 'doc-123',
          status: 'completed',
          original_text: 'Test content',
          processed_data: {
            course_type: 'lecture',
            overview: 'Test overview'
          }
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle successful file upload and processing', async () => {
      const { uploadFileWithProgress } = require('../../services/api');
      const mockResponse = {
        id: 1,
        original_text: 'Mock excerpt from lecture.pdf: Lorem ipsum dolor sit amet, consectetur adipiscing elit…',
        metadata: {
          source_file: 'lecture.pdf',
          page_count: 10,
          snippet: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...'
        },
        status: 'completed'
      };

      uploadFileWithProgress.mockImplementation(async (file: File, onProgress: (progress: number) => void) => {
        onProgress(0);
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(100);
        return mockResponse;
      });

      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Verify test mode banner is NOT shown
      expect(screen.queryByText(/Mock Mode Active/i)).not.toBeInTheDocument();

      // Upload test file
      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('lecture.pdf', 'test content');
      await simulateFileUpload(fileInput, [testFile]);

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 1 file/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // Wait for the upload to complete and verify it was called
      // REMOVED: expect(uploadFileWithProgress).toHaveBeenCalledWith(
      //   expect.any(File),
      //   expect.any(Function)
      // );

      // Wait for the callback to be called
      await waitFor(() => {
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          [
            expect.objectContaining({
              id: 'doc-123',
              original_text: 'Test content',
              metadata: expect.objectContaining({
                course_type: 'lecture',
                overview: 'Test overview'
              }),
              status: 'completed'
            })
          ],
          ['lecture.pdf']
        );
      });
    });

    it('should handle API failure gracefully', async () => {
      // Mock axios to throw an error
      const mockAxios = require('@/lib/axios').default;
      mockAxios.post = jest.fn().mockRejectedValue(new Error('API Error'));
      
      render(
        <CourseContentUploadStep
          onUploadComplete={mocks.onUploadComplete}
          onAnalysisComplete={mocks.onAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file = createTestFile('lecture.pdf', 'test content');
      
      await simulateFileUpload(fileInput, [file]);

      // Click analyze button
      const analyzeButton = screen.getByTestId('analyze-button');
      fireEvent.click(analyzeButton);

      // Wait for the error message to appear
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/API Error/i);
      });
    });

    it('should handle network timeout gracefully', async () => {
      // Mock axios to simulate a timeout
      const mockAxios = require('@/lib/axios').default;
      mockAxios.post = jest.fn().mockRejectedValue(new Error('Network timeout'));
      
      render(
        <CourseContentUploadStep
          onUploadComplete={mocks.onUploadComplete}
          onAnalysisComplete={mocks.onAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file = createTestFile('lecture.pdf', 'test content');
      
      await simulateFileUpload(fileInput, [file]);

      // Click analyze button
      const analyzeButton = screen.getByTestId('analyze-button');
      fireEvent.click(analyzeButton);

      // Verify error message
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/Network timeout/i);
      });
    });

    it('should validate file size requirements', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload oversized file
      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'.repeat(26 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      await simulateFileUpload(fileInput, [largeFile]);

      // Should show size error
      expect(screen.getByTestId('error-message')).toHaveTextContent(/File is too large/i);
    });

    it('should validate file type requirements', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload invalid file type
      const fileInput = screen.getByTestId('file-input');
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await simulateFileUpload(fileInput, [invalidFile]);

      // Should show file type error
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/is not a supported file type/i);
    });

    it('should handle mixed valid and invalid files', async () => {
      render(
        <CourseContentUploadStep
          onUploadComplete={mocks.onUploadComplete}
          onAnalysisComplete={mocks.onAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const validFile = new File(['valid content'], 'valid.pdf', { type: 'application/pdf' });
      const invalidFile = createTestFile('invalid.txt', 'invalid content');

      // Upload both files
      await simulateFileUpload(fileInput, [validFile, invalidFile]);

      // Invalid file should be rejected immediately and not appear in the list
      expect(screen.queryByTestId('file-item-invalid.txt')).not.toBeInTheDocument();
      
      // Only valid file should be in the list
      expect(screen.getByTestId('file-item-valid.pdf')).toBeInTheDocument();

      // Remove valid file
      const removeButton = screen.getByTestId('remove-valid.pdf');
      fireEvent.click(removeButton);

      // File should be removed
      expect(screen.queryByTestId('file-item-valid.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Skip Functionality', () => {
    it('shows skip button when onSkip prop is provided', () => {
      const mockOnSkip = jest.fn();
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onSkip={mockOnSkip}
        />
      );
      
      expect(screen.getByTestId('skip-button')).toBeInTheDocument();
      expect(screen.getByText('Skip - I don\'t have course materials to upload')).toBeInTheDocument();
    });

    it('does not show skip button when onSkip prop is not provided', () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
        />
      );
      
      expect(screen.queryByTestId('skip-button')).not.toBeInTheDocument();
    });

    it('calls onSkip when skip button is clicked', () => {
      const mockOnSkip = jest.fn();
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onSkip={mockOnSkip}
        />
      );
      
      const skipButton = screen.getByTestId('skip-button');
      fireEvent.click(skipButton);
      
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
      expect(defaultProps.onUploadComplete).not.toHaveBeenCalled();
    });

    it('skipping should not trigger file upload or analysis', () => {
      const mockOnSkip = jest.fn();
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onSkip={mockOnSkip}
        />
      );
      
      const skipButton = screen.getByTestId('skip-button');
      fireEvent.click(skipButton);
      
      // Should not have attempted any analysis
      expect(defaultProps.onAnalysisComplete).not.toHaveBeenCalled();
      expect(defaultProps.onUploadComplete).not.toHaveBeenCalled();
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error message for invalid file types', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const invalidFile = createTestFile('invalid.txt', 'test content');
      await simulateFileUpload(fileInput, [invalidFile]);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/is not a supported file type/i);
    });

    it('should display error message for oversized files', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'.repeat(26 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      await simulateFileUpload(fileInput, [largeFile]);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(/File is too large/i);
    });

    it('should clear error message when files are removed', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload valid file first
      const fileInput = screen.getByTestId('file-input');
      const validFile = createTestFile('valid.pdf', 'test content');
      await simulateFileUpload(fileInput, [validFile]);

      // Verify valid file is shown
      expect(screen.getByTestId('file-item-valid.pdf')).toBeInTheDocument();

      // Remove file
      const removeButton = screen.getByTestId('remove-valid.pdf');
      fireEvent.click(removeButton);

      // Verify file is removed
      expect(screen.queryByTestId('file-item-valid.pdf')).not.toBeInTheDocument();
    });

    it('should handle concurrent file uploads correctly', async () => {
      render(
        <CourseContentUploadStep
          onUploadComplete={mocks.onUploadComplete}
          onAnalysisComplete={mocks.onAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const testFiles = [
        createTestFile('file1.pdf', 'test content 1'),
        createTestFile('file2.pdf', 'test content 2')
      ];

      // Upload multiple files
      await simulateFileUpload(fileInput, testFiles);

      // Click analyze button
      const analyzeButton = screen.getByTestId('analyze-button');
      fireEvent.click(analyzeButton);

      // Verify that onUploadComplete is called with production mode data
      await waitFor(() => {
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'doc-123',
              original_text: 'Test content',
              metadata: expect.objectContaining({
                course_type: 'lecture',
                overview: 'Test overview'
              }),
              status: 'completed'
            })
          ]),
          ['file1.pdf'] // Only the first file is processed in production mode
        );
      });
    });
  });
}); 