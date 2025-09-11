import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGuidedSetupState } from './hooks/useGuidedSetupState';
import { useStepNavigation } from './hooks/useStepNavigation';
import { ProjectSummaryColorful } from '@/features/projects';
import { StepIndicator } from './components/StepIndicator';
import { STEP_CONFIG } from './constants';

import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';

// Import step components
import { 
  ProjectNameStep,
  EducationLevelStep,
  SyllabusUploadStep,
  ExtractionResultsStep,
  CourseContentUploadStep,
  TestUploadStep
} from '@/features/projects';
import { SkipButton } from '@/features/projects';

interface GuidedSetupProps {
  onBack: () => void;
}

export default function GuidedSetup({ onBack }: GuidedSetupProps) {
  const {
    setup,
    extractedData,
    setExtractedData,
    syllabusFileName,
    isSyllabusAnalysisComplete,
    setHasUnsavedChanges,
    handleOptionSelect,
    handleSyllabusUploadComplete,
    handleCourseContentUploadComplete,
    handleTestUploadComplete,
    resetSyllabusUploadState,
  } = useGuidedSetupState();

  const {
    currentStepIndex,
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
  } = useStepNavigation(setup, onBack, extractedData);

  // Keyboard navigation
  useKeyboardNavigation({
    onNext: handleNext,
    onBack: handleBackWithCleanup,
    onSkip: handleSkip,
    canGoNext: isStepComplete(),
    canGoBack: !isFirstStep,
    canSkip: canSkipCurrentStep() && !isStepComplete(),
    enabled: !showSummary
  });

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'projectName':
        return (
          <ProjectNameStep
            projectName={setup.projectName}
            onProjectNameChange={(value: string) => handleOptionSelect('projectName', value)}
          />
        );
      case 'educationLevel':
        return (
          <EducationLevelStep
            testLevel={setup.testLevel}
            onTestLevelChange={(value: string) => handleOptionSelect('testLevel', value)}
          />
        );
      case 'uploadSyllabus':
        return (
          <SyllabusUploadStep
            onUploadComplete={handleSyllabusUploadComplete}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            hasUploadCompleted={isSyllabusAnalysisComplete}
            onResetUploadState={resetSyllabusUploadState}
          />
        );
      case 'extractionResults':
        if (!extractedData) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">No extraction results to review.</p>
              <Button onClick={handleNext} className="mt-4">
                Continue
              </Button>
            </div>
          );
        }
        return (
          <ExtractionResultsStep
            extractedData={extractedData}
            fileName={syllabusFileName}
            onConfirm={handleNext}
            onSave={(updatedData: any) => {
              // Update the extracted data with the edited version
              setExtractedData(updatedData);
              setHasUnsavedChanges(true);
            }}
            onEdit={() => {
              // Go back to upload step
              handleBack();
            }}
            showNavigation={true}
          />
        );
      case 'courseContentUpload':
        return (
          <CourseContentUploadStep
            onUploadComplete={handleCourseContentUploadComplete}
          />
        );
      case 'testUpload':
        return (
          <TestUploadStep
            onUploadComplete={handleTestUploadComplete}
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Unknown step.</p>
            <Button onClick={handleNext} className="mt-4">
              Continue
            </Button>
          </div>
        );
    }
  };

  if (showSummary) {
    return <ProjectSummaryColorful setup={setup} onBack={() => setShowSummary(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={handleBackWithCleanup} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* hasUnsavedChanges removed */}
            <div className="text-xs sm:text-sm text-gray-600">
              Step {getCurrentStepIndex()} of {getTotalSteps()}
            </div>
            <KeyboardShortcuts />
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator 
          steps={STEP_CONFIG}
          currentStepIndex={currentStepIndex}
          completedSteps={[]} // TODO: Track completed steps
          skippedSteps={!extractedData ? ['extractionResults'] : []}
        />
        


        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
            <span className="text-xs sm:text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <currentStepData.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900" data-testid="step-title">{currentStepData.title}</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">{currentStepData.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between pt-4 sm:pt-6">
              <Button variant="outline" onClick={handleBackWithCleanup} className="text-sm">
                {isFirstStep ? 'Back to Selection' : 'Previous'}
              </Button>
              <div className="flex gap-2">
                {canSkipCurrentStep() && (
                  <SkipButton
                    onSkip={handleSkip}
                    text={currentStepData.skipText || "Skip"}
                    disabled={false}
                  />
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm"
                >
                  {isLastStep ? 'Review & Create' : 'Next'}
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}