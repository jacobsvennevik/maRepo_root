/**
 * Authentication Test Helpers
 * 
 * Reusable helper functions for authentication testing scenarios.
 */

import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../setup/shared-setup';
import { testFactories } from '../factories';
import { standardMocks } from '../mocks';

// ============================================================================
// Authentication Helpers
// ============================================================================

export const authHelpers = {
  /**
   * Setup authentication mocks with default responses
   */
  setupAuthMocks: (responses: {
    login?: any;
    profile?: any;
    error?: any;
  } = {}) => {
    const { mockAxiosAuth, mockAxiosApi } = standardMocks;
    
    // Default successful responses
    mockAxiosAuth.post.mockResolvedValueOnce({
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        ...responses.login
      },
    });
    
    mockAxiosApi.get.mockResolvedValueOnce({
      data: { id: 1, email: 'test@example.com', ...responses.profile }
    });

    return { mockAxiosAuth, mockAxiosApi };
  },

  /**
   * Setup authentication error mocks
   */
  setupAuthErrorMocks: (error: any) => {
    const { mockAxiosAuth } = standardMocks;
    mockAxiosAuth.post.mockRejectedValueOnce(error);
    return { mockAxiosAuth };
  },

  /**
   * Fill login form with credentials
   */
  fillLoginForm: async (credentials: { email: string; password: string }) => {
    const user = userEvent.setup();
    
    await act(async () => {
      await user.type(screen.getByLabelText(/email/i), credentials.email);
      await user.type(screen.getByLabelText(/password/i), credentials.password);
    });

    return user;
  },

  /**
   * Submit login form
   */
  submitLoginForm: async (user: any) => {
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    });
  },

  /**
   * Complete login flow
   */
  completeLoginFlow: async (credentials: { email: string; password: string }) => {
    const user = await authHelpers.fillLoginForm(credentials);
    await authHelpers.submitLoginForm(user);
    return user;
  },

  /**
   * Verify successful login
   */
  verifySuccessfulLogin: async (credentials: { email: string; password: string }, expectedNavigation?: string) => {
    const { mockAxiosAuth, mockAxiosApi, mockRouter } = standardMocks;
    
    await waitFor(() => {
      expect(mockAxiosAuth.post).toHaveBeenCalledWith('/token/', {
        email: credentials.email,
        password: credentials.password,
      });
      expect(mockAxiosApi.get).toHaveBeenCalledWith('users/me/');
      
      if (expectedNavigation) {
        expect(mockRouter.push).toHaveBeenCalledWith(expectedNavigation);
      }
    }, { timeout: 5000 });
  },

  /**
   * Verify login error
   */
  verifyLoginError: async (expectedMessage: string) => {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(expectedMessage, 'i'))).toBeInTheDocument();
    }, { timeout: 3000 });
  },

  /**
   * Verify form validation errors
   */
  verifyFormValidation: async () => {
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  },

  /**
   * Test authentication scenarios
   */
  testAuthScenarios: async (scenarios: Array<{
    name: string;
    credentials: { email: string; password: string };
    mockResponse?: any;
    mockError?: any;
    expectedResult: 'success' | 'error';
    expectedMessage?: string;
    expectedNavigation?: string;
  }>) => {
    for (const scenario of scenarios) {
      // Setup mocks based on scenario
      if (scenario.mockError) {
        authHelpers.setupAuthErrorMocks(scenario.mockError);
      } else {
        authHelpers.setupAuthMocks({ login: scenario.mockResponse });
      }

      // Complete login flow
      await authHelpers.completeLoginFlow(scenario.credentials);

      // Verify results
      if (scenario.expectedResult === 'success') {
        await authHelpers.verifySuccessfulLogin(scenario.credentials, scenario.expectedNavigation);
      } else {
        await authHelpers.verifyLoginError(scenario.expectedMessage || 'Invalid credentials');
      }

      // Clean up for next iteration
      jest.clearAllMocks();
    }
  }
};

// ============================================================================
// Common Authentication Test Scenarios
// ============================================================================

export const authScenarios = {
  validCredentials: [
    { email: 'test@example.com', password: 'password123' },
    { email: 'user@domain.org', password: 'securepass456' },
    { email: 'admin@company.com', password: 'adminpass789' }
  ],

  invalidCredentials: [
    { email: 'test@example.com', password: 'wrongpassword' },
    { email: 'nonexistent@example.com', password: 'password123' },
    { email: 'test@example.com', password: '' }
  ],

  errorScenarios: [
    {
      name: 'Invalid credentials',
      mockError: { response: { data: { detail: 'Invalid credentials' } } },
      expectedMessage: /invalid credentials/i
    },
    {
      name: 'Network error',
      mockError: new Error('Network Error'),
      expectedMessage: /network error/i
    },
    {
      name: 'Server error',
      mockError: { response: { status: 500, data: { detail: 'Internal server error' } } },
      expectedMessage: /internal server error/i
    },
    {
      name: 'Account locked',
      mockError: { response: { status: 423, data: { detail: 'Account is locked' } } },
      expectedMessage: /account is locked/i
    }
  ]
};

// ============================================================================
// Authentication Test Utilities
// ============================================================================

export const authTestUtils = {
  /**
   * Create a complete authentication test suite
   */
  createAuthTestSuite: (component: React.ComponentType<any>, props: any = {}) => {
    return {
      async testSuccessfulLogin() {
        authHelpers.setupAuthMocks();
        await authHelpers.completeLoginFlow(authScenarios.validCredentials[0]);
        await authHelpers.verifySuccessfulLogin(authScenarios.validCredentials[0], '/dashboard');
      },

      async testLoginError() {
        authHelpers.setupAuthErrorMocks(authScenarios.errorScenarios[0].mockError);
        await authHelpers.completeLoginFlow(authScenarios.invalidCredentials[0]);
        await authHelpers.verifyLoginError('Invalid credentials');
      },

      async testFormValidation() {
        const user = userEvent.setup();
        renderWithProviders(React.createElement(component, props));
        
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
        await authHelpers.verifyFormValidation();
      },

      async testTokenStorage() {
        authHelpers.setupAuthMocks();
        await authHelpers.completeLoginFlow(authScenarios.validCredentials[0]);
        
        const mockLocalStorage = testFactories.createLocalStorageMock();
        await waitFor(() => {
          expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token');
          expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
        });
      },

      async testAccessibility() {
        renderWithProviders(React.createElement(component, props));
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });
        
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(submitButton).toHaveAttribute('type', 'submit');
      },

      async testPerformance() {
        const startTime = performance.now();
        renderWithProviders(React.createElement(component, props));
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(100);
      }
    };
  }
};
