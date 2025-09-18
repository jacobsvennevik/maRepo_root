export interface ExtractedData {
  courseName: string;
  instructor: string;
  semester: string;
  courseType?: string;
  assessmentTypes?: {
    has_final_exam: boolean;
    has_regular_quizzes: boolean;
    has_essays: boolean;
    has_projects: boolean;
    has_lab_work: boolean;
    has_group_work: boolean;
    primary_assessment_method: string;
  };
  topics: Array<{
    id: string;
    label: string;
    confidence: number;
  }>;
  dates: Array<{
    id: string;
    date: string;
    description: string;
    type: string;
    format?: string;
    weight?: string;
  }>;
  testTypes: Array<{
    id: string;
    type: string;
    confidence: number;
  }>;
  grading: Array<{
    category: string;
    weight: number;
  }>;
  courseDescription?: string;
  learningOutcomes?: string[];
}

export const transformTopics = (topicsData: any): Array<{ id: string; label: string; confidence: number }> => {
  if (!topicsData || !Array.isArray(topicsData)) return [];
  
  return topicsData.map((topic: any, index: number) => {
    let label: string;
    if (typeof topic === 'string') {
      label = topic;
    } else if (topic && typeof topic === 'object' && topic.label) {
      label = topic.label;
    } else {
      label = String(topic);
    }
    
    return {
      id: `topic-${index}-${label.replace(/\s+/g, '-').toLowerCase()}`,
      label,
      confidence: Math.floor(Math.random() * 20) + 80 // Random confidence between 80-100
    };
  }).filter(topic => topic.label);
};

export const transformDates = (datesData: any): Array<{ id: string; date: string; description: string; type: string; format?: string; weight?: string }> => {
  if (!datesData || !Array.isArray(datesData)) return [];
  
  const parseDateString = (dateStr: string) => {
    // Handle various date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try to parse common formats
      const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
        /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          const [, month, day, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      return null;
    }
    return date;
  };
  
  return datesData
    .map((dateItem: any, index: number) => {
      if (!dateItem) return null;
      
      let date: string;
      let description: string;
      let type: string = 'exam';
      
      if (typeof dateItem === 'string') {
        // Simple string format - try to extract date and description
        const parts = dateItem.split(/[:\-–—]/);
        if (parts.length >= 2) {
          date = parts[0].trim();
          description = parts[1].trim();
        } else {
          date = dateItem;
          description = 'Important date';
        }
      } else if (dateItem && typeof dateItem === 'object') {
        date = dateItem.date || dateItem.date_string || dateItem.date_str || '';
        description = dateItem.description || dateItem.desc || dateItem.title || 'Important date';
        type = dateItem.type || dateItem.category || 'exam';
      } else {
        return null;
      }
      
      if (!date) return null;
      
      const parsedDate = parseDateString(date);
      if (!parsedDate) return null;
      
      return {
        id: `date-${index}-${description.replace(/\s+/g, '-').toLowerCase()}`,
        date: parsedDate.toISOString().split('T')[0],
        description,
        type,
        format: dateItem.format || '',
        weight: dateItem.weight || ''
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

export const transformTestTypes = (evaluationData: any): Array<{ id: string; type: string; confidence: number }> => {
  if (!evaluationData || !Array.isArray(evaluationData)) return [];
  
  return evaluationData
    .map((item: any, index: number) => {
      let type: string;
      if (typeof item === 'string') {
        type = item;
      } else if (item && typeof item === 'object') {
        type = item.type || item.name || item.label || String(item);
      } else {
        type = String(item);
      }
      
      return {
        id: `test-${index}-${type.replace(/\s+/g, '-').toLowerCase()}`,
        type,
        confidence: Math.floor(Math.random() * 20) + 80 // Random confidence between 80-100
      };
    })
    .filter(testType => testType.type);
};

export const transformBackendData = (backendData: any): ExtractedData => {
  const metadata = backendData.metadata || backendData;
  
  // Determine assessment types based on exam dates
  const examDates = metadata.exam_dates || metadata.important_dates || metadata.dates || [];
  const hasTests = examDates.some((date: any) => 
    date.description?.toLowerCase().includes('test') || 
    date.description?.toLowerCase().includes('exam')
  );
  const hasExercises = examDates.some((date: any) => 
    date.description?.toLowerCase().includes('exercise') || 
    date.description?.toLowerCase().includes('assignment')
  );
  const hasProjects = examDates.some((date: any) => 
    date.description?.toLowerCase().includes('project')
  );
  
  return {
    courseName: metadata.course_title || metadata.course_name || metadata.course || 'Unknown Course',
    instructor: metadata.instructor || metadata.professor || metadata.teacher || 'Unknown Instructor',
    semester: metadata.semester || metadata.term || 'Spring 2025',
    courseType: metadata.course_type || metadata.subject || 'STEM',
    assessmentTypes: {
      has_final_exam: hasTests,
      has_regular_quizzes: hasTests,
      has_essays: false,
      has_projects: hasProjects,
      has_lab_work: false,
      has_group_work: false,
      primary_assessment_method: hasTests ? 'Tests and Quizzes' : hasProjects ? 'Projects' : 'Mixed Assessment'
    },
    topics: transformTopics(metadata.topics || metadata.topics_covered),
    dates: transformDates(metadata.important_dates || metadata.dates || metadata.exam_dates),
    testTypes: transformTestTypes(metadata.forms_of_evaluation || metadata.assessment_types || metadata.test_types),
    grading: Array.isArray(metadata.grading) 
      ? metadata.grading.map((g: any) => ({ 
          category: g.category || g.name || 'Unknown', 
          weight: parseFloat(g.weight || g.percentage || 0) 
        }))
      : [],
    courseDescription: metadata.course_description || metadata.description || 'Course description not available.',
    learningOutcomes: metadata.learning_outcomes || metadata.objectives || []
  };
}; 