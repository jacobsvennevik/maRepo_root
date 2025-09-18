import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateDiagnosticWizard } from '../CreateDiagnosticWizard';

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

// Mock the StylePicker component
jest.mock('../StylePicker', () => ({
  StylePicker: ({ onNext, onBack }: any) => (
    <div data-testid="style-picker">
      <button onClick={onNext} data-testid="style-next">Next</button>
      <button onClick={onBack} data-testid="style-back">Back</button>
    </div>
  ),
}));

describe('CreateDiagnosticWizard - Optimized', () => {
  beforeEach(() => {
    testEnv.mocks.resetAll();
    
    // Setup default API responses
    apiMocks.setupMockResponses({
      'POST:/backend/api/diagnostics/': {
        ok: true,
        status: 201,
        json: async () => ({ id: 'test-session-123', topic: 'Test Topic' })
      }
    });
  });

  describe('Wizard Flow', () => {
    it('should render wizard dialog when opened', () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Create Diagnostic Session');
    });

    it('should not render dialog when closed', () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={false}
          onClose={jest.fn()}
        />
      );

      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should handle wizard step navigation', async () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Should start with style picker
      expect(screen.getByTestId('style-picker')).toBeInTheDocument();

      // Navigate to next step
      fireEvent.click(screen.getByTestId('style-next'));

      // Should show topic input step
      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });
    });

    it('should handle back navigation', async () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Navigate to next step first
      fireEvent.click(screen.getByTestId('style-next'));

      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });

      // Go back
      fireEvent.click(screen.getByTestId('style-back'));

      await waitFor(() => {
        expect(screen.getByTestId('style-picker')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Navigate to topic input step
      fireEvent.click(screen.getByTestId('style-next'));

      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });

      // Try to submit without entering topic
      const submitButton = screen.getByTestId('button');
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Topic is required/)).toBeInTheDocument();
      });
    });

    it('should accept valid input', async () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Navigate to topic input step
      fireEvent.click(screen.getByTestId('style-next'));

      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });

      // Enter valid topic
      const topicInput = screen.getByTestId('input');
      fireEvent.change(topicInput, { target: { value: 'Mathematics' } });

      // Submit
      const submitButton = screen.getByTestId('button');
      fireEvent.click(submitButton);

      // Should create diagnostic session
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
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Complete the wizard flow
      fireEvent.click(screen.getByTestId('style-next'));
      
      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('input'), { target: { value: 'Test Topic' } });
      fireEvent.click(screen.getByTestId('button'));

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText(/Diagnostic session created successfully/)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Complete the wizard flow
      fireEvent.click(screen.getByTestId('style-next'));
      
      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('input'), { target: { value: 'Test Topic' } });
      fireEvent.click(screen.getByTestId('button'));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to create diagnostic session/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      renderWithProviders(
        <CreateDiagnosticWizard 
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      // Tab navigation should work
      const firstButton = screen.getByTestId('style-next');
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });
  });
});
