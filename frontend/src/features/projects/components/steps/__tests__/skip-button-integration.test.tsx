import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipButton } from '../shared/skip-button';

describe('Skip Button Integration Tests', () => {
  describe('Skip Button Component Integration', () => {
    it('should render with custom text and handle click', () => {
      const mockOnSkip = jest.fn();
      
      render(
        <SkipButton
          onSkip={mockOnSkip}
          text="Skip - I don't have a syllabus"
        />
      );
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toBeInTheDocument();
      expect(skipButton).toHaveTextContent("Skip - I don't have a syllabus");
      
      fireEvent.click(skipButton);
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnSkip = jest.fn();
      
      render(
        <SkipButton
          onSkip={mockOnSkip}
          text="Skip"
          disabled={true}
        />
      );
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toBeDisabled();
      
      fireEvent.click(skipButton);
      expect(mockOnSkip).not.toHaveBeenCalled();
    });

    it('should have red styling classes', () => {
      render(<SkipButton onSkip={jest.fn()} text="Skip" />);
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveClass('text-red-600');
      expect(skipButton).toHaveClass('border-red-200');
    });

    it('should use default text when not provided', () => {
      render(<SkipButton onSkip={jest.fn()} />);
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveTextContent('Skip');
    });

    it('should accept custom className', () => {
      render(
        <SkipButton
          onSkip={jest.fn()}
          text="Skip"
          className="custom-class"
        />
      );
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveClass('custom-class');
    });
  });

  describe('Skip Button in Navigation Context', () => {
    it('should render correctly in a navigation layout', () => {
      const mockOnSkip = jest.fn();
      
      render(
        <div className="flex justify-between pt-4">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
            Previous
          </button>
          <div className="flex gap-2">
            <SkipButton
              onSkip={mockOnSkip}
              text="Skip - I don't have materials"
            />
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
              Next
            </button>
          </div>
        </div>
      );
      
      const skipButton = screen.getByTestId('skip-button');
      const nextButton = screen.getByText('Next');
      
      expect(skipButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(skipButton).toHaveTextContent("Skip - I don't have materials");
    });
  });

  describe('Skip Button Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const mockOnSkip = jest.fn();
      render(<SkipButton onSkip={mockOnSkip} text="Skip" />);
      const skipButton = screen.getByTestId('skip-button');
      skipButton.focus();
      expect(skipButton).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<SkipButton onSkip={jest.fn()} text="Skip" disabled={true} />);
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveAttribute('disabled');
    });
  });

  describe('Skip Button Styling Variations', () => {
    it('should handle long text gracefully', () => {
      const longText = "Skip - I don't have any course materials to upload at this time because I haven't received them yet";
      
      render(<SkipButton onSkip={jest.fn()} text={longText} />);
      
      const skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveTextContent(longText);
      expect(skipButton).toBeVisible();
    });

    it('should maintain styling with different text lengths', () => {
      const { rerender } = render(<SkipButton onSkip={jest.fn()} text="Skip" />);
      
      let skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveClass('text-red-600');
      
      rerender(<SkipButton onSkip={jest.fn()} text="Skip - Very long text that might wrap" />);
      
      skipButton = screen.getByTestId('skip-button');
      expect(skipButton).toHaveClass('text-red-600');
    });
  });
}); 