import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { SyllabusUploadStep } from '../syllabus-upload-step';
import * as uploadUtils from '../../../utils/upload-utils';
import { createProject } from '../../../services/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  createProject: jest.fn()
}));

// Mock the upload utils
jest.mock('../../../utils/upload-utils', () => ({
  isTestMode: jest.fn(() => true),
  validateFiles: jest.fn(() => ({ invalidFiles: [], oversizedFiles: [] })),
  API_BASE_URL: 'http://test-api'
}));

describe('SyllabusUploadStep', () => {
  const mockOnUploadComplete = jest.fn();
  const mockRouter = { push: jest.fn() };
  const mockSetup = {
    projectType: 'school',
    courseName: 'Test Course',
    projectName: 'Test Project'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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

  it('shows test mode banner when in test mode', () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(true);
    render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    expect(screen.getByText('Test Mode Active')).toBeInTheDocument();
  });

  it('validates file upload', async () => {
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-upload');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('analyze-button')).toBeInTheDocument();
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
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled();
      const [projectId, extractedData, fileName] = mockOnUploadComplete.mock.calls[0];
      expect(projectId).toBe('project-123');
      expect(fileName).toBe('syllabus.pdf');
      expect(extractedData.metadata.course_title).toBe('Computer Science 101');
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
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    expect(screen.getByText(/Simulating AI analysis/)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(false);
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
    
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  it('handles unauthorized errors by redirecting to login', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(false);
    global.fetch = jest.fn().mockRejectedValue({ statusCode: 401, message: 'Unauthorized' });
    
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('allows file removal', async () => {
    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const removeButton = await screen.findByLabelText('Remove file');
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
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        name: 'Computer Science 101',
        project_type: 'school',
        course_name: 'Computer Science 101',
        is_draft: true
      });
    });
  });

  it('handles processing timeout gracefully', async () => {
    (uploadUtils.isTestMode as jest.Mock).mockReturnValue(false);
    
    // Mock successful upload but timeout during processing
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/documents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 123, status: 'pending' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'pending' })
      });
    });

    const { getByTestId } = render(
      <SyllabusUploadStep
        setup={mockSetup}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(['test content'], 'syllabus.pdf', { type: 'application/pdf' });
    const fileInput = getByTestId('file-upload');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    const analyzeButton = await screen.findByTestId('analyze-button');
    fireEvent.click(analyzeButton);

    // Should still complete with mock data after timeout
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled();
      const [projectId, extractedData] = mockOnUploadComplete.mock.calls[0];
      expect(projectId).toBe('project-123');
      expect(extractedData.metadata.course_name).toBe('Advanced Physics');
    });
  });
}); 