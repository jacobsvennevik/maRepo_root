import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipButton } from '../skip-button';

describe('SkipButton', () => {
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    mockOnSkip.mockClear();
  });

  it('renders with default text', () => {
    render(<SkipButton onSkip={mockOnSkip} />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const customText = "Skip - I don't have materials";
    render(<SkipButton onSkip={mockOnSkip} text={customText} />);
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('calls onSkip when clicked', () => {
    render(<SkipButton onSkip={mockOnSkip} />);
    fireEvent.click(screen.getByTestId('skip-button'));
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<SkipButton onSkip={mockOnSkip} disabled={true} />);
    const button = screen.getByTestId('skip-button');
    expect(button).toBeDisabled();
  });

  it('has red styling', () => {
    render(<SkipButton onSkip={mockOnSkip} />);
    const button = screen.getByTestId('skip-button');
    expect(button).toHaveClass('text-red-600');
    expect(button).toHaveClass('border-red-200');
  });
}); 