/**
 * LoginForm Modular Tests - Simplified Version
 * 
 * Working modular test suite using simplified patterns for
 * authentication functionality testing.
 */

import React from 'react';
import { screen, fireEvent, waitFor, act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { LoginForm } from '../LoginForm';

// Mock authentication services
jest.mock('@/lib/axios-auth', () => ({
  axiosAuth: { post: jest.fn() },
}));

jest.mock('@/lib/axios', () => ({
  axiosApi: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Pull mocked instances
const { axiosAuth } = jest.requireMock('@/lib/axios-auth') as { axiosAuth: { post: jest.Mock } };
const { axiosApi } = jest.requireMock('@/lib/axios') as { axiosApi: { get: jest.Mock } };

// Simple render function for testing
const renderWithProviders = (component: React.ReactElement) => render(component);

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form with all required elements', () => {
      renderWithProviders(<LoginForm />);
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('renders with proper accessibility attributes', () => {
      renderWithProviders(<LoginForm />);
      const form = screen.getByTestId('login-form');
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      expect(form).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Authentication Flow', () => {
    it('handles successful login', async () => {
      const user = userEvent.setup();
      axiosAuth.post.mockResolvedValueOnce({
        data: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
      });
      axiosApi.get.mockResolvedValueOnce({ data: { id: 1, email: 'test@example.com' } });

      renderWithProviders(<LoginForm />);

      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      await waitFor(() => {
        expect(axiosAuth.post).toHaveBeenCalledWith('/token/', {
          email: 'test@example.com',
          password: 'password123',
        });
        expect(axiosApi.get).toHaveBeenCalledWith('users/me/');
      }, { timeout: 5000 });
    });

    it('handles login error', async () => {
      const user = userEvent.setup();
      axiosAuth.post.mockRejectedValueOnce({
        response: { data: { detail: 'Invalid credentials' } },
      });

      renderWithProviders(<LoginForm />);

      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data-Driven Authentication', () => {
    const validCredentials = [
      { email: 'test@example.com', password: 'password123' },
      { email: 'user@domain.org', password: 'securepass456' },
      { email: 'admin@company.com', password: 'adminpass789' },
    ];

    validCredentials.forEach((credentials, index) => {
      it(`handles valid credentials ${index + 1}`, async () => {
        const user = userEvent.setup();
        axiosAuth.post.mockResolvedValueOnce({
          data: { access: 'mock-access-token', refresh: 'mock-refresh-token' },
        });
        axiosApi.get.mockResolvedValueOnce({ data: { id: 1, email: credentials.email } });

        renderWithProviders(<LoginForm />);

        await act(async () => {
          await user.type(screen.getByLabelText(/email/i), credentials.email);
          await user.type(screen.getByLabelText(/password/i), credentials.password);
          await user.click(screen.getByRole('button', { name: /^sign in$/i }));
        });

        await waitFor(() => {
          expect(axiosAuth.post).toHaveBeenCalledWith('/token/', {
            email: credentials.email,
            password: credentials.password,
          });
          expect(axiosApi.get).toHaveBeenCalledWith('users/me/');
        }, { timeout: 5000 });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithProviders(<LoginForm />);
      const form = screen.getByTestId('login-form');
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });
      expect(form).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);
      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();
      await user.tab();
      expect(screen.getByLabelText(/password/i)).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', () => {
      const startTime = performance.now();
      renderWithProviders(<LoginForm />);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles login efficiently', async () => {
      const user = userEvent.setup();
      axiosAuth.post.mockResolvedValueOnce({ data: { access: 'token', refresh: 'refresh' } });
      axiosApi.get.mockResolvedValueOnce({ data: { id: 1, email: 'test@example.com' } });

      renderWithProviders(<LoginForm />);

      const startTime = performance.now();
      await act(async () => {
        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /^sign in$/i }));
      });

      await waitFor(() => {
        expect(axiosAuth.post).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});