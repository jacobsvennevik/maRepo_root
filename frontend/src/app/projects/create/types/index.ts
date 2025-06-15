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