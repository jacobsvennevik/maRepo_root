import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseContentReviewStep } from '../steps/course-content-review-step';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  )
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`${variant} ${className}`}>{children}</span>
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  FileText: () => <span>📄</span>,
  CheckCircle: () => <span>✓</span>,
  Sparkles: () => <span>✨</span>
}));

describe('CourseContentReviewStep', () => {
  const mockOnConfirm = jest.fn();

  const mockExtractedContent = [
    {
      id: 1,
      original_text: 'Chapter 1: Introduction to Physics\nThis chapter covers basic concepts...',
      metadata: {
        source_file: 'chapter1.pdf',
        page_count: 15
      },
      status: 'completed' as const
    },
    {
      id: 2,
      original_text: 'Chapter 2: Mechanics\nIn this chapter we explore...',
      metadata: {
        source_file: 'chapter2.pdf',
        page_count: 20
      },
      status: 'completed' as const
    }
  ];

  const mockFileNames = ['chapter1.pdf', 'chapter2.pdf'];

  beforeEach(() => {
    mockOnConfirm.mockClear();
  });

  it('should render successfully with content', () => {
    render(
      <CourseContentReviewStep
        extractedContent={mockExtractedContent}
        fileNames={mockFileNames}
        onConfirm={mockOnConfirm}
      />
    );

    // Check header content
    expect(screen.getByText('Content Analysis Complete!')).toBeInTheDocument();
    expect(screen.getByText(/We've processed 2 files/)).toBeInTheDocument();

    // Check file cards are rendered
    expect(screen.getByText('chapter1.pdf')).toBeInTheDocument();
    expect(screen.getByText('chapter2.pdf')).toBeInTheDocument();

    // Check page counts are displayed
    expect(screen.getByText('15 pages')).toBeInTheDocument();
    expect(screen.getByText('20 pages')).toBeInTheDocument();
  });

  it('should handle missing metadata gracefully', () => {
    const contentWithMissingMetadata = [
      {
        id: 1,
        original_text: 'Some content',
        metadata: {},
        status: 'completed' as const
      }
    ];

    render(
      <CourseContentReviewStep
        extractedContent={contentWithMissingMetadata}
        fileNames={['unknown.pdf']}
        onConfirm={mockOnConfirm}
      />
    );

    // Should show Document #1 when filename is missing
    expect(screen.getByText('Document #1')).toBeInTheDocument();
    // Should show 'excerpt' when page count is missing
    expect(screen.getByText('excerpt')).toBeInTheDocument();
  });

  it('should expand/collapse content on click', () => {
    render(
      <CourseContentReviewStep
        extractedContent={mockExtractedContent}
        fileNames={mockFileNames}
        onConfirm={mockOnConfirm}
      />
    );

    // Initially content should be collapsed
    expect(screen.queryByText(/This chapter covers basic concepts/)).not.toBeInTheDocument();

    // Click to expand first card
    fireEvent.click(screen.getByText('chapter1.pdf'));

    // Content should now be visible
    expect(screen.getByText(/This chapter covers basic concepts/)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(screen.getByText('chapter1.pdf'));

    // Content should be hidden again
    expect(screen.queryByText(/This chapter covers basic concepts/)).not.toBeInTheDocument();
  });

  it('should call onConfirm when continue button is clicked', () => {
    render(
      <CourseContentReviewStep
        extractedContent={mockExtractedContent}
        fileNames={mockFileNames}
        onConfirm={mockOnConfirm}
      />
    );

    // Click continue button
    fireEvent.click(screen.getByText(/Looks Good - Continue/));

    // Check if onConfirm was called
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should handle empty content array', () => {
    render(
      <CourseContentReviewStep
        extractedContent={[]}
        fileNames={[]}
        onConfirm={mockOnConfirm}
      />
    );

    // Should still show header but with 0 files
    expect(screen.getByText(/We've processed 0 files/)).toBeInTheDocument();
    expect(screen.getByText('Looks Good - Continue')).toBeInTheDocument();
  });
}); 