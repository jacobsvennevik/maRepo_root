import { ProjectSetup } from '../types';
import { SETUP_STEPS } from '../constants';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const isStepComplete = (stepId: string, setup: ProjectSetup): boolean => {
  switch (stepId) {
    case 'projectName':
      return !!setup.projectName.trim();
    case 'purpose':
      return !!setup.purpose;
    case 'testLevel':
      return !!setup.testLevel;
    case 'assignmentDescription':
      return setup.purpose === 'school' ? (!!setup.assignmentDescription || setup.courseFiles.length > 0) : true;
    case 'evaluationTypes':
      return setup.purpose === 'school' ? setup.evaluationTypes.length > 0 : true;
    case 'testUpload':
      return setup.purpose === 'school' ? (setup.selectedTestTypes.length > 0 || setup.testFiles.length > 0) : true;
    case 'importantDates':
      return setup.purpose === 'school' ? setup.importantDates.length > 0 : true;
    case 'uploadFiles':
      return (setup.uploadedFiles || []).length > 0;
    case 'timeframe':
      return !!setup.timeframe;
    case 'goal':
      return !!setup.goal;
    case 'studyFrequency':
      return !!setup.studyFrequency;
    case 'collaboration':
      return !!setup.collaboration;
    default:
      return false;
  }
};

export const shouldShowStep = (stepId: string, setup: ProjectSetup): boolean => {
  if (stepId === 'assignmentDescription' || stepId === 'evaluationTypes' || stepId === 'testUpload' || stepId === 'importantDates') {
    return setup.purpose === 'school';
  }
  return true;
};

export const getCurrentStepIndex = (currentStep: number, setup: ProjectSetup): number => {
  let actualStep = 0;
  for (let i = 0; i <= currentStep; i++) {
    if (shouldShowStep(SETUP_STEPS[i].id, setup)) {
      actualStep++;
    }
  }
  return actualStep;
};

export const getTotalSteps = (setup: ProjectSetup): number => {
  return SETUP_STEPS.filter(step => shouldShowStep(step.id, setup)).length;
};

export * from './ai-analysis';
export * from './formatters';
export * from './file-helpers'; 