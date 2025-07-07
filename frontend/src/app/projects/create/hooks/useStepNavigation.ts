import { useState } from 'react';
import { SETUP_STEPS } from '../constants/steps';
import { ProjectSetup } from '../types';

export const useStepNavigation = (
  setup: ProjectSetup, 
  onBack: () => void, 
  setShowSummary: (show: boolean) => void
) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const shouldShowStep = (_stepId: string) => true;

  const handleNext = () => {
    const nextStep = currentStepIndex + 1;
    
    if (nextStep < SETUP_STEPS.length) {
      setCurrentStepIndex(nextStep);
    } else if (currentStepIndex === SETUP_STEPS.length - 1) {
      // Only call setShowSummary when trying to go beyond the last step
      // and we're already at the last step
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    const prevStep = currentStepIndex - 1;
    
    if (prevStep >= 0) {
      setCurrentStepIndex(prevStep);
    } else {
      onBack();
    }
  };

  const handlePrevious = handleBack; // Alias for tests

  // Functions for component use (these are called as functions in the UI)
  const getCurrentStepIndex = () => {
    let actualStep = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
      if (shouldShowStep(SETUP_STEPS[i].id)) {
        actualStep++;
      }
    }
    return actualStep;
  };

  const getTotalSteps = () => {
    return SETUP_STEPS.filter(step => shouldShowStep(step.id)).length;
  };

  const totalSteps = getTotalSteps();
  const currentStepNumber = getCurrentStepIndex();
  const progress = totalSteps > 1 ? ((currentStepNumber - 1) / (totalSteps - 1)) * 100 : 0;

  const currentStep = SETUP_STEPS[currentStepIndex]; // Return step object
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === SETUP_STEPS.length - 1;

  return {
    currentStepIndex, // Return the actual step index for tests (0-based)
    currentStep, // Return step object for tests
    setCurrentStep: setCurrentStepIndex,
    handleNext,
    handleBack,
    handlePrevious,
    shouldShowStep,
    getCurrentStepIndex, // Return function for component use (1-based display)
    getTotalSteps, // Return function for component use
    progress,
    currentStepData: currentStep, // Keep for backward compatibility
    isFirstStep,
    isLastStep,
  };
}; 