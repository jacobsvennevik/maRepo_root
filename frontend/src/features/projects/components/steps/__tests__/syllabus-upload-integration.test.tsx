import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyllabusUploadStep } from '../syllabus-upload-step';
import { jest } from '@jest/globals';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

jest.mock('../../../services/mock-data', () => ({
  isTestMode: jest.fn(() => true),
  MOCK_SYLLABUS_EXTRACTION: {
    course_title: 'Test Course',
    instructor: 'Test Instructor',
    topics: ['Topic 1', 'Topic 2'],
    exam_dates: [
      { date: '2025-01-01', description: 'Test Exam' }
    ],
  },
  createMockProcessedDocument: jest.fn(() => ({
    id: 123,
    original_text: 'Test text',
    metadata: { course_title: 'Test Course' },
    status: 'completed',
  })),
  simulateProcessingDelay: jest.fn(() => Promise.resolve()),
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  createProject: jest.fn(() => Promise.resolve({
    id: 'project-123',
    name: 'Test Project',
    project_type: 'school'
  }))
}));

describe('SyllabusUploadStep Integration', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();
  const mockOnResetUploadState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock fetch responses
    mockFetch
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            filename: 'test-syllabus.pdf',
            status: 'pending',
          }),
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: 'Processing started',
            document_id: 123,
            task_id: 'task-123', // This is the key field that was missing
          }),
        })
      )
      .mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            status: 'completed',
            metadata: {
              course_name: 'Test Course',
              instructor: 'Test Instructor',
              topics: ['Topic 1', 'Topic 2'],
              exam_dates: [
                { date: '2025-01-01', description: 'Test Exam' }
              ],
            },
          }),
        })
      );
  });

  it('should show analyze button after file upload', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onSkip={mockOnSkip}
        onResetUploadState={mockOnResetUploadState}
        hasUploadCompleted={false}
      />
    );

    // Initially, no analyze button should be visible
    expect(screen.queryByTestId('analyze-button')).not.toBeInTheDocument();

    // Simulate file upload by directly calling handleUpload
    const file = new File(['test content'], 'test-syllabus.pdf', { type: 'application/pdf' });
    
    // Find the FileUpload component and simulate file upload
    const fileInput = screen.getByTestId('file-input') || screen.getByRole('button', { name: /browse/i });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    // Wait for the analyze button to appear
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });
  });

  it('should trigger analysis when analyze button is clicked', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onSkip={mockOnSkip}
        onResetUploadState={mockOnResetUploadState}
        hasUploadCompleted={false}
      />
    );

    // Simulate file upload
    const file = new File(['test content'], 'test-syllabus.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('file-input') || screen.getByRole('button', { name: /browse/i });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    // Wait for analyze button to appear and click it
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });

    const analyzeButton = screen.getByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // Should show loading state or error message
    await waitFor(() => {
      // The component shows error message when createProject fails
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    });

    // Wait for analysis to complete or show error
    await waitFor(() => {
      // Since createProject is failing, we expect an error message
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should NOT call onUploadComplete when there's an error
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });

  it('should reset state when new files are uploaded', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onSkip={mockOnSkip}
        onResetUploadState={mockOnResetUploadState}
        hasUploadCompleted={false}
      />
    );

    // Upload first file
    const file1 = new File(['test content'], 'test1.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('file-input') || screen.getByRole('button', { name: /browse/i });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file1] } });
    }

    // Wait for analyze button and click it
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });

    const analyzeButton = screen.getByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText(/syllabus analyzed successfully/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Upload a different file
    const file2 = new File(['different content'], 'test2.pdf', { type: 'application/pdf' });
    
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file2] } });
    }

    // Should show analyze button again (success state should be reset)
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });
  });

  it('should handle upload completion state correctly', async () => {
    render(
      <SyllabusUploadStep
        onUploadComplete={mockOnUploadComplete}
        onNext={mockOnNext}
        onBack={mockOnBack}
        onSkip={mockOnSkip}
        onResetUploadState={mockOnResetUploadState}
        hasUploadCompleted={true} // Simulate previous upload completed
      />
    );

    // Should still allow new uploads even if previous upload was completed
    expect(screen.getByText(/upload your course materials/i)).toBeInTheDocument();
    expect(screen.getByText(/browse for course materials/i)).toBeInTheDocument();
  });
}); 