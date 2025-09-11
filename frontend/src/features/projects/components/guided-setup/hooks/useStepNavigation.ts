import { useState, useCallback } from 'react';
import { STEP_CONFIG } from '../constants';
import { ProjectSetup } from './useGuidedSetupState';

export const useStepNavigation = (setup: ProjectSetup, onBack: () => void, extractedData?: any) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentStepData = STEP_CONFIG[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;

  // Calculate effective step count accounting for skipped steps
  const getEffectiveStepCount = useCallback(() => {
    let count = STEP_CONFIG.length;
    // Subtract 1 if extraction results step should be skipped
    if (!extractedData) {
      count--;
    }
    return count;
  }, [extractedData]);

  const isLastStep = currentStepIndex === getEffectiveStepCount() - 1;

  const getCurrentStepIndex = useCallback(() => {
    let effectiveIndex = currentStepIndex + 1;
    // Subtract 1 if we've passed the extraction results step and it was skipped
    if (!extractedData && currentStepIndex > STEP_CONFIG.findIndex(step => step.id === 'extractionResults')) {
      effectiveIndex--;
    }
    return effectiveIndex;
  }, [currentStepIndex, extractedData]);
  const getTotalSteps = useCallback(() => getEffectiveStepCount(), [getEffectiveStepCount]);

  const progress = ((currentStepIndex + 1) / getEffectiveStepCount()) * 100;

  const isStepComplete = useCallback(() => {
    const stepId = currentStepData.id;
    
    switch (stepId) {
      case 'projectName':
        console.log('Checking projectName completion:', setup.projectName, 'trimmed:', setup.projectName.trim(), 'result:', !!setup.projectName.trim());
        return !!setup.projectName.trim();
      case 'purpose':
        return !!setup.purpose;
      case 'educationLevel':
        return !!setup.testLevel;
      case 'uploadSyllabus':
        return !!extractedData; // Complete if syllabus was uploaded and processed
      case 'extractionResults':
        return !!extractedData; // Only complete if there's extracted data
      case 'courseContentUpload':
        return !!setup.courseFiles && setup.courseFiles.length > 0; // Complete if course files were uploaded
      case 'testUpload':
        return !!setup.testFiles && setup.testFiles.length > 0; // Complete if test files were uploaded
      case 'learningPreferences':
        const hasLearningStyle = Array.isArray(setup.learningStyle) 
          ? setup.learningStyle.length > 0 
          : !!setup.learningStyle;
        const hasStudyPreference = Array.isArray(setup.studyPreference) 
          ? setup.studyPreference.length > 0 
          : !!setup.studyPreference;
        return hasLearningStyle && hasStudyPreference;
      case 'timeframe':
        return !!setup.timeframe;
      case 'goal':
        return !!setup.goal;
      case 'studyFrequency':
        return !!setup.studyFrequency;
      case 'collaboration':
        return !!setup.collaboration;
      default:
        return true;
    }
  }, [currentStepData.id, setup]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setShowSummary(true);
    } else {
      let nextIndex = currentStepIndex + 1;
      
      // Skip extraction results step if no data was extracted
      if (STEP_CONFIG[nextIndex]?.id === 'extractionResults' && !extractedData) {
        nextIndex++;
      }
      
      setCurrentStepIndex(nextIndex);
    }
  }, [isLastStep, currentStepIndex, extractedData]);

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      onBack();
    } else {
      let prevIndex = currentStepIndex - 1;
      
      // Skip extraction results step if no data was extracted
      if (STEP_CONFIG[prevIndex]?.id === 'extractionResults' && !extractedData) {
        prevIndex--;
      }
      
      setCurrentStepIndex(prevIndex);
    }
  }, [isFirstStep, onBack, currentStepIndex, extractedData]);

  const handleSkip = useCallback(() => {
    // Skip logic is the same as next for now, but we could add specific skip behavior here
    // For example, we could mark the step as skipped in the state
    handleNext();
  }, [handleNext]);

  const canSkipCurrentStep = useCallback(() => {
    return currentStepData.canSkip === true;
  }, [currentStepData]);

  const handleBackWithCleanup = useCallback(() => {
    if (isFirstStep) {
      onBack();
    } else {
      handleBack();
    }
  }, [isFirstStep, onBack, handleBack]);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    currentStepData,
    isFirstStep,
    isLastStep,
    showSummary,
    setShowSummary,
    progress,
    getCurrentStepIndex,
    getTotalSteps,
    isStepComplete,
    handleNext,
    handleBack,
    handleSkip,
    handleBackWithCleanup,
    canSkipCurrentStep,
  };
}; 