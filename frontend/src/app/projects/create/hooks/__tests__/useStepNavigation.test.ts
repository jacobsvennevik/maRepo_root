import { renderHook, act } from '@testing-library/react';
import { useStepNavigation } from '../useStepNavigation';
import { SETUP_STEPS } from '../../constants/steps';
import { createMockProjectSetup } from '../../../../../test-utils/test-helpers';

describe('useStepNavigation', () => {
  const mockSetup = createMockProjectSetup();
  const onBack = jest.fn();
  const setShowSummary = jest.fn();

  it('initializes with first step', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStep).toEqual(SETUP_STEPS[0]);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('navigates to next step correctly', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    act(() => {
      result.current.handleNext();
    });
    
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentStep).toEqual(SETUP_STEPS[1]);
    expect(result.current.isFirstStep).toBe(false);
  });

  it('navigates to previous step correctly', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Go to step 2
    act(() => {
      result.current.handleNext();
    });
    
    // Go back to step 1
    act(() => {
      result.current.handlePrevious();
    });
    
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStep).toEqual(SETUP_STEPS[0]);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('identifies last step correctly', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Navigate to last step - wrap each handleNext in its own act()
    for (let i = 0; i < SETUP_STEPS.length - 1; i++) {
      act(() => {
        result.current.handleNext();
      });
    }
    
    expect(result.current.currentStepIndex).toBe(SETUP_STEPS.length - 1);
    expect(result.current.isLastStep).toBe(true);
  });

  it('does not go beyond last step', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Navigate past last step - wrap each handleNext in its own act()
    for (let i = 0; i < SETUP_STEPS.length + 5; i++) {
      act(() => {
        result.current.handleNext();
      });
    }
    
    expect(result.current.currentStepIndex).toBe(SETUP_STEPS.length - 1);
    expect(result.current.isLastStep).toBe(true);
  });

  it('does not go before first step', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Try to go before first step
    act(() => {
      result.current.handlePrevious();
      result.current.handlePrevious();
      result.current.handlePrevious();
    });
    
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    expect(result.current.progress).toBe(0);
    
    act(() => {
      result.current.handleNext();
    });
    
    const expectedProgress = (1 / (SETUP_STEPS.length - 1)) * 100;
    expect(result.current.progress).toBe(expectedProgress);
  });

  it('validates step transitions for uploadFiles to extractionResults', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Navigate to uploadFiles step (step index 3) - wrap each handleNext in its own act()
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleNext();
      });
    }
    
    expect(result.current.currentStep.id).toBe('uploadFiles');
    
    // Navigate to next step (should be extractionResults)
    act(() => {
      result.current.handleNext();
    });
    
    expect(result.current.currentStep.id).toBe('extractionResults');
  });

  it('validates step transitions for extractionResults to courseContentUpload', () => {
    const { result } = renderHook(() => useStepNavigation(mockSetup, onBack, setShowSummary));
    
    // Navigate to extractionResults step (step index 4) - wrap each handleNext in its own act()
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.handleNext();
      });
    }
    
    expect(result.current.currentStep.id).toBe('extractionResults');
    
    // Navigate to next step (should be courseContentUpload)
    act(() => {
      result.current.handleNext();
    });
    
    expect(result.current.currentStep.id).toBe('courseContentUpload');
  });

  it('has all expected steps in correct order', () => {
    const expectedStepIds = [
      'projectName',
      'purpose',
      'educationLevel',
      'uploadFiles',
      'extractionResults',
      'courseContentUpload',
      'courseContentReview',
      'testUpload',
      'testExtractionResults',
      'timeframe',
      'goal',
      'studyFrequency',
      'collaboration'
    ];
    
    expect(SETUP_STEPS.map(step => step.id)).toEqual(expectedStepIds);
  });
}); 