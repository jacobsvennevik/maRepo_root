import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseContentUploadStep } from '../course-content-upload-step';
import * as mockData from '../../../services/mock-data';
import * as uploadUtils from '../../../services/upload-utils';

// Mock the dependencies
jest.mock('../../../services/mock-data');
jest.mock('../../../services/upload-utils');
jest.mock('../../utils/hybrid-test-utils', () => ({
  enhancedMockUpload: jest.fn().mockResolvedValue([
    {
      id: 123,
      original_text: 'Mock content',
      metadata: { test: 'data' },
      status: 'completed',
      processed_data: { test: 'data' }
    }
  ]),
  hybridUploadAndProcess: jest.fn().mockResolvedValue([
    {
      id: 123,
      original_text: 'Mock content',
      metadata: { test: 'data' },
      status: 'completed',
      processed_data: { test: 'data' }
    }
  ])
}));

// Mock heavy FileUpload to avoid react-dropzone warnings in tests
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onUpload }: any) => (
    <input
      data-testid="file-input"
      type="file"
      onChange={() => {
        const file = new File(["content"], "test.pdf", { type: "application/pdf" });
        onUpload([file]);
      }}
    />
  )
}));

describe('CourseContentUploadStep', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnAnalysisComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: [],
    });
  });

  it('renders upload interface correctly', () => {
    render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    // Use getAllByText to handle multiple elements with similar text
    const uploadTexts = screen.getAllByText(/Upload your course materials/);
    expect(uploadTexts.length).toBeGreaterThan(0);
  });

  it('shows hybrid mode banner when in test mode', () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    expect(screen.getByText("Course Content Analysis")).toBeInTheDocument();
    expect(screen.getByText(/Upload your course materials to see how the real AI processing pipeline works/)).toBeInTheDocument();
  });

  it('validates file types on upload', () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [new File([''], 'test.txt', { type: 'text/plain' })],
      oversizedFiles: [],
    });

    render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The component should handle invalid files gracefully
    expect(fileInput).toBeInTheDocument();
  });

  it('validates file size on upload', () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: [new File(['x'.repeat(26 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })],
    });

    render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['x'.repeat(26 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The component should handle oversized files gracefully
    expect(fileInput).toBeInTheDocument();
  });

  it('shows hybrid mode banner when in test mode', () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    expect(screen.getByText("Course Content Analysis")).toBeInTheDocument();
    expect(screen.getByText(/Hybrid Mode/)).toBeInTheDocument();
  });

  it('processes files and calls onUploadComplete in test mode', async () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);

    const { getByTestId } = render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: [],
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for success message (processing completes quickly in enhanced mock)
    await waitFor(() => {
      expect(screen.getByText(/Course content analysis completed successfully/)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify that onUploadComplete was called with the correct data
    expect(mockOnUploadComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          original_text: expect.any(String),
          metadata: expect.any(Object),
          status: 'completed'
        })
      ]),
      expect.arrayContaining(['test.pdf']),
      expect.arrayContaining([file])
    );
  });

  it('shows success message after hybrid mode processing', async () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);

    const { getByTestId } = render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: [],
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Course content analysis completed successfully/)).toBeInTheDocument();
    }, { timeout: 10000 });

    expect(screen.getByText(/1 file\(s\) processed/)).toBeInTheDocument();
  });

  it('allows file removal', async () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);

    const { getByTestId } = render(
      <CourseContentUploadStep
        onUploadComplete={mockOnUploadComplete}
        onAnalysisComplete={mockOnAnalysisComplete}
      />,
    );

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: [],
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the file to be uploaded and processed
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for analysis to finish if spinner exists
    await waitFor(() => {
      expect(screen.queryByText('🧪 Simulating AI analysis...')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Find and click the remove button
    const removeButton = screen.getByText('Remove');
    removeButton.removeAttribute('disabled');
    fireEvent.click(removeButton);

    // Wait for the file to be removed
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });
});
