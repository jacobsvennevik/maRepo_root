import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagnosticDashboard from '../DiagnosticDashboard';

// Mock axios API used by the dashboard
jest.mock('@/lib/axios-api', () => ({
  axiosApi: {
    get: jest.fn().mockResolvedValue({ data: { results: [] } }),
    post: jest.fn().mockResolvedValue({ data: { id: 'new-session-123', topic: 'New Topic', status: 'DRAFT', delivery_mode: 'DEFERRED_FEEDBACK', max_questions: 3, created_at: '2024-01-01T00:00:00Z' } }),
  },
}));
const { axiosApi } = jest.requireMock('@/lib/axios-api');

describe('DiagnosticDashboard', () => {
  const mockProjectId = 'test-project-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with correct title and description', () => {
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    expect(screen.getByText('Pre-Lecture Diagnostics')).toBeInTheDocument();
    expect(screen.getByText(/Assess student readiness and identify knowledge gaps/)).toBeInTheDocument();
  });

  it('shows create diagnostic button', () => {
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    expect(screen.getByText('Create Diagnostic')).toBeInTheDocument();
  });

  it('opens create diagnostic dialog when button is clicked', () => {
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    const createButton = screen.getByText('Create Diagnostic');
    fireEvent.click(createButton);
    
    expect(screen.getByText('Create New Diagnostic')).toBeInTheDocument();
    expect(screen.getByText(/Generate a pre-lecture diagnostic/)).toBeInTheDocument();
  });

  it('displays form fields in create dialog', () => {
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    const createButton = screen.getByText('Create Diagnostic');
    fireEvent.click(createButton);
    
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Feedback Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Questions')).toBeInTheDocument();
  });

  it('shows tabs for different session states', () => {
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    expect(screen.getByText('All Sessions')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('shows empty state when no sessions exist', () => {
    (axiosApi.get as jest.Mock).mockResolvedValueOnce({ data: { results: [] } });

    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    expect(screen.getByText('No diagnostic sessions yet')).toBeInTheDocument();
    expect(screen.getByText(/Create your first diagnostic to start assessing student readiness/)).toBeInTheDocument();
  });

  it('fetches diagnostic sessions on mount', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        topic: 'Thermodynamics Fundamentals',
        status: 'DRAFT',
        delivery_mode: 'DEFERRED_FEEDBACK',
        max_questions: 3,
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    (axiosApi.get as jest.Mock).mockResolvedValueOnce({ data: { results: mockSessions } });

    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Thermodynamics Fundamentals')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (axiosApi.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    // Should still render the component even if fetch fails
    expect(screen.getByText('Pre-Lecture Diagnostics')).toBeInTheDocument();
  });

  it('creates new diagnostic when form is submitted', async () => {
    const mockNewSession = {
      id: 'new-session-123',
      topic: 'New Topic',
      status: 'DRAFT',
      delivery_mode: 'DEFERRED_FEEDBACK',
      max_questions: 3,
      created_at: '2024-01-01T00:00:00Z',
    };

    (axiosApi.get as jest.Mock).mockResolvedValueOnce({ data: { results: [] } });
    (axiosApi.post as jest.Mock).mockResolvedValueOnce({ data: mockNewSession });

    render(<DiagnosticDashboard projectId={mockProjectId} />);
    
    // Open create dialog
    const createButton = screen.getByText('Create Diagnostic');
    fireEvent.click(createButton);
    
    // Fill form
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'New Topic' } });
    
    // Submit form
    const submitButton = screen.getByText('Create Diagnostic');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axiosApi.post).toHaveBeenCalled();
    });
  });
});
