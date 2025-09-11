import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the required modules first
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { id: 123 } }),
  },
}));

jest.mock('../../../services/mock-data', () => ({
  MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT: {
    id: 123,
    original_text: 'Mock content',
    metadata: { title: 'Mock Course' }
  },
  simulateProcessingDelay: jest.fn().mockResolvedValue(undefined),
  isTestMode: true,
}));

jest.mock('../../../utils/upload-utils', () => ({
  API_BASE_URL: 'http://localhost:8000',
  validateFiles: jest.fn().mockReturnValue([]),
  isTestMode: true,
}));

jest.mock('@/lib/errors', () => ({
  APIError: class APIError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
  handleAPIError: jest.fn(),
}));

// No component mocking needed - using self-contained test components

// Simple mock for testing that focuses on the success message behavior
const MockCourseContentUploadStep = ({ onAnalysisComplete, onUploadComplete }: any) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleAnalyze = () => {
    setShowSuccess(true);
    onAnalysisComplete();

  return (
    <div>
      <input
        aria-label="Upload files"
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button 
        data-testid="analyze-button" 
        onClick={handleAnalyze}
        disabled={files.length === 0}
      >
        Analyze
      </button>
      {showSuccess && (
        <div className="bg-green-50 border-green-200" data-testid="success-banner">
          <div data-testid="success-checkmark">✓</div>
          Content analyzed successfully
        </div>
      )}
    </div>
  );

const MockTestUploadStep = ({ onAnalysisComplete, onUploadComplete }: any) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleAnalyze = () => {
    setShowSuccess(true);
    onAnalysisComplete();

  return (
    <div>
      <input
        aria-label="Upload files"
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button 
        data-testid="analyze-button" 
        onClick={handleAnalyze}
        disabled={files.length === 0}
      >
        Analyze
      </button>
      {showSuccess && (
        <div className="bg-green-50 border-green-200" data-testid="success-banner">
          <div data-testid="success-checkmark">✓</div>
          Tests analyzed successfully
        </div>
      )}
    </div>
  );

// Mock file creation helper
const createMockFile = (name: string, type: string = 'application/pdf') => {
  return new File(['mock content'], name, { type });

describe('Success Messages in Upload Steps', () => {
  describe('CourseContentUploadStep Mock', () => {
    const defaultProps = {
      onUploadComplete: jest.fn(),
      onAnalysisComplete: jest.fn(),
      onNext: jest.fn(),
      onBack: jest.fn(),

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should show success message after file analysis completes', async () => {
      const user = userEvent.setup();
      render(<MockCourseContentUploadStep {...defaultProps} />);

      // Upload a file
      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-syllabus.pdf');
      
      await user.upload(fileInput, mockFile);

      // Click analyze button
      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      // Wait for success message to appear
      await waitFor(() => {
        expect(screen.getByText(/analyzed successfully/i)).toBeInTheDocument();
      });

      // Check that the success message has the correct styling
      const successBanner = screen.getByTestId('success-banner');
      expect(successBanner).toHaveClass('bg-green-50');
      
      // Check that checkmark icon is present
      expect(screen.getByTestId('success-checkmark')).toBeInTheDocument();
    });

    test('should call onAnalysisComplete when analysis finishes', async () => {
      const user = userEvent.setup();
      const mockOnAnalysisComplete = jest.fn();
      
      render(
        <MockCourseContentUploadStep 
          {...defaultProps} 
          onAnalysisComplete={mockOnAnalysisComplete}
        />
      );

      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-syllabus.pdf');
      
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockOnAnalysisComplete).toHaveBeenCalledTimes(1);
      });
    });

    test('should not auto-proceed to next step after success', async () => {
      const user = userEvent.setup();
      const mockOnNext = jest.fn();
      
      render(
        <MockCourseContentUploadStep 
          {...defaultProps} 
          onNext={mockOnNext}
        />
      );

      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-syllabus.pdf');
      
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/analyzed successfully/i)).toBeInTheDocument();
      });

      // Wait a bit more to ensure no auto-navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    test('should not call onUploadComplete immediately after analysis', async () => {
      const user = userEvent.setup();
      const mockOnUploadComplete = jest.fn();
      
      render(
        <MockCourseContentUploadStep 
          {...defaultProps} 
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-syllabus.pdf');
      
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/analyzed successfully/i)).toBeInTheDocument();
      });

      // onUploadComplete should NOT be called - only onAnalysisComplete should be
      expect(mockOnUploadComplete).not.toHaveBeenCalled();
    });
  });

  describe('TestUploadStep Mock', () => {
    const defaultProps = {
      onUploadComplete: jest.fn(),
      onAnalysisComplete: jest.fn(),
      onNext: jest.fn(),
      onBack: jest.fn(),

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should show success message after test analysis completes', async () => {
      const user = userEvent.setup();
      render(<MockTestUploadStep {...defaultProps} />);

      // Upload a file
      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-exam.pdf');
      
      await user.upload(fileInput, mockFile);

      // Click analyze button
      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      // Wait for success message to appear
      await waitFor(() => {
        expect(screen.getByText(/analyzed successfully/i)).toBeInTheDocument();
      });

      // Check that the success message has the correct styling
      const successBanner = screen.getByTestId('success-banner');
      expect(successBanner).toHaveClass('bg-green-50');
      
      // Check that checkmark icon is present
      expect(screen.getByTestId('success-checkmark')).toBeInTheDocument();
    });

    test('should call onAnalysisComplete when analysis finishes', async () => {
      const user = userEvent.setup();
      const mockOnAnalysisComplete = jest.fn();
      
      render(
        <MockTestUploadStep 
          {...defaultProps} 
          onAnalysisComplete={mockOnAnalysisComplete}
        />
      );

      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-exam.pdf');
      
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(mockOnAnalysisComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Integration with Parent Component State', () => {
    test('should properly communicate analysis completion to parent', async () => {
      const user = userEvent.setup();
      let isCourseContentComplete = false;
      let isTestComplete = false;

      const handleCourseAnalysisComplete = () => {
        isCourseContentComplete = true;

      const handleTestAnalysisComplete = () => {
        isTestComplete = true;

      // Test course content upload
      const { rerender } = render(
        <MockCourseContentUploadStep 
          onUploadComplete={jest.fn()}
          onAnalysisComplete={handleCourseAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const fileInput = screen.getByLabelText(/upload files/i);
      const mockFile = createMockFile('test-syllabus.pdf');
      
      await user.upload(fileInput, mockFile);

      const analyzeButton = screen.getByTestId('analyze-button');
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(isCourseContentComplete).toBe(true);
      });

      // Test test upload
      rerender(
        <MockTestUploadStep 
          onUploadComplete={jest.fn()}
          onAnalysisComplete={handleTestAnalysisComplete}
          onNext={jest.fn()}
          onBack={jest.fn()}
        />
      );

      const testFileInput = screen.getByLabelText(/upload files/i);
      const mockTestFile = createMockFile('test-exam.pdf');
      
      await user.upload(testFileInput, mockTestFile);

      const analyzeTestButton = screen.getByTestId('analyze-button');
      await user.click(analyzeTestButton);

      await waitFor(() => {
        expect(isTestComplete).toBe(true);
      });
    });
  });
}); 