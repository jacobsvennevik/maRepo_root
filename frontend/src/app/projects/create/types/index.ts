export interface ProjectSetup {
  projectName: string;
  testLevel: string;
  gradeLevel?: string;
  assignmentDescription?: string;
  courseFiles: File[];
  testFiles: File[];
  importantDates: ImportantDate[];
  uploadedFiles: File[];
  timeframe: string;
  studyFrequency: string;
  customDescription?: string;
}

// Centralized schema for project creation to prevent drift
export interface ProjectCreateInput {
  name: string;
  project_type: "school" | "self_study";
  study_frequency?: string;
  start_date?: string;
  end_date?: string;
  is_draft?: boolean;
  important_dates?: Array<{ title: string; date: string }>;
  // Mock mode flags for backend AI mocking
  mock_mode?: boolean;
  seed_syllabus?: boolean;
  seed_tests?: boolean;
  seed_content?: boolean;
  seed_flashcards?: boolean;
}

// Validation function to ensure payload consistency
export function validateProjectCreateInput(input: any): ProjectCreateInput {
  const {
    name,
    project_type,
    study_frequency,
    start_date,
    end_date,
    is_draft,
    important_dates,
    mock_mode,
    seed_syllabus,
    seed_tests,
    seed_content,
    seed_flashcards,
    // Explicitly ignore deprecated fields
    purpose,
    goal,
    collaboration,
    learningStyle,
    studyPreference,
    learningDifficulties,
    evaluationTypes,
    courseType,
    assessmentType,
    ...rest
  } = input;

  // Log any unexpected fields for debugging
  if (Object.keys(rest).length > 0) {
    console.warn('Unexpected fields in project creation payload:', Object.keys(rest));
  }

  return {
    name: name || '',
    project_type: project_type || 'school',
    study_frequency,
    start_date,
    end_date,
    is_draft: is_draft ?? true,
    important_dates,
    mock_mode: mock_mode ?? false,
    seed_syllabus: seed_syllabus ?? true,
    seed_tests: seed_tests ?? true,
    seed_content: seed_content ?? true,
    seed_flashcards: seed_flashcards ?? false,
  };
}

export interface ProjectType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface ImportantDate {
  date: string;
  description: string;
  type: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  canSkip?: boolean;
  skipText?: string;
}

export interface PurposeOption {
  value: string;
  label: string;
  description: string;
}

export interface EducationLevelOption {
  value: string;
  label: string;
  description: string;
}

export interface GradeLevelOption {
  value: string;
  label: string;
}

export interface TimelineOption {
  value: string;
  label: string;
  description: string;
}

export interface FrequencyOption {
  value: string;
  label: string;
  description: string;
}

export interface CollaborationOption {
  value: string;
  label: string;
  description: string;
}

export interface EvaluationTypeOption {
  value: string;
  label: string;
  description: string;
  icon: any;
}

export interface TestTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface DateTypeOption {
  value: string;
  label: string;
  color: string;
}

// Add missing exports for self-study component
export const projectIcons = {
  book: "📚",
  flask: "🧪",
  calculator: "🧮",
  globe: "🌍",
  heart: "❤️",
  star: "⭐",
  rocket: "🚀",
  lightbulb: "💡",
};

export const projectColors = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  red: "bg-red-500",
};
