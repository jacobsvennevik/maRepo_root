import { useState } from 'react';
import { SETUP_STEPS } from '../constants';
import { ProjectSetup } from '../types';

export const useStepNavigation = (
  setup: ProjectSetup, 
  onBack: () => void, 
  setShowSummary: (show: boolean) => void
) => {
  const [currentStep, setCurrentStep] = useState(0);

  const shouldShowStep = (stepId: string) => {
    if (stepId === 'courseDetails' || stepId === 'testTimeline') {
      return setup.purpose === 'school';
    }
    return true;
  };

  const handleNext = () => {
    let nextStep = currentStep + 1;
    while (nextStep < SETUP_STEPS.length && !shouldShowStep(SETUP_STEPS[nextStep].id)) {
      nextStep++;
    }
    
    if (nextStep < SETUP_STEPS.length) {
      setCurrentStep(nextStep);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    while (prevStep >= 0 && !shouldShowStep(SETUP_STEPS[prevStep].id)) {
      prevStep--;
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    } else {
      onBack();
    }
  };

  const getCurrentStepIndex = () => {
    let actualStep = 0;
    for (let i = 0; i <= currentStep; i++) {
      if (shouldShowStep(SETUP_STEPS[i].id)) {
        actualStep++;
      }
    }
    return actualStep;
  };

  const getTotalSteps = () => {
    return SETUP_STEPS.filter(step => shouldShowStep(step.id)).length;
  };

  const progress = (getCurrentStepIndex() / getTotalSteps()) * 100;

  const currentStepData = SETUP_STEPS[currentStep];

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handleBack,
    shouldShowStep,
    getCurrentStepIndex,
    getTotalSteps,
    progress,
    currentStepData,
  };
}; 