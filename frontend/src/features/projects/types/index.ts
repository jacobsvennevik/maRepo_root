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
  // Additional properties used in guided setup
  purpose?: string;
  goal?: string;
  collaboration?: string;
  learningStyle?: string[] | string;
  studyPreference?: string[] | string;
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
  // File uploads
  course_files?: any[];
  test_files?: any[];
  uploaded_files?: any[];
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
    course_files,
    test_files,
    uploaded_files,
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
    course_files,
    test_files,
    uploaded_files,
    mock_mode: mock_mode ?? false,
    seed_syllabus: seed_syllabus ?? true,
    seed_tests: seed_tests ?? true,
    seed_content: seed_content ?? true,
    seed_flashcards: seed_flashcards ?? false,
  };
}

// Project V2 interface based on mock data structure
export interface ProjectV2 {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  type: string;
  progress: number;
  collaborators: number;
  kind?: "school" | "self_study";
  school_meta?: SchoolMeta;
  self_study_meta?: SelfStudyMeta;
}

// API Response types for project creation and fetching
export interface ProjectApiResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface SchoolMeta {
  grade_level?: string;
  course_name?: string;
  instructor?: string;
}

export interface SelfStudyMeta {
  topics?: string[];
  goals?: string[];
  learning_style?: string;
}

export type ProjectType = "biology" | "chemistry" | "physics" | "math" | "computer-science" | "literature" | "history" | "geography" | string;

export interface ProjectTypeInfo {
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
  biology: "🧬",
  chemistry: "🧪",
  physics: "⚛️",
  math: "🧮",
  "computer-science": "💻",
  default: "📚",
};

export const projectColors = {
  biology: "bg-green-500",
  chemistry: "bg-blue-500",
  physics: "bg-purple-500",
  math: "bg-orange-500",
  "computer-science": "bg-indigo-500",
  default: "bg-gray-500",
};
