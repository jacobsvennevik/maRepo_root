import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SyllabusUploadStep } from '../syllabus-upload';
import fetchMock from 'jest-fetch-mock';

describe('SyllabusUploadStep', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the initial state correctly', () => {
    render(<SyllabusUploadStep onComplete={jest.fn()} />);
    expect(screen.getByText('Upload Your Syllabus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
  });

  it('enables upload button when a file is selected', () => {
    render(<SyllabusUploadStep onComplete={jest.fn()} />);
    const fileInput = screen.getByLabelText(/syllabus upload/i);
    const file = new File(['dummy content'], 'syllabus.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByRole('button', { name: /upload/i })).toBeEnabled();
  });

  it('shows uploading and processing states and calls onComplete on success', async () => {
    jest.useFakeTimers();
    const mockOnComplete = jest.fn();
    const mockDocument = { id: 1, file: 'syllabus.pdf', original_text: 'text', metadata: {}, status: 'pending' };
    const completedDocument = { ...mockDocument, status: 'completed' };

    fetchMock.mockResponses(
      JSON.stringify(mockDocument), // Initial Upload
      { status: 202 }, // Process start
      JSON.stringify(completedDocument) // Polling result
    );

    render(<SyllabusUploadStep onComplete={mockOnComplete} />);

    // Select a file
    const fileInput = screen.getByLabelText(/syllabus upload/i);
    const file = new File(['(⌐□_□)'], 'syllabus.pdf', { type: 'application/pdf' });
    
    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    
    // Click upload and handle initial state changes
    await act(async () => {
        fireEvent.click(uploadButton);
    });

    // The component state changes rapidly from 'uploading' to 'processing'.
    // We'll just wait for the 'processing' text to appear.
    await screen.findByText(/analyzing syllabus/i);

    // Now advance timers to trigger the poll
    await act(async () => {
        jest.advanceTimersByTime(5000);
    });
    
    // Wait for the final success state
    await waitFor(() => {
      expect(screen.getByText(/syllabus processed successfully/i)).toBeInTheDocument();
    });

    expect(mockOnComplete).toHaveBeenCalledWith(completedDocument);
    expect(screen.getByText(/Extracted Information/i)).toBeInTheDocument();
  });

  it('shows an error message if upload fails', async () => {
    fetchMock.mockReject(new Error('Upload failed'));

    render(<SyllabusUploadStep onComplete={jest.fn()} />);
    const fileInput = screen.getByLabelText(/syllabus upload/i);
    const file = new File(['...'], 'syllabus.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    });
    
    expect(await screen.findByText('Upload failed')).toBeInTheDocument();
  });
}); 