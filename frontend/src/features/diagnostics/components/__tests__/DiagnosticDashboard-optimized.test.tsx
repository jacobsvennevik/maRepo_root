import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagnosticDashboard from '../DiagnosticDashboard';

// Import new centralized utilities
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from '../../../../../src/test-utils';

// Setup test environment
const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeStorage: true,
  includeNavigation: true
});

const { apiMocks } = standardMocks;

describe('DiagnosticDashboard - Optimized', () => {
  const mockProjectId = 'test-project-123';

  beforeEach(() => {
    testEnv.mocks.resetAll();
    
    // Setup default API responses
    apiMocks.setupMockResponses({
      'GET:/backend/api/diagnostics/': {
        ok: true,
        status: 200,
        json: async () => ({ results: [] })
      },
      'POST:/backend/api/diagnostics/': {
        ok: true,
        status: 201,
        json: async () => ({ 
          id: 'new-session-123', 
          topic: 'New Topic', 
          status: 'DRAFT', 
          delivery_mode: 'DEFERRED_FEEDBACK', 
          max_questions: 3, 
          created_at: '2024-01-01T00:00:00Z' 
        })
      }
    });
  });

  describe('Dashboard Rendering', () => {
    it('should render dashboard with correct title and description', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      expect(screen.getByText('Pre-Lecture Diagnostics')).toBeInTheDocument();
      expect(screen.getByText(/Assess student readiness and identify knowledge gaps/)).toBeInTheDocument();
    });

    it('should show create diagnostic button', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      expect(screen.getByText('Create Diagnostic')).toBeInTheDocument();
    });

    it('should display empty state when no diagnostics exist', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      expect(screen.getByText(/No diagnostics created yet/)).toBeInTheDocument();
    });
  });

  describe('Create Diagnostic Dialog', () => {
    it('should open create diagnostic dialog when button is clicked', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      expect(screen.getByText('Create New Diagnostic')).toBeInTheDocument();
      expect(screen.getByText(/Generate a pre-lecture diagnostic/)).toBeInTheDocument();
    });

    it('should display form fields in create dialog', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      expect(screen.getByLabelText(/Topic/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Delivery Mode/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Questions/)).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Create New Diagnostic')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      const submitButton = screen.getByText('Create Diagnostic');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Topic is required/)).toBeInTheDocument();
      });
    });

    it('should accept valid form input', async () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      // Fill in form fields
      const topicInput = screen.getByLabelText(/Topic/);
      fireEvent.change(topicInput, { target: { value: 'Mathematics' } });
      
      const maxQuestionsInput = screen.getByLabelText(/Max Questions/);
      fireEvent.change(maxQuestionsInput, { target: { value: '5' } });
      
      const submitButton = screen.getByText('Create Diagnostic');
      fireEvent.click(submitButton);
      
      // Should create diagnostic
      await waitFor(() => {
        expect(apiMocks.mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/backend/api/diagnostics/'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Mathematics')
          })
        );
      });
    });
  });

  describe('API Integration', () => {
    it('should handle successful diagnostic creation', async () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      // Fill form and submit
      fireEvent.change(screen.getByLabelText(/Topic/), { target: { value: 'Test Topic' } });
      fireEvent.change(screen.getByLabelText(/Max Questions/), { target: { value: '3' } });
      fireEvent.click(screen.getByText('Create Diagnostic'));
      
      // Should show success and close dialog
      await waitFor(() => {
        expect(screen.queryByText('Create New Diagnostic')).not.toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      fireEvent.click(createButton);
      
      // Fill form and submit
      fireEvent.change(screen.getByLabelText(/Topic/), { target: { value: 'Test Topic' } });
      fireEvent.click(screen.getByText('Create Diagnostic'));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to create diagnostic/)).toBeInTheDocument();
      });
    });

    it('should load existing diagnostics on mount', async () => {
      // Mock existing diagnostics
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          results: [
            { id: '1', topic: 'Math', status: 'ACTIVE' },
            { id: '2', topic: 'Science', status: 'DRAFT' }
          ]
        })
      });

      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      // Should load and display diagnostics
      await waitFor(() => {
        expect(screen.getByText('Math')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
      });
    });
  });

  describe('Diagnostic Management', () => {
    it('should display diagnostic status badges', async () => {
      // Mock diagnostics with different statuses
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          results: [
            { id: '1', topic: 'Math', status: 'ACTIVE' },
            { id: '2', topic: 'Science', status: 'DRAFT' }
          ]
        })
      });

      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
        expect(screen.getByText('DRAFT')).toBeInTheDocument();
      });
    });

    it('should handle diagnostic actions', async () => {
      // Mock diagnostics
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ 
          results: [
            { id: '1', topic: 'Math', status: 'ACTIVE' }
          ]
        })
      });

      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Math')).toBeInTheDocument();
      });

      // Should show action buttons
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      expect(screen.getByRole('button', { name: /Create Diagnostic/ })).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      const createButton = screen.getByText('Create Diagnostic');
      createButton.focus();
      expect(document.activeElement).toBe(createButton);
    });

    it('should have proper heading structure', () => {
      renderWithProviders(<DiagnosticDashboard projectId={mockProjectId} />);
      
      expect(screen.getByRole('heading', { name: /Pre-Lecture Diagnostics/ })).toBeInTheDocument();
    });
  });
});
