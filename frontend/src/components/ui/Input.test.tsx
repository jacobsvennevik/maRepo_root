import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('handles different input types', () => {
    render(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('handles user input', async () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    await userEvent.type(input, 'Hello, World!');
    expect(input).toHaveValue('Hello, World!');
  });

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
}); 