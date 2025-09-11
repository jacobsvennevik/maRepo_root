import { transformBackendData } from '../transformBackendData';
import { MOCK_SYLLABUS_EXTRACTION } from '../../../services/mock-data';

describe('transformBackendData', () => {
  it('should transform mock syllabus data correctly', () => {
    const mockBackendData = {
      metadata: MOCK_SYLLABUS_EXTRACTION
    };

    const result = transformBackendData(mockBackendData);

    // Check basic fields
    expect(result.courseName).toBe('Natural Language Interaction ');
    expect(result.instructor).toContain('António');
    expect(result.semester).toBe('Spring 2025');
    expect(result.courseType).toBe('STEM');

    // Check topics
    expect(result.topics).toHaveLength(9);
    expect(result.topics[0]).toHaveProperty('id');
    expect(result.topics[0]).toHaveProperty('label');
    expect(result.topics[0]).toHaveProperty('confidence');
    expect(result.topics[0].label).toBe('Knowledge representation based on inference');

    // Check dates
    expect(result.dates).toHaveLength(8);
    expect(result.dates[0]).toHaveProperty('id');
    expect(result.dates[0]).toHaveProperty('date');
    expect(result.dates[0]).toHaveProperty('description');
    expect(result.dates[0]).toHaveProperty('type');
    expect(result.dates[0].description).toContain('Short exercise A');

    // Check assessment types
    expect(result.assessmentTypes).toBeDefined();
    expect(result.assessmentTypes?.has_final_exam).toBe(true);
    expect(result.assessmentTypes?.has_projects).toBe(true);

    // Check test types
    expect(result.testTypes).toBeDefined();
    expect(Array.isArray(result.testTypes)).toBe(true);

    // Check grading
    expect(result.grading).toBeDefined();
    expect(Array.isArray(result.grading)).toBe(true);
  });

  it('should handle missing data gracefully', () => {
    const emptyData = {};

    const result = transformBackendData(emptyData);

    expect(result.courseName).toBe('Unknown Course');
    expect(result.instructor).toBe('Unknown Instructor');
    expect(result.semester).toBe('Spring 2025');
    expect(result.topics).toHaveLength(0);
    expect(result.dates).toHaveLength(0);
    expect(result.testTypes).toHaveLength(0);
    expect(result.grading).toHaveLength(0);
  });

  it('should handle backend data without metadata wrapper', () => {
    const directData = MOCK_SYLLABUS_EXTRACTION;

    const result = transformBackendData(directData);

    expect(result.courseName).toBe('Natural Language Interaction ');
    expect(result.instructor).toContain('António');
    expect(result.topics).toHaveLength(9);
    expect(result.dates).toHaveLength(8);
  });
}); 