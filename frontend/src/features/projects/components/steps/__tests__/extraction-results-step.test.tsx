import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExtractionResultsStep } from '../extraction-results-step';

// Mock the isTestMode function
jest.mock('../../../services/mock-data', () => ({
  isTestMode: () => false,
  MOCK_SYLLABUS_EXTRACTION: {
    course_title: 'Test Course',
    instructor: 'Test Instructor',
    topics: ['Topic 1', 'Topic 2'],
    exam_dates: [
      { date: '2025-01-01', description: 'Test 1' },
      { date: '2025-02-01', description: 'Test 2' }
    ]
  },
  convertCourseContentToExtractedData: jest.fn()
}));

describe('ExtractionResultsStep', () => {
  const mockExtractedData = {
    courseName: 'Test Course',
    instructor: 'Test Instructor',
    semester: 'Spring 2025',
    topics: [
      { id: 'topic-1', label: 'Topic 1', confidence: 90 },
      { id: 'topic-2', label: 'Topic 2', confidence: 85 }
    ],
    dates: [
      { id: 'date-1', date: '2025-01-01', description: 'Test 1', type: 'exam' },
      { id: 'date-2', date: '2025-02-01', description: 'Test 2', type: 'exam' }
    ],
    testTypes: [
      { id: 'test-1', type: 'Written Test', confidence: 95 }
    ],
    grading: [
      { category: 'Tests', weight: 100 }
    ]
  };

  const defaultProps = {
    extractedData: mockExtractedData,
    fileName: 'test.pdf',
    onConfirm: jest.fn(),
    onEdit: jest.fn()
  } as any;

  it('renders extracted data correctly', () => {
    render(<ExtractionResultsStep {...defaultProps} />);

    // Check course information
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test Instructor')).toBeInTheDocument();
    expect(screen.getByText('Spring 2025')).toBeInTheDocument();

    // Check topics
    expect(screen.getByText('Topic 1')).toBeInTheDocument();
    expect(screen.getByText('Topic 2')).toBeInTheDocument();

    // Check dates
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();

    // Check test types
    expect(screen.getByText('Written Test')).toBeInTheDocument();

    // Check grading
    expect(screen.getByText('Tests')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('allows editing of extracted data', async () => {
    const onConfirm = jest.fn();
    render(<ExtractionResultsStep {...defaultProps} onConfirm={onConfirm} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Edit course name
    const courseNameInput = screen.getByDisplayValue('Test Course');
    fireEvent.change(courseNameInput, { target: { value: 'Updated Course' } });

    // Edit instructor
    const instructorInput = screen.getByDisplayValue('Test Instructor');
    fireEvent.change(instructorInput, { target: { value: 'Updated Instructor' } });

    // Edit topic
    const topicInput = screen.getByDisplayValue('Topic 1');
    fireEvent.change(topicInput, { target: { value: 'Updated Topic' } });

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify onConfirm was called with updated data
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      courseName: 'Updated Course',
      instructor: 'Updated Instructor',
      topics: expect.arrayContaining([
        expect.objectContaining({
          label: 'Updated Topic'
        })
      ])
    }));
  });

  it('allows canceling edits', () => {
    render(<ExtractionResultsStep {...defaultProps} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Edit course name
    const courseNameInput = screen.getByDisplayValue('Test Course');
    fireEvent.change(courseNameInput, { target: { value: 'Updated Course' } });

    // Cancel edits
    fireEvent.click(screen.getByText('Cancel'));

    // Verify original data is shown
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Updated Course')).not.toBeInTheDocument();
  });

  it('saves changes without navigating', () => {
    const onConfirm = jest.fn();
    const onSave = jest.fn();
    render(<ExtractionResultsStep {...defaultProps} onConfirm={onConfirm} onSave={onSave} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Edit course name
    const courseNameInput = screen.getByDisplayValue('Test Course');
    fireEvent.change(courseNameInput, { target: { value: 'Updated Course' } });

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify onSave was called with updated data
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      courseName: 'Updated Course'
    }));

    // Verify onConfirm was not called
    expect(onConfirm).not.toHaveBeenCalled();

    // Verify edit mode is exited
    expect(screen.queryByDisplayValue('Updated Course')).not.toBeInTheDocument();
    expect(screen.getByText('Updated Course')).toBeInTheDocument();
  });

  it('only navigates when clicking continue button', () => {
    const onConfirm = jest.fn();
    const onSave = jest.fn();
    render(<ExtractionResultsStep {...defaultProps} onConfirm={onConfirm} onSave={onSave} />);

    // Click continue button
    fireEvent.click(screen.getByText(/Looks Good - Continue/));

    // Verify onConfirm was called
    expect(onConfirm).toHaveBeenCalledWith(mockExtractedData);

    // Verify onSave was not called
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows test mode banner when in test mode', () => {
    // Mock isTestMode to return true
    jest.spyOn(require('../../../services/mock-data'), 'isTestMode').mockReturnValue(true);

    render(<ExtractionResultsStep {...defaultProps} mockDataType="syllabus" />);

    expect(screen.getByText(/Test Mode - Syllabus Extraction Results/)).toBeInTheDocument();
  });

  it('shows correct number of items in summary stats', () => {
    render(<ExtractionResultsStep {...defaultProps} />);

    // Find elements by their parent text
    const topicsSection = screen.getByText('Topics Found').parentElement;
    const datesSection = screen.getByText('Important Dates').parentElement;
    const testTypesSection = screen.getByText('Test Types').parentElement;
    const gradeSection = screen.getByText('Grade Categories').parentElement;

    // Check the numbers in each section
    expect(topicsSection?.querySelector('.text-2xl')?.textContent).toBe('2'); // Topics
    expect(datesSection?.querySelector('.text-2xl')?.textContent).toBe('2'); // Dates
    expect(testTypesSection?.querySelector('.text-2xl')?.textContent).toBe('1'); // Test Types
    expect(gradeSection?.querySelector('.text-2xl')?.textContent).toBe('1'); // Grade Categories
  });

  it('handles "Show more" functionality for topics', () => {
    const manyTopics = {
      ...mockExtractedData,
      topics: Array.from({ length: 10 }, (_, i) => ({
        id: `topic-${i}`,
        label: `Topic ${i}`,
        confidence: 90
      }))
    } as any;

    render(<ExtractionResultsStep {...defaultProps} extractedData={manyTopics} />);

    // Initially shows 5 topics
    expect(screen.getAllByText(/Topic \d/).length).toBe(5);

    // Click show more
    fireEvent.click(screen.getByText('Show 5 more topics'));

    // Shows all topics
    expect(screen.getAllByText(/Topic \d/).length).toBe(10);
  });

  it('validates dates when editing', () => {
    const onSave = jest.fn();
    render(<ExtractionResultsStep {...defaultProps} onSave={onSave} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Get date input
    let dateInput = screen.getByDisplayValue('2025-01-01');
    
    // Test valid date
    fireEvent.change(dateInput, { target: { value: '2025-03-15' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      dates: expect.arrayContaining([
        expect.objectContaining({
          date: '2025-03-15'
        })
      ])
    }));

    // Reset mock and start fresh editing session
    onSave.mockReset();
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Get the updated date input (it should now show 2025-03-15)
    dateInput = screen.getByDisplayValue('2025-03-15');

    // Test invalid date (February 31st doesn't exist)
    fireEvent.change(dateInput, { target: { value: '2025-02-31' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).not.toHaveBeenCalled();

    // Test invalid date format
    fireEvent.change(dateInput, { target: { value: 'invalid-date' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('enforces date range constraints', () => {
    render(<ExtractionResultsStep {...defaultProps} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit Extracted Text'));

    // Get date input
    const dateInput = screen.getByDisplayValue('2025-01-01');
    
    // Verify min and max attributes
    expect(dateInput).toHaveAttribute('min', '2024-01-01');
    expect(dateInput).toHaveAttribute('max', '2030-12-31');
    expect(dateInput).toHaveAttribute('type', 'date');
  });
}); 