/**
 * Step constants for project creation wizard
 */

export const PROJECT_STEPS = [
  'projectName',
  'educationLevel', 
  'uploadSyllabus',
  'extractionResults',
  'courseContentUpload',
  'testUpload',
] as const;

export type StepKey = typeof PROJECT_STEPS[number];

export const STEP_LABELS: Record<StepKey, string> = {
  projectName: 'Project Name',
  educationLevel: 'Education Level',
  uploadSyllabus: 'Upload Syllabus',
  extractionResults: 'Review Extracted Data',
  courseContentUpload: 'Upload Course Content',
  testUpload: 'Upload Test Materials',
};

export const STEP_DESCRIPTIONS: Record<StepKey, string> = {
  projectName: 'Give your project a name',
  educationLevel: 'Select your education level',
  uploadSyllabus: 'Upload your course syllabus',
  extractionResults: 'Review and confirm extracted information',
  courseContentUpload: 'Upload additional course materials',
  testUpload: 'Upload test and exam materials',
};

export const REQUIRED_STEPS: StepKey[] = [
  'projectName',
  'educationLevel',
];

export const OPTIONAL_STEPS: StepKey[] = [
  'uploadSyllabus',
  'extractionResults', 
  'courseContentUpload',
  'testUpload',
];

export default {
  PROJECT_STEPS,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  REQUIRED_STEPS,
  OPTIONAL_STEPS,
};
