import { renderHook, act } from "@testing-library/react";
import { useStepNavigation } from "../useStepNavigation";
import { SETUP_STEPS } from "../../services/steps";
import { createMockProjectSetup } from "../../../../../test-utils/test-helpers";

describe("useStepNavigation", () => {
  const mockSetup = createMockProjectSetup();
  const onBack = jest.fn();
  const setShowSummary = jest.fn();

  it("initializes with first step", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStep).toEqual(SETUP_STEPS[0]);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it("skips extraction results step when no extracted data is provided", () => {
    const { result } = renderHook(
      () => useStepNavigation(mockSetup, onBack, setShowSummary, null), // No extracted data
    );

    // Navigate to uploadSyllabus step (step index 3)
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStep.id).toBe("uploadSyllabus");

    // Navigate to next step - should skip extractionResults and go to courseContentUpload
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep.id).toBe("courseContentUpload");
  });

  it("shows extraction results step when extracted data is available", () => {
    const mockExtractedData = { courseName: "Test Course", topics: [] };
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary, mockExtractedData),
    );

    // Navigate to uploadSyllabus step (step index 3)
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStep.id).toBe("uploadSyllabus");

    // Navigate to next step - should show extractionResults
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep.id).toBe("extractionResults");
  });

  it("handles backward navigation correctly when extraction results is skipped", () => {
    const { result } = renderHook(
      () => useStepNavigation(mockSetup, onBack, setShowSummary, null), // No extracted data
    );

    // Navigate to courseContentUpload (skipping extractionResults)
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStep.id).toBe("courseContentUpload");

    // Navigate back - should skip extractionResults and go to uploadSyllabus
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentStep.id).toBe("uploadSyllabus");
  });

  it("calculates correct progress when steps are skipped", () => {
    const { result } = renderHook(
      () => useStepNavigation(mockSetup, onBack, setShowSummary, null), // No extracted data
    );

    const totalStepsWithoutExtraction = SETUP_STEPS.length - 1; // Minus extractionResults

    // Navigate through a few steps
    act(() => {
      result.current.handleNext(); // step 1
    });

    const expectedProgress = (1 / (totalStepsWithoutExtraction - 1)) * 100;
    expect(result.current.progress).toBe(expectedProgress);
  });

  it("shouldShowStep returns false for extractionResults when no data", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary, null),
    );

    expect(result.current.shouldShowStep("extractionResults")).toBe(false);
    expect(result.current.shouldShowStep("uploadSyllabus")).toBe(true);
    expect(result.current.shouldShowStep("learningPreferences")).toBe(true);
  });

  it("shouldShowStep returns true for extractionResults when data is available", () => {
    const mockExtractedData = { courseName: "Test Course", topics: [] };
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary, mockExtractedData),
    );

    expect(result.current.shouldShowStep("extractionResults")).toBe(true);
  });

  it("navigates to next step correctly", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.currentStep).toEqual(SETUP_STEPS[1]);
    expect(result.current.isFirstStep).toBe(false);
  });

  it("navigates to previous step correctly", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

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

  it("identifies last step correctly", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

    // Navigate to last step - wrap each handleNext in its own act()
    for (let i = 0; i < SETUP_STEPS.length - 1; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStepIndex).toBe(SETUP_STEPS.length - 1);
    expect(result.current.isLastStep).toBe(true);
  });

  it("does not go beyond last step", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

    // Navigate past last step - wrap each handleNext in its own act()
    for (let i = 0; i < SETUP_STEPS.length + 5; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStepIndex).toBe(SETUP_STEPS.length - 1);
    expect(result.current.isLastStep).toBe(true);
  });

  it("does not go before first step", () => {
    const { result } = renderHook(() =>
      useStepNavigation(mockSetup, onBack, setShowSummary),
    );

    // Try to go before first step
    act(() => {
      result.current.handlePrevious();
      result.current.handlePrevious();
      result.current.handlePrevious();
    });

    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
  });

  it("calculates progress correctly", () => {
    const mockExtractedData = { courseName: "Test Course", topics: [] };
    const { result } = renderHook(
      () =>
        useStepNavigation(mockSetup, onBack, setShowSummary, mockExtractedData), // With extracted data for normal flow
    );

    expect(result.current.progress).toBe(0);

    act(() => {
      result.current.handleNext();
    });

    const expectedProgress = (1 / (SETUP_STEPS.length - 1)) * 100;
    expect(result.current.progress).toBe(expectedProgress);
  });

  it("validates step transitions for uploadSyllabus to extractionResults", () => {
    const mockExtractedData = { courseName: "Test Course", topics: [] };
    const { result } = renderHook(
      () =>
        useStepNavigation(mockSetup, onBack, setShowSummary, mockExtractedData), // With extracted data
    );

    // Navigate to uploadSyllabus step (step index 3)
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStep.id).toBe("uploadSyllabus");

    // Navigate to next step (should be extractionResults when data is available)
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep.id).toBe("extractionResults");
  });

  it("validates step transitions for extractionResults to learningPreferences", () => {
    const mockExtractedData = { courseName: "Test Course", topics: [] };
    const { result } = renderHook(
      () =>
        useStepNavigation(mockSetup, onBack, setShowSummary, mockExtractedData), // With extracted data
    );

    // Navigate to extractionResults step (step index 4)
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentStep.id).toBe("extractionResults");

    // Navigate to next step (should be learningPreferences)
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep.id).toBe("courseContentUpload");
  });

  it("has all expected steps in correct order", () => {
    const expectedStepIds = [
      "projectName",
      "purpose",
      "educationLevel",
      "uploadSyllabus",
      "extractionResults",
      "courseContentUpload",
      "testUpload",
      "learningPreferences",
      "timeframe",
      "goal",
      "studyFrequency",
      "collaboration",
    ];

    expect(SETUP_STEPS.map((step) => step.id)).toEqual(expectedStepIds);
  });
});
