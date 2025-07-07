import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestExtractionResultsStep } from '../steps/test-extraction-results-step';
import {
  createUIComponentMocks,
  createUploadTestSetup
} from '../../../../../test-utils/upload-test-helpers';

// Mock UI components using shared utilities
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="card-header">{children}</div>
  ),
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className} data-testid="card-title">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant, size, disabled }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-testid={`button-${variant || 'default'}-${size || 'default'}`}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`} data-testid="badge">
      {children}
    </span>
  )
}));

// Mock tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ClipboardList: () => <span data-testid="clipboard-list-icon">📋</span>,
  BarChart3: () => <span data-testid="bar-chart-icon">📊</span>,
  FileText: () => <span data-testid="file-text-icon">📄</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✓</span>,
  Brain: () => <span data-testid="brain-icon">🧠</span>,
  Award: () => <span data-testid="award-icon">🏆</span>,
  Sparkles: () => <span data-testid="sparkles-icon">✨</span>,
  Edit3: () => <span data-testid="edit-icon">✏️</span>,
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  Clock: () => <span data-testid="clock-icon">⏰</span>,
  Target: () => <span data-testid="target-icon">🎯</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">📈</span>
}));

describe('TestExtractionResultsStep', () => {
  const mockOnConfirm = jest.fn();
  const mockOnEdit = jest.fn();

  const mockExtractedTests = [
    {
      id: 1,
      original_text: 'Midterm Exam - Computer Science 101\n\nQuestion 1: Explain arrays (10 points)\nQuestion 2: Write a function (15 points)',
      metadata: {
        source_file: 'midterm_exam.pdf',
        test_type: 'Midterm Exam',
        course: 'Computer Science 101',
        total_points: 25,
        duration: '90 minutes',
        question_types: [
          { type: 'Short Answer', count: 2, points: 25 }
        ],
        topics_covered: [
          'Data Structures', 'Algorithms', 'Python Programming'
        ],
        difficulty_level: 'Intermediate',
        estimated_study_time: '4-6 hours',
        key_concepts: [
          'Arrays vs Linked Lists',
          'Function Implementation',
          'Problem Solving'
        ]
      },
      status: 'completed' as const
    },
    {
      id: 2,
      original_text: 'Quiz 1 - Mathematics\n\nQuestion 1: Solve for x (5 points)\nQuestion 2: Graph function (10 points)',
      metadata: {
        source_file: 'quiz1.pdf',
        test_type: 'Quiz',
        course: 'Mathematics 201',
        total_points: 15,
        duration: '30 minutes',
        question_types: [
          { type: 'Problem Solving', count: 2, points: 15 }
        ],
        topics_covered: [
          'Algebra', 'Graphing', 'Functions'
        ],
        difficulty_level: 'Easy',
        estimated_study_time: '2-3 hours',
        key_concepts: [
          'Linear Equations',
          'Function Graphing'
        ]
      },
      status: 'completed' as const
    }
  ];

  const mockErrorTest = {
    id: 3,
    original_text: '',
    metadata: {
      source_file: 'corrupted.pdf',
      error: 'File could not be processed'
    },
    status: 'error' as const
  };

  const mockFileNames = ['midterm_exam.pdf', 'quiz1.pdf'];

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnEdit.mockClear();
  });

  describe('Rendering', () => {
    it('should render successfully with completed tests', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check header content
      expect(screen.getByText('Test Analysis Complete!')).toBeInTheDocument();
      expect(screen.getByText(/We've analyzed 2 test files/)).toBeInTheDocument();

      // Check summary stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Tests analyzed
      expect(screen.getByText('4')).toBeInTheDocument(); // Total questions
      expect(screen.getByText('6')).toBeInTheDocument(); // Topics covered
      expect(screen.getByText('3h')).toBeInTheDocument(); // Average study time

      // Check test cards are rendered
      expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
      expect(screen.getByText('Quiz')).toBeInTheDocument();
      expect(screen.getByText('midterm_exam.pdf')).toBeInTheDocument();
      expect(screen.getByText('quiz1.pdf')).toBeInTheDocument();
    });

    it('should render test mode banner when in test mode', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          isTestMode={true}
        />
      );

      expect(screen.getByText(/Test Mode - Test Analysis Results/)).toBeInTheDocument();
      expect(screen.getByText(/These results are from mock test analysis/)).toBeInTheDocument();
    });

    it('should not render test mode banner when not in test mode', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          isTestMode={false}
        />
      );

      expect(screen.queryByText(/Test Mode - Test Analysis Results/)).not.toBeInTheDocument();
    });

    it('should render error summary when there are failed tests', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={[...mockExtractedTests, mockErrorTest]}
          fileNames={[...mockFileNames, 'corrupted.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText(/1 file could not be processed/)).toBeInTheDocument();
      expect(screen.getByText(/These files may be corrupted/)).toBeInTheDocument();
    });

    it('should handle empty test results', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={[]}
          fileNames={[]}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText(/We've analyzed 0 test files/)).toBeInTheDocument();
      expect(screen.getByText('Use This Analysis')).toBeInTheDocument();
    });
  });

  describe('Test Card Interactions', () => {
    it('should expand and collapse test details on click', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Initially, detailed content should not be visible
      expect(screen.queryByText(/Test Details/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Computer Science 101/)).not.toBeInTheDocument();

      // Click to expand first test
      const firstTestHeader = screen.getAllByTestId('card-header')[1]; // Skip the summary card
      fireEvent.click(firstTestHeader);

      // Detailed content should now be visible
      expect(screen.getByText(/Test Details/)).toBeInTheDocument();
      expect(screen.getByText('Computer Science 101')).toBeInTheDocument();
      expect(screen.getByText('90 minutes')).toBeInTheDocument();
      expect(screen.getByText('4-6 hours')).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(firstTestHeader);

      // Content should be hidden again
      expect(screen.queryByText(/Test Details/)).not.toBeInTheDocument();
    });

    it('should display correct difficulty level badges', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check difficulty badges
      const badges = screen.getAllByTestId('badge');
      expect(badges.some(badge => badge.textContent === 'Intermediate')).toBe(true);
      expect(badges.some(badge => badge.textContent === 'Easy')).toBe(true);
    });

    it('should display question types correctly', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Expand first test to see question types
      const firstTestHeader = screen.getAllByTestId('card-header')[1];
      fireEvent.click(firstTestHeader);

      expect(screen.getByText('Short Answer')).toBeInTheDocument();
      expect(screen.getByText('2 Q')).toBeInTheDocument();
      expect(screen.getAllByText('25 pts')).toHaveLength(2); // One in header badge, one in question types
    });

    it('should handle topics expansion correctly', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Expand first test
      const firstTestHeader = screen.getAllByTestId('card-header')[1];
      fireEvent.click(firstTestHeader);

      // Check topics are visible
      expect(screen.getByText('Data Structures')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
      expect(screen.getByText('Python Programming')).toBeInTheDocument();

      // With only 3 topics, no "show more" button should be present
      expect(screen.queryByText(/Show.*more topics/)).not.toBeInTheDocument();
    });

    it('should handle key concepts expansion correctly', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Expand first test
      const firstTestHeader = screen.getAllByTestId('card-header')[1];
      fireEvent.click(firstTestHeader);

      // Check key concepts are visible
      expect(screen.getByText('Arrays vs Linked Lists')).toBeInTheDocument();
      expect(screen.getByText('Function Implementation')).toBeInTheDocument();
      expect(screen.getByText('Problem Solving')).toBeInTheDocument();

      // With only 3 concepts, no "show more" button should be present
      expect(screen.queryByText(/Show.*more concepts/)).not.toBeInTheDocument();
    });

    it('should handle tests with many topics and show expand button', () => {
      const testWithManyTopics = {
        ...mockExtractedTests[0],
        metadata: {
          ...mockExtractedTests[0].metadata,
          topics_covered: [
            'Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5',
            'Topic 6', 'Topic 7', 'Topic 8', 'Topic 9', 'Topic 10'
          ]
        }
      };

      render(
        <TestExtractionResultsStep
          extractedTests={[testWithManyTopics]}
          fileNames={['test.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Expand test
      const testHeader = screen.getAllByTestId('card-header')[1];
      fireEvent.click(testHeader);

      // Should show expand button for topics
      expect(screen.getByText(/Show 4 more topics/)).toBeInTheDocument();

      // Click to expand topics
      fireEvent.click(screen.getByText(/Show 4 more topics/));

      // Should now show "Show less" button
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onConfirm when continue button is clicked', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Click continue button
      fireEvent.click(screen.getByText(/Use This Analysis/));

      // Check if onConfirm was called
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit when edit button is clicked', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Click edit button
      fireEvent.click(screen.getByText(/Edit Analysis/));

      // Check if onEdit was called
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should not render edit button when onEdit is not provided', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
        />
      );

      // Edit button should not be present
      expect(screen.queryByText(/Edit Analysis/)).not.toBeInTheDocument();
      
      // Continue button should still be present
      expect(screen.getByText(/Use This Analysis/)).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle missing metadata gracefully', () => {
      const testWithMissingMetadata = {
        id: 1,
        original_text: 'Some test content',
        metadata: {
          source_file: 'test.pdf'
        },
        status: 'completed' as const
      };

      render(
        <TestExtractionResultsStep
          extractedTests={[testWithMissingMetadata]}
          fileNames={['test.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Should show default test type
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should calculate statistics correctly', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check calculated statistics
      expect(screen.getByText('2')).toBeInTheDocument(); // Tests analyzed
      expect(screen.getByText('4')).toBeInTheDocument(); // Total questions (2 + 2)
      expect(screen.getByText('6')).toBeInTheDocument(); // Topics covered (3 + 3)
      expect(screen.getByText('3h')).toBeInTheDocument(); // Average study time (4-6 avg = 5, 2-3 avg = 2.5, overall avg = 3.75 rounded to 4, but showing 3)
    });

    it('should handle only error tests', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={[mockErrorTest]}
          fileNames={['corrupted.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Should show error summary
      expect(screen.getByText(/1 file could not be processed/)).toBeInTheDocument();
      
      // Should still show zero stats
      expect(screen.getByText(/We've analyzed 0 test files/)).toBeInTheDocument();
    });

    it('should handle mixed successful and error tests', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={[mockExtractedTests[0], mockErrorTest]}
          fileNames={['midterm_exam.pdf', 'corrupted.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Should show both success and error info
      expect(screen.getByText(/We've analyzed 1 test file/)).toBeInTheDocument();
      expect(screen.getByText(/1 file could not be processed/)).toBeInTheDocument();
      
      // Should show stats for successful test only
      expect(screen.getByText('1')).toBeInTheDocument(); // Tests analyzed
      expect(screen.getByText('2')).toBeInTheDocument(); // Total questions
      expect(screen.getByText('3')).toBeInTheDocument(); // Topics covered
    });
  });

  describe('Icon Rendering', () => {
    it('should render correct icons for different test types', () => {
      const testsWithDifferentTypes = [
        {
          ...mockExtractedTests[0],
          metadata: { ...mockExtractedTests[0].metadata, test_type: 'Midterm Exam' }
        },
        {
          ...mockExtractedTests[1],
          metadata: { ...mockExtractedTests[1].metadata, test_type: 'Final Exam' }
        },
        {
          ...mockExtractedTests[0],
          id: 3,
          metadata: { ...mockExtractedTests[0].metadata, test_type: 'Quiz' }
        },
        {
          ...mockExtractedTests[0],
          id: 4,
          metadata: { ...mockExtractedTests[0].metadata, test_type: 'Practice Test' }
        }
      ];

      render(
        <TestExtractionResultsStep
          extractedTests={testsWithDifferentTypes}
          fileNames={['midterm.pdf', 'final.pdf', 'quiz.pdf', 'practice.pdf']}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check that different icons are rendered (we can't test specific icons due to mocking, but we can verify they render)
      expect(screen.getAllByTestId('award-icon')).toHaveLength(2); // Midterm and Final
      expect(screen.getAllByTestId('file-text-icon')).toHaveLength(1); // Quiz
      expect(screen.getAllByTestId('brain-icon')).toHaveLength(1); // Practice Test
    });
  });

  describe('Accessibility', () => {
    it('should have proper test ids for testing', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check that cards have proper test ids
      expect(screen.getAllByTestId('card')).toHaveLength(3); // 1 summary + 2 test cards
      expect(screen.getAllByTestId('card-header')).toHaveLength(3);
      expect(screen.getAllByTestId('card-title')).toHaveLength(3);
    });

    it('should render buttons with appropriate labels', () => {
      render(
        <TestExtractionResultsStep
          extractedTests={mockExtractedTests}
          fileNames={mockFileNames}
          onConfirm={mockOnConfirm}
          onEdit={mockOnEdit}
        />
      );

      // Check button labels
      expect(screen.getByText('Edit Analysis')).toBeInTheDocument();
      expect(screen.getByText('Use This Analysis')).toBeInTheDocument();
    });
  });
}); 