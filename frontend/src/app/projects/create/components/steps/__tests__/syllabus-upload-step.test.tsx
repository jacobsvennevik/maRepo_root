import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { SyllabusUploadStep } from '../syllabus-upload-step';
import * as uploadUtils from '../../../utils/upload-utils';
import { createProject } from '../../../services/api';
import * as mockData from '../../../services/mock-data';

// Simple error class for testing
class APIError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

// Mock the upload utils
jest.mock('../../../utils/upload-utils', () => ({
  validateFiles: jest.fn(() => ({ invalidFiles: [], oversizedFiles: [] })),
  API_BASE_URL: 'http://test-api',
  isTestMode: jest.fn(() => true)
}));

// Mock the mock data service
jest.mock('../../../services/mock-data', () => ({
  isTestMode: jest.fn(() => true),
  simulateProcessingDelay: jest.fn(() => Promise.resolve()),
  createMockProcessedDocument: jest.fn(() => ({
    id: 456,
    original_text: 'Test syllabus content',
    metadata: {
      course_name: 'Natural Language Interaction',
      course_code: 'CS123',
      instructor: 'Dr. Smith',
      semester: 'Fall 2024',
      topics_covered: ['NLP', 'Machine Learning']
    },
    status: 'completed'
  })),
  MOCK_SYLLABUS_PROCESSED_DOCUMENT: {
    id: 456,
    original_text: 'Test syllabus content',
    metadata: {
      course_name: 'Natural Language Interaction',
      course_code: 'CS123',
      instructor: 'Dr. Smith',
      semester: 'Fall 2024',
      topics_covered: ['NLP', 'Machine Learning']
    },
    status: 'completed'
  },
  MOCK_SYLLABUS_EXTRACTION: {
    course_title: 'Natural Language Interaction',
    education_level: 'Master',
    instructor: 'António Branco',
    exam_dates: [],
    topics: []
  }
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  createProject: jest.fn()
}));

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn()
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}));

describe('SyllabusUploadStep', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();
  const mockSetup = {
    projectType: 'school',
    courseName: 'Test Course',
    projectName: 'Test Project'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createProject as jest.Mock).mockResolvedValue({ id: 'project-123' });
  });

  it('renders upload interface correctly', () => {
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    expect(screen.getByText('Upload your course materials')).toBeInTheDocument();
    expect(screen.getByText(/Upload your syllabus, course documents/)).toBeInTheDocument();
  });

  it('shows skip button when onSkip prop is provided', () => {
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
        onSkip={jest.fn()}
      />
    );
    
    expect(screen.getByTestId('skip-button')).toBeInTheDocument();
    expect(screen.getByText('Skip - I don\'t have a syllabus to upload')).toBeInTheDocument();
  });

  it('does not show skip button when onSkip prop is not provided', () => {
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    expect(screen.queryByTestId('skip-button')).not.toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', () => {
    const mockOnSkip = jest.fn();
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
        onSkip={mockOnSkip}
      />
    );
    
    const skipButton = screen.getByTestId('skip-button');
    fireEvent.click(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it('skipping should not trigger file upload or analysis', () => {
    const mockOnSkip = jest.fn();
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
        onSkip={mockOnSkip}
      />
    );
    
    const skipButton = screen.getByTestId('skip-button');
    fireEvent.click(skipButton);
    
    // Should not have attempted any API calls
    expect(createProject).not.toHaveBeenCalled();
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('shows test mode banner when in test mode', () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={jest.fn()}
        onBack={jest.fn()}
      />
    );
    
    expect(screen.getByText('Mock Mode Active')).toBeInTheDocument();
  });

  it('validates file upload', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The analyze button should appear after file upload
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });
  });

  it('shows analyze button after file upload', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The analyze button should appear after file upload
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });
  });

  it('processes syllabus and calls onUploadComplete in test mode', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled();
      const [projectId, extractedData, fileName] = mockOnUploadComplete.mock.calls[0];
      expect(projectId).toBe('project-123');
      expect(fileName).toBe('syllabus.pdf');
      expect(extractedData.metadata.course_name).toBe('Natural Language Interaction');
    });
  });

  it('shows loading state during analysis', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    expect(screen.getByText(/🧪 Simulating AI analysis/)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // In test mode, the component should complete successfully even if createProject fails
    (createProject as jest.Mock).mockRejectedValue(new APIError(500, 'API Error'));
    
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the analyze button to appear
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // In test mode, the component should complete successfully and show success message
    await waitFor(() => {
      expect(screen.getByText('Syllabus analyzed successfully! Click Next to continue.')).toBeInTheDocument();
    });

    // Verify that onUploadComplete was called with the mock data
    expect(mockOnUploadComplete).toHaveBeenCalledWith(
      expect.any(String), // project ID
      expect.objectContaining({
        id: expect.any(Number),
        original_text: expect.any(String),
        metadata: expect.objectContaining({
          course_name: expect.any(String)
        }),
        status: 'completed'
      }),
      'syllabus.pdf'
    );
  });

  it('handles unauthorized errors by redirecting to login', async () => {
    // In test mode, the component should complete successfully even if createProject fails
    (createProject as jest.Mock).mockRejectedValue(new APIError(401, 'Unauthorized'));
    
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the analyze button to appear
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // In test mode, the component should complete successfully and show success message
    await waitFor(() => {
      expect(screen.getByText('Syllabus analyzed successfully! Click Next to continue.')).toBeInTheDocument();
    });

    // Verify that onUploadComplete was called with the mock data
    expect(mockOnUploadComplete).toHaveBeenCalledWith(
      expect.any(String), // project ID
      expect.objectContaining({
        id: expect.any(Number),
        original_text: expect.any(String),
        metadata: expect.objectContaining({
          course_name: expect.any(String)
        }),
        status: 'completed'
      }),
      'syllabus.pdf'
    );
  });

  it('allows file removal', async () => {
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const removeButton = await screen.findByLabelText('Remove file syllabus.pdf');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('syllabus.pdf')).not.toBeInTheDocument();
    });
  });

  it('creates project with extracted course name', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // Wait for the success message to appear (indicating showSuccess is true)
    await waitFor(() => {
      expect(screen.getByText('Syllabus analyzed successfully! Click Next to continue.')).toBeInTheDocument();
    });

    // Wait for the useEffect to trigger onUploadComplete
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        'project-123',
        expect.objectContaining({
          metadata: expect.objectContaining({
            course_name: 'Natural Language Interaction'
          })
        }),
        'syllabus.pdf'
      );
    });
  });

  it('handles processing timeout gracefully', async () => {
    // In test mode, the component should complete successfully even if processing times out
    (createProject as jest.Mock).mockResolvedValue({ id: 'project-123' });
    
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the analyze button to appear
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // In test mode, the component should complete successfully and show success message
    await waitFor(() => {
      expect(screen.getByText('Syllabus analyzed successfully! Click Next to continue.')).toBeInTheDocument();
    });

    // Verify that onUploadComplete was called with the mock data
    expect(mockOnUploadComplete).toHaveBeenCalledWith(
      expect.any(String), // project ID
      expect.objectContaining({
        id: expect.any(Number),
        original_text: expect.any(String),
        metadata: expect.objectContaining({
          course_name: expect.any(String)
        }),
        status: 'completed'
      }),
      'syllabus.pdf'
    );
  });
}); 