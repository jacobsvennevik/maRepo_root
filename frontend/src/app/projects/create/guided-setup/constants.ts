import { CalendarDays, BookOpen, Target, Users, Clock, TrendingUp } from 'lucide-react';
import { ProjectNameStep } from '../components/steps/project-name-step';
import { EducationLevelStep } from '../components/steps/education-level-step';
import { SyllabusUploadStep } from '../components/steps/syllabus-upload-step';
import { ExtractionResultsStep } from '../components/steps/extraction-results-step';
import { CourseContentUploadStep } from '../components/steps/course-content-upload-step';
import { TestUploadStep } from '../components/steps/test-upload-step';

export type StepKey = 'projectName' | 'educationLevel' | 'uploadSyllabus' | 'extractionResults' | 'courseContentUpload' | 'testUpload';

export const STEPS = [
  {
    key: 'projectName' as StepKey,
    id: 'projectName',
    title: 'Project Name',
    description: 'Give your study project a memorable name',
    icon: BookOpen,
    canSkip: false,
    Component: ProjectNameStep,
  },
  {
    key: 'educationLevel' as StepKey,
    id: 'educationLevel',
    title: 'Education Level',
    description: 'What level of education is this for?',
    icon: TrendingUp,
    canSkip: false,
    Component: EducationLevelStep,
  },
  {
    key: 'uploadSyllabus' as StepKey,
    id: 'uploadSyllabus',
    title: 'Upload Syllabus',
    description: 'Upload your course syllabus for AI analysis',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
    Component: SyllabusUploadStep,
  },
  {
    key: 'extractionResults' as StepKey,
    id: 'extractionResults',
    title: 'Review Analysis',
    description: 'Review and confirm the extracted information',
    icon: BookOpen,
    canSkip: false,
    Component: ExtractionResultsStep,
  },
  {
    key: 'courseContentUpload' as StepKey,
    id: 'courseContentUpload',
    title: 'Upload Course Materials',
    description: 'Upload additional course materials for analysis',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
    Component: CourseContentUploadStep,
  },
  {
    key: 'testUpload' as StepKey,
    id: 'testUpload',
    title: 'Upload Tests',
    description: 'Upload previous tests and exams',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
    Component: TestUploadStep,
  },
];

// Legacy STEP_CONFIG for backward compatibility (deprecated)
export const STEP_CONFIG = STEPS.map(({ Component, ...config }) => config);

export const TIMEFRAME_OPTIONS = [
  { value: '1_week', label: '1 Week', icon: CalendarDays },
  { value: '2_weeks', label: '2 Weeks', icon: CalendarDays },
  { value: '1_month', label: '1 Month', icon: CalendarDays },
  { value: '2_months', label: '2 Months', icon: CalendarDays },
  { value: '3_months', label: '3 Months', icon: CalendarDays },
  { value: '6_months', label: '6 Months', icon: CalendarDays },
  { value: '1_year', label: '1 Year', icon: CalendarDays },
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', icon: Clock },
  { value: '2_3_times_week', label: '2-3 times per week', icon: Clock },
  { value: 'weekly', label: 'Weekly', icon: Clock },
  { value: 'biweekly', label: 'Bi-weekly', icon: Clock },
  { value: 'monthly', label: 'Monthly', icon: Clock },
];

export const DEFAULTS = {
  projectName: '',
  testLevel: '',
  timeframe: '',
  studyFrequency: '',
  uploadedFiles: [],
  importantDates: [],
  courseFiles: [],
  testFiles: [],
  is_draft: true,
}; 