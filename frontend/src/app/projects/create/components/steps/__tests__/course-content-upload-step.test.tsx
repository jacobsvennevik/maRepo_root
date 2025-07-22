import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseContentUploadStep } from '../course-content-upload-step';
import * as uploadUtils from '../../../utils/upload-utils';
import * as mockData from '../../../services/mock-data';

// Mock the upload utils
jest.mock('../../../utils/upload-utils', () => ({
  validateFiles: jest.fn(() => ({ invalidFiles: [], oversizedFiles: [] })),
  API_BASE_URL: 'http://test-api'
}));

// Mock the mock data service
jest.mock('../../../services/mock-data', () => ({
  isTestMode: jest.fn(() => true),
  simulateProcessingDelay: jest.fn(() => Promise.resolve()),
  MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT: {
    id: 456,
    original_text: "Comprehensive NLP course materials covering vector representations, CNNs, RNNs, attention mechanisms, transformers, and modern language modeling approaches.",
    metadata: {
      course_type: "STEM",
      overview: "The materials progress from classical distributional semantics toward modern transformer‑based language models. Each topic builds conceptually: vector embeddings and simple aggregation give way to CNNs, RNNs and attention; training and optimisation principles underpin language‑modelling objectives, which culminate in large‑scale pre‑training, transfer learning and contemporary transformer families."
    },
    status: 'completed'
  }
}));

describe('CourseContentUploadStep', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnAnalysisComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload interface correctly', () => {
    render(<CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />);
    
    expect(screen.getByText(/Upload your course materials/)).toBeInTheDocument();
    expect(screen.getByText(/Upload slides, handouts, or excerpts/)).toBeInTheDocument();
    expect(screen.getByText(/Max size: 25 MB/)).toBeInTheDocument();
  });

  it('shows test mode banner when in test mode', () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    render(<CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />);
    
    expect(screen.getByText(/Mock Mode Active/)).toBeInTheDocument();
    expect(screen.getByText(/Using mock course content analysis/)).toBeInTheDocument();
  });

  it('validates file types on upload', async () => {
    (uploadUtils.validateFiles as jest.Mock).mockReturnValue({
      invalidFiles: ['test.jpg'],
      oversizedFiles: []
    });

    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
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
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
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
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeButton = await screen.findByTestId('analyze-button', { timeout: 10000 });
    expect(analyzeButton).toBeInTheDocument();
    expect(analyzeButton).toHaveTextContent('🔍 Analyze 1 File');
  }, 15000);

  it('processes files and calls onUploadComplete in test mode', async () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
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
            id: 456,
            original_text: expect.stringContaining('Comprehensive NLP course materials'),
            metadata: expect.objectContaining({
              course_type: 'STEM',
              overview: expect.stringContaining('materials progress from classical distributional semantics')
            }),
            status: 'completed'
          })
        ]),
        ['test.pdf']
      );
    }, { timeout: 2000 });
  });

  it('shows loading state during analysis', async () => {
    (mockData.isTestMode as jest.Mock).mockReturnValue(true);
    
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
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
      expect(screen.getByText(/🧪 Simulating AI analysis of 1 files/)).toBeInTheDocument();
    });
  });

  it('allows file removal', async () => {
    const { getByTestId } = render(
      <CourseContentUploadStep onUploadComplete={mockOnUploadComplete} onAnalysisComplete={mockOnAnalysisComplete} />
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