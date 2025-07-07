import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseContentUploadStep } from '../course-content-upload-step';
import * as uploadUtils from '../../../utils/upload-utils';

// Mock the upload utils
jest.mock('../../../utils/upload-utils', () => ({
  isTestMode: jest.fn(() => true),
  validateFiles: jest.fn(() => ({ invalidFiles: [], oversizedFiles: [] })),
  API_BASE_URL: 'http://test-api'
}));

describe('CourseContentUploadStep', () => {
  const mockOnUploadComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload interface correctly', () => {
    render(<CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByText(/Upload your course materials/)).toBeInTheDocument();
    expect(screen.getByText(/Upload slides, handouts, or excerpts/)).toBeInTheDocument();
    expect(screen.getByText(/Max size: 25 MB/)).toBeInTheDocument();
  });

  it('shows test mode banner when in test mode', () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    render(<CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByTestId('test-mode-banner')).toBeInTheDocument();
    expect(screen.getByText(/Test Mode Active/)).toBeInTheDocument();
  });

  it('validates file types on upload', async () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: ['test.jpg'],
      oversizedFiles: []
    });

    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('test.jpg is not a supported file type');
    });
  });

  it('validates file size on upload', async () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: ['test.pdf']
    });

    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('File is too large. Maximum size is 25MB per file.');
    });
  });

  it('shows analyze button after valid file upload', async () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: []
    });

    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeButton = await screen.findByTestId('analyze-button', { timeout: 10000 });
    expect(analyzeButton).toBeInTheDocument();
    expect(analyzeButton).toHaveTextContent('Analyze 1 file');
  }, 15000);

  it('processes files and calls onUploadComplete in test mode', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: []
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              source_file: 'test.pdf'
            })
          })
        ]),
        ['test.pdf']
      );
    }, { timeout: 2000 });
  });

  it('shows loading state during analysis', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: []
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('allows file removal', async () => {
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: [],
      oversizedFiles: []
    });

    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the file to be added and the UI to update
    const fileElement = await screen.findByText('test.pdf');
    expect(fileElement).toBeInTheDocument();

    // Find and click the remove button
    const removeButton = await screen.findByLabelText('Remove file test.pdf');
    fireEvent.click(removeButton);

    // Wait for the file to be removed
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify analyze button is no longer visible
    await waitFor(() => {
      expect(screen.queryByTestId('analyze-button')).not.toBeInTheDocument();
    });
  });
});