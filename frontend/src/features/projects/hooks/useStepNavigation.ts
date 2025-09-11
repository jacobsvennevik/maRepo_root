'use client';

import { useState } from "react";
import { SETUP_STEPS } from "../services/steps";
import { ProjectSetup } from "../types";

export const useStepNavigation = (
  setup: ProjectSetup,
  onBack: () => void,
  setShowSummary: (show: boolean) => void,
  extractedData?: any | null, // Add extractedData parameter
) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const shouldShowStep = (stepId: string) => {
    // Skip extraction results step if no data was extracted
    if (stepId === "extractionResults" && !extractedData) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    // Find next step that should be shown
    let nextStep = currentStepIndex + 1;

    // Skip steps that shouldn't be shown
    while (
      nextStep < SETUP_STEPS.length &&
      !shouldShowStep(SETUP_STEPS[nextStep].id)
    ) {
      nextStep++;
    }

    if (nextStep < SETUP_STEPS.length) {
      setCurrentStepIndex(nextStep);
    } else if (currentStepIndex === SETUP_STEPS.length - 1) {
      // Only call setShowSummary when trying to go beyond the last step
      // and we're already at the last step
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    // Find previous step that should be shown
    let prevStep = currentStepIndex - 1;

    // Skip steps that shouldn't be shown
    while (prevStep >= 0 && !shouldShowStep(SETUP_STEPS[prevStep].id)) {
      prevStep--;
    }

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
    return SETUP_STEPS.filter((step) => shouldShowStep(step.id)).length;
  };

  const totalSteps = getTotalSteps();
  const currentStepNumber = getCurrentStepIndex();
  const progress =
    totalSteps > 1 ? ((currentStepNumber - 1) / (totalSteps - 1)) * 100 : 0;

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
