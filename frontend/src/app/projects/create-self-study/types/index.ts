export interface SelfStudyProjectSetup {
  projectName: string;
  purpose: string;
  focusAreas: string[];
  customFocusArea?: string;
  learningMaterials: LearningMaterial[];
  timeframe: string;
  studyFrequency: string;
  learningGoal: string;
  subGoals?: string[];
  collaboration: string;
  collaborators?: string;
  customDescription?: string;
}

export interface LearningMaterial {
  id: string;
  type: 'file' | 'link';
  name: string;
  url?: string;
  file?: File;
  size?: number;
}

export interface FocusAreaOption {
  value: string;
  label: string;
  description: string;
  icon: any;
  category: string;
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