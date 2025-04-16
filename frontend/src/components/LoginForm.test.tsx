import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock next/image since we're using it in the component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe('LoginForm', () => {
  it('renders the form with all required elements', () => {
    render(<LoginForm />);
    
    // Check for headings
    expect(screen.getByText('Dive into learning')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your YesYes account')).toBeInTheDocument();
    
    // Check for form inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Meta' })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    // Add assertions for form submission when implemented
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('displays forgot password link', () => {
    render(<LoginForm />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
  });

  it('displays sign up link', () => {
    render(<LoginForm />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('displays terms and privacy links', () => {
    render(<LoginForm />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoginForm className="custom-class" />);
    expect(screen.getByTestId('login-form')).toHaveClass('custom-class');
  });
}); 