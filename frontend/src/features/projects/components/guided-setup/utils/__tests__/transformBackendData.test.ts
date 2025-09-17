import { transformBackendData } from '../transformBackendData';

// Mock the mock-data module
jest.mock('../../../../services/mock-data', () => ({
  MOCK_SYLLABUS_EXTRACTION: {
    course_title: 'Natural Language Interaction ',
    instructor: 'António Branco',
    topics: [
      'Knowledge representation based on inference',
      'Syntactic analysis and parsing',
      'Semantic representation and logical form',
      'Applications of natural language processing',
      'Language models',
      'Vector representation of knowledge and distributional semantics',
      'Word embeddings',
      'Neural networks, deep learning and Transformers',
      'AI, Cognition and open challenges'
    ],
    exam_dates: [
      { date: '2025-02-27', description: 'Short exercise A' },
      { date: '2025-03-13', description: 'Short exercise B' },
      { date: '2025-03-27', description: 'Test 1' },
      { date: '2025-04-10', description: 'Short exercise C' },
      { date: '2025-05-09', description: 'Tests announcement' },
      { date: '2025-05-15', description: 'Short exercise D' },
      { date: '2025-05-29', description: 'Test 2' },
      { date: '2025-05-30', description: 'Project submission (Master\'s)' },
      { date: '2025-06-13', description: 'Project submission (Doctorate)' }
    ]
  }
}));

describe('transformBackendData', () => {
  it('should transform mock syllabus data correctly', () => {
    const { MOCK_SYLLABUS_EXTRACTION } = require('../../../../services/mock-data');
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
    expect(result.dates).toHaveLength(9);
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
    const { MOCK_SYLLABUS_EXTRACTION } = require('../../../../services/mock-data');
    const directData = MOCK_SYLLABUS_EXTRACTION;

    const result = transformBackendData(directData);

    expect(result.courseName).toBe('Natural Language Interaction ');
    expect(result.instructor).toContain('António');
    expect(result.topics).toHaveLength(9);
    expect(result.dates).toHaveLength(9);
  });
}); 