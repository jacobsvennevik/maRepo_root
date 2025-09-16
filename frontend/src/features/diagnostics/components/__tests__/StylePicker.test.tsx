import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StylePicker, TestStyleConfig } from '../StylePicker';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">{children}</label>
  ),
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="checkbox"
    />
  ),
}));

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step }: any) => (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min={min}
      max={max}
      step={step}
      data-testid="slider"
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

describe('StylePicker', () => {
  const mockOnChange = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    value: {
      test_style: null,
      style_config_override: {}
    },
    onChange: mockOnChange,
    onNext: mockOnNext,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preset selection cards', () => {
    render(<StylePicker {...defaultProps} />);
    
    expect(screen.getByText('MCQ Quiz')).toBeInTheDocument();
    expect(screen.getByText('Mixed Checkpoint')).toBeInTheDocument();
    expect(screen.getByText('STEM Problem Set')).toBeInTheDocument();
  });

  it('calls onChange when a preset is selected', () => {
    render(<StylePicker {...defaultProps} />);
    
    const mcqCard = screen.getByText('MCQ Quiz').closest('[data-testid="card"]');
    fireEvent.click(mcqCard!);
    
    expect(mockOnChange).toHaveBeenCalledWith({
      test_style: 'mcq_quiz',
      style_config_override: expect.objectContaining({
        timing: { total_minutes: 15, per_item_seconds: 60 },
        feedback: 'immediate',
        item_mix: expect.objectContaining({
          single_select: 0.9,
          cloze: 0.1
        })
      })
    });
  });

  it('shows advanced configuration when checkbox is checked', () => {
    render(<StylePicker {...defaultProps} />);
    
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);
    
    expect(screen.getByText('Timing Configuration')).toBeInTheDocument();
    expect(screen.getByText('Feedback Mode')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
  });

  it('calls onNext when Next button is clicked', () => {
    render(<StylePicker {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('calls onBack when Back button is clicked', () => {
    render(<StylePicker {...defaultProps} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('shows preview configuration', () => {
    render(<StylePicker {...defaultProps} />);
    
    expect(screen.getByText('Preview Configuration')).toBeInTheDocument();
  });

  it('updates effective config when overrides change', () => {
    render(<StylePicker {...defaultProps} />);
    
    // Enable advanced configuration
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);
    
    // Change feedback mode
    const feedbackSelect = screen.getByDisplayValue('immediate');
    fireEvent.change(feedbackSelect, { target: { value: 'on_submit' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        style_config_override: expect.objectContaining({
          feedback: 'on_submit'
        })
      })
    );
  });
});
