export interface ProjectSetup {
  projectName: string;
  purpose: string;
  testLevel: string;
  gradeLevel?: string;
  assignmentDescription?: string;
  courseFiles: File[];
  evaluationTypes: string[];
  testFiles: File[];
  importantDates: ImportantDate[];
  uploadedFiles: File[];
  timeframe: string;
  goal: string;
  studyFrequency: string;
  collaboration: string;
  customDescription?: string;
  // Learning preferences fields - now support both single values and arrays
  courseType: string | string[];
  learningStyle: string | string[];
  assessmentType: string | string[];
  studyPreference: string | string[];
  learningDifficulties: string;
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
