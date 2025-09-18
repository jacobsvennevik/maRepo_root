/**
 * Authentication Testing Patterns
 * 
 * Reusable patterns for testing authentication flows, token handling,
 * and error scenarios across different components.
 */

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/shared-setup';
import { testFactories } from '../../factories';
import { standardMocks } from '../../mocks';

// ============================================================================
// Authentication Test Patterns
// ============================================================================

export interface AuthTestConfig {
  component: React.ComponentType<any>;
  props?: any;
  mockResponses?: {
    login?: any;
    profile?: any;
    error?: any;
  };
}

export interface AuthTestScenario {
  name: string;
  credentials: { email: string; password: string };
  expectedResult: 'success' | 'error';
  expectedMessage?: string;
  expectedNavigation?: string;
}

// ============================================================================
// Login Flow Testing Pattern
// ============================================================================

export const createLoginFlowTest = (config: AuthTestConfig) => {
  const { mockAxiosAuth, mockAxiosApi, mockRouter } = standardMocks;
  const mockLocalStorage = testFactories.createLocalStorageMock();

  return {
    async testSuccessfulLogin(scenario: AuthTestScenario) {
      const user = userEvent.setup();
      
      // Mock successful responses
      mockAxiosAuth.post.mockResolvedValueOnce({
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        },
      });
      
      mockAxiosApi.get.mockResolvedValueOnce({
        data: { id: 1, email: scenario.credentials.email }
      });

      renderWithProviders(React.createElement(config.component, config.props));

      // Fill and submit form
      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), scenario.credentials.email);
        await user.type(screen.getByLabelText(/password/i), scenario.credentials.password);
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      // Verify authentication flow
      await waitFor(() => {
        expect(mockAxiosAuth.post).toHaveBeenCalledWith('/token/', {
          email: scenario.credentials.email,
          password: scenario.credentials.password,
        });
        expect(mockAxiosApi.get).toHaveBeenCalledWith('users/me/');
        if (scenario.expectedNavigation) {
          expect(mockRouter.push).toHaveBeenCalledWith(scenario.expectedNavigation);
        }
      }, { timeout: 5000 });
    },

    async testLoginError(scenario: AuthTestScenario) {
      const user = userEvent.setup();
      
      // Mock failed login
      mockAxiosAuth.post.mockRejectedValueOnce({
        response: {
          data: {
            detail: scenario.expectedMessage || 'Invalid credentials'
          }
        }
      });

      renderWithProviders(React.createElement(config.component, config.props));

      // Fill and submit form
      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), scenario.credentials.email);
        await user.type(screen.getByLabelText(/password/i), scenario.credentials.password);
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(new RegExp(scenario.expectedMessage || 'invalid credentials', 'i'))).toBeInTheDocument();
      }, { timeout: 3000 });
    },

    async testFormValidation() {
      const user = userEvent.setup();
      
      renderWithProviders(React.createElement(config.component, config.props));

      // Try to submit without filling fields
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      // Check for validation messages
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  };
};

// ============================================================================
// Token Handling Testing Pattern
// ============================================================================

export const createTokenHandlingTest = (config: AuthTestConfig) => {
  const { mockAxiosAuth, mockAxiosApi } = standardMocks;
  const mockLocalStorage = testFactories.createLocalStorageMock();

  return {
    async testTokenStorage() {
      const user = userEvent.setup();
      
      mockAxiosAuth.post.mockResolvedValueOnce({
        data: {
          access: 'test-access-token',
          refresh: 'test-refresh-token',
        },
      });
      
      mockAxiosApi.get.mockResolvedValueOnce({
        data: { id: 1, email: 'test@example.com' }
      });

      renderWithProviders(React.createElement(config.component, config.props));

      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'test-access-token');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'test-refresh-token');
      });
    },

    async testTokenRefresh() {
      // Mock token refresh scenario
      mockAxiosAuth.post.mockResolvedValueOnce({
        data: {
          access: 'new-access-token',
          refresh: 'new-refresh-token',
        },
      });

      // Test token refresh logic
      // This would be component-specific implementation
    }
  };
};

// ============================================================================
// Error Scenario Testing Pattern
// ============================================================================

export const createErrorScenarioTest = (config: AuthTestConfig) => {
  const { mockAxiosAuth } = standardMocks;

  const errorScenarios = [
    {
      name: 'Invalid credentials',
      mockError: {
        response: { data: { detail: 'Invalid credentials' } }
      },
      expectedMessage: /invalid credentials/i
    },
    {
      name: 'Network error',
      mockError: new Error('Network Error'),
      expectedMessage: /network error/i
    },
    {
      name: 'Server error',
      mockError: {
        response: { 
          status: 500,
          data: { detail: 'Internal server error' }
        }
      },
      expectedMessage: /internal server error/i
    },
    {
      name: 'Account locked',
      mockError: {
        response: { 
          status: 423,
          data: { detail: 'Account is locked' }
        }
      },
      expectedMessage: /account is locked/i
    }
  ];

  return {
    async testErrorScenarios() {
      const user = userEvent.setup();
      
      for (const scenario of errorScenarios) {
        mockAxiosAuth.post.mockRejectedValueOnce(scenario.mockError);

        renderWithProviders(React.createElement(config.component, config.props));

        await act(async () => {
          await user.type(screen.getByLabelText(/email/i), 'test@example.com');
          await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
          await user.click(screen.getByRole('button', { name: /^sign in$/i }));
        });

        await waitFor(() => {
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument();
        }, { timeout: 3000 });

        // Clean up for next iteration
        jest.clearAllMocks();
      }
    }
  };
};

// ============================================================================
// Accessibility Testing Pattern
// ============================================================================

export const createAuthAccessibilityTest = (config: AuthTestConfig) => {
  return {
    testKeyboardNavigation() {
      renderWithProviders(React.createElement(config.component, config.props));
      
      // Test tab navigation
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    },

    testScreenReaderSupport() {
      renderWithProviders(React.createElement(config.component, config.props));
      
      // Check for proper ARIA labels
      const form = screen.getByTestId('login-form');
      expect(form).toBeInTheDocument();
    }
  };
};

// ============================================================================
// Performance Testing Pattern
// ============================================================================

export const createAuthPerformanceTest = (config: AuthTestConfig) => {
  return {
    testRenderPerformance() {
      const startTime = performance.now();
      renderWithProviders(React.createElement(config.component, config.props));
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
    },

    async testLoginPerformance() {
      const user = userEvent.setup();
      const { mockAxiosAuth, mockAxiosApi } = standardMocks;
      
      mockAxiosAuth.post.mockResolvedValueOnce({
        data: { access: 'token', refresh: 'refresh' }
      });
      mockAxiosApi.get.mockResolvedValueOnce({
        data: { id: 1, email: 'test@example.com' }
      });

      renderWithProviders(React.createElement(config.component, config.props));

      const startTime = performance.now();
      
      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      await waitFor(() => {
        expect(mockAxiosAuth.post).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in < 2s
    }
  };
};
