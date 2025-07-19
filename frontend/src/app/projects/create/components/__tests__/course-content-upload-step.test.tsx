import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseContentUploadStep } from '../steps/course-content-upload-step';
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
  createFileUploadMock,
  createNavigationMock,
  createUploadTestSetup
} from '../../../../../test-utils/upload-test-helpers';

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
  FileUpload: ({ onUpload, onRemove, files, uploadProgress, title, description }: any) => (
    <div data-testid="file-upload">
      <h3>{title}</h3>
      <p>{description}</p>
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
        {files.map((file: File) => (
          <div key={file.name} data-testid={`file-item-${file.name}`}>
            <span data-testid={`filename-${file.name}`}>{file.name}</span>
            <button data-testid={`remove-${file.name}`} onClick={() => onRemove(file)}>Remove</button>
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
const { mocks, createBeforeEach, createAfterEach } = createUploadTestSetup();
const localStorageMock = createLocalStorageMock();
const mockFetch = createMockFetch();

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

  afterEach(createAfterEach());

  describe('Test Mode', () => {
    beforeEach(createBeforeEach(true));

    it('should handle file upload and mock processing in test mode', async () => {
      render(
        <CourseContentUploadStep
          onUploadComplete={mocks.onUploadComplete}
          onAnalysisComplete={jest.fn()}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      // Verify test mode banner is shown
      const banner = screen.getByTestId('test-mode-banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent(/Test Mode Active/i);

      // Upload test file
      const fileInput = screen.getByTestId('file-input');
      const testFile = createTestFile('lecture.pdf', 'test content');
      await simulateFileUpload(fileInput, [testFile]);

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 1 file/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Verify mock data is used
      await waitFor(() => {
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              original_text: expect.stringContaining('Mock excerpt from lecture.pdf'),
              metadata: expect.objectContaining({
                source_file: 'lecture.pdf',
                page_count: 10
              }),
              status: 'completed'
            })
          ]),
          ['lecture.pdf']
        );
      });
    });

    it('should handle multiple file uploads in test mode', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
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

      // Verify mock data for both files
      await waitFor(() => {
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              metadata: expect.objectContaining({ source_file: 'lecture1.pdf' })
            }),
            expect.objectContaining({
              metadata: expect.objectContaining({ source_file: 'lecture2.pdf' })
            })
          ]),
          ['lecture1.pdf', 'lecture2.pdf']
        );
      });
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
    beforeEach(createBeforeEach(false));

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
      expect(screen.queryByTestId('test-mode-banner')).not.toBeInTheDocument();

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
      await waitFor(() => {
        expect(uploadFileWithProgress).toHaveBeenCalledWith(
          expect.any(File),
          expect.any(Function)
        );
      });

      // Wait for the callback to be called
      await waitFor(() => {
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          [mockResponse],
          ['lecture.pdf']
        );
      });
    });

    it('should handle API failure gracefully', async () => {
      const { uploadFileWithProgress } = require('../../services/api');
      uploadFileWithProgress.mockImplementation(async (file: File, onProgress: (progress: number) => void) => {
        onProgress(0);
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Upload failed');
      });

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

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 1 file/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // Wait for the error message to appear
      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/Upload failed/i);
      });
    });

    it('should handle network timeout gracefully', async () => {
      const { uploadFileWithProgress } = require('../../services/api');
      uploadFileWithProgress.mockImplementation(async () => {
        await new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 100));
      });

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

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 1 file/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

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
      expect(screen.getByTestId('error-message')).toHaveTextContent(/file is too large/i);
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
      expect(screen.getByTestId('error-message')).toHaveTextContent(/file type not supported/i);
    });

    it('should handle mixed valid and invalid files', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload mixed files
      const fileInput = screen.getByTestId('file-input');
      const validFile = createTestFile('valid.pdf', 'test content');
      const invalidFile = createTestFile('invalid.txt', 'test content');
      await simulateFileUpload(fileInput, [validFile, invalidFile]);

      // Should show file type error
      expect(screen.getByTestId('error-message')).toHaveTextContent(/file type not supported/i);

      // Remove invalid file
      const removeButton = screen.getByTestId('remove-invalid.txt');
      fireEvent.click(removeButton);

      // Error should be cleared
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
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
      expect(errorMessage).toHaveTextContent('File type not supported');
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
      expect(errorMessage).toHaveTextContent('File is too large');
    });

    it('should clear error message when files are removed', async () => {
      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload invalid file to trigger error
      const fileInput = screen.getByTestId('file-input');
      const invalidFile = createTestFile('invalid.txt', 'test content');
      await simulateFileUpload(fileInput, [invalidFile]);

      // Verify error is shown
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Remove file
      const removeButton = screen.getByTestId('remove-invalid.txt');
      fireEvent.click(removeButton);

      // Verify error is cleared
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle concurrent file uploads correctly', async () => {
      
      const { uploadFileWithProgress } = require('../../services/api');
      const mockResponses = [
        { id: 1, status: 'completed', metadata: { source_file: 'file1.pdf' } },
        { id: 2, status: 'completed', metadata: { source_file: 'file2.pdf' } }
      ];

      let uploadCount = 0;
      uploadFileWithProgress.mockImplementation(async (file: File, onProgress: (progress: number) => void) => {
        const response = mockResponses[uploadCount++];
        onProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(100);
        return response;
      });

      render(
        <CourseContentUploadStep
          {...defaultProps}
          onUploadComplete={mocks.onUploadComplete}
        />
      );

      // Upload multiple files
      const fileInput = screen.getByTestId('file-input');
      const files = [
        createTestFile('file1.pdf', 'content1'),
        createTestFile('file2.pdf', 'content2')
      ];
      await simulateFileUpload(fileInput, files);

      // Click analyze button
      const analyzeButton = screen.getByRole('button', { name: /analyze 2 files/i });
      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Verify both uploads completed
      await waitFor(() => {
        expect(uploadFileWithProgress).toHaveBeenCalledTimes(2);
        expect(mocks.onUploadComplete).toHaveBeenCalledWith(
          mockResponses,
          ['file1.pdf', 'file2.pdf']
        );
      });
    });
  });
}); 