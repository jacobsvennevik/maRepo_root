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

// Mock the mock data service
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

describe('SyllabusUploadStep Simple', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();
  const mockOnResetUploadState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upload interface correctly', () => {
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

    // Verify the upload interface is present
    expect(screen.getByText(/upload your course materials/i)).toBeInTheDocument();
    expect(screen.getByText(/browse for course materials/i)).toBeInTheDocument();
    
    // Verify the skip button is present
    expect(screen.getByTestId('skip-button')).toBeInTheDocument();
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
    const fileInput = screen.getByTestId('file-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the analyze button to appear
    await waitFor(() => {
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
    });
  });

  it('should handle upload completion state correctly', () => {
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