import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDiagnosticWizard } from '../CreateDiagnosticWizard';

// Mock the StylePicker component
jest.mock('../StylePicker', () => ({
  StylePicker: ({ onNext, onBack }: any) => (
    <div data-testid="style-picker">
      <button onClick={onNext} data-testid="style-next">Next</button>
      <button onClick={onBack} data-testid="style-back">Back</button>
    </div>
  ),
}));

// Mock axios
jest.mock('@/lib/axios-api', () => ({
  axiosApi: {
    post: jest.fn().mockResolvedValue({
      status: 201,
      data: { id: 'test-session-123', topic: 'Test Topic' }
    })
  }
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, id }: any) => (
    <input
      id={id}
      type={type || 'text'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">{children}</label>
  ),
}));

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ children, value, onValueChange, id }: any) => {
      const childArray = React.Children.toArray(children) as any[];
      const extractOptions = (nodes: any[]): any[] =>
        nodes.flatMap((node: any) => {
          if (!React.isValidElement(node)) return [];
          if (node.type === 'option') return [node];
          const inner = (node.props && node.props.children) ? React.Children.toArray(node.props.children) : [];
          return extractOptions(inner as any[]);
        });
      const options = extractOptions(childArray);
      return (
        <div data-testid="select">
          <select id={id} value={value} onChange={(e) => onValueChange(e.target.value)}>
            {options}
          </select>
        </div>
      );
    },
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: () => null,
    SelectValue: () => null,
  };
});

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
}));

describe('CreateDiagnosticWizard', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnCreated = jest.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    projectId: 'test-project-123',
    onCreated: mockOnCreated,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the wizard dialog when open', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Generate a pre-lecture diagnostic to assess student knowledge')).toBeInTheDocument();
  });

  it('shows basic settings step initially', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    expect(screen.getByText('Basic Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Feedback Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Questions')).toBeInTheDocument();
  });

  it('navigates to style picker step when Next is clicked', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Fill in required field
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    // Click Next
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByTestId('style-picker')).toBeInTheDocument();
    expect(screen.getByText('Test Style')).toBeInTheDocument();
  });

  it('prevents navigation when required fields are empty', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('allows navigation when topic is filled', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates back to previous step', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Go to step 2 (style picker)
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Go back to step 1
    const backButton = screen.getByText('Previous');
    fireEvent.click(backButton);
    
    expect(screen.getByText('Basic Settings')).toBeInTheDocument();
  });

  it('shows schedule step', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Navigate to schedule step
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    let nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    
    const styleNext = screen.getByTestId('style-next');
    fireEvent.click(styleNext); // Step 3
    
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByLabelText('Scheduled For')).toBeInTheDocument();
    expect(screen.getByLabelText('Due By')).toBeInTheDocument();
  });

  it('shows review step', () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Navigate to review step
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    let nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(nextButton); // Step 3
    fireEvent.click(nextButton); // Step 4
    
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Review Your Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Create Diagnostic')).toBeInTheDocument();
  });

  it('calls onCreated when diagnostic is created', async () => {
    render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Navigate to review step
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    let nextButton = screen.getByText('Next');
    fireEvent.click(nextButton); // Step 2
    fireEvent.click(nextButton); // Step 3
    fireEvent.click(nextButton); // Step 4
    
    // Create diagnostic
    const createButton = screen.getByText('Create Diagnostic');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalledWith({ id: 'test-session-123', topic: 'Test Topic' });
    });
  });

  it('resets form when dialog is closed', () => {
    const { rerender } = render(<CreateDiagnosticWizard {...defaultProps} />);
    
    // Fill in topic
    const topicInput = screen.getByLabelText('Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    // Close dialog
    rerender(<CreateDiagnosticWizard {...defaultProps} open={false} />);
    
    // Reopen dialog
    rerender(<CreateDiagnosticWizard {...defaultProps} open={true} />);
    
    // Topic should be empty
    const newTopicInput = screen.getByLabelText('Topic');
    expect(newTopicInput).toHaveValue('');
  });
});
