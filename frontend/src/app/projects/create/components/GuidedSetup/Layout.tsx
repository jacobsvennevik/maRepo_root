import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ProgressBar } from './ProgressBar';

interface GuidedSetupLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  progress: number;
  canGoBack: boolean;
  canGoNext: boolean;
  canSkip: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
}

export function GuidedSetupLayout({
  children,
  currentStep,
  totalSteps,
  progress,
  canGoBack,
  canGoNext,
  canSkip,
  onBack,
  onNext,
  onSkip,
  nextButtonText = 'Next',
  skipButtonText = 'Skip'
}: GuidedSetupLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <ProgressBar progress={progress} />
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {children}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 sm:pt-6 mt-8">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={!canGoBack}
            className="text-sm"
          >
            {currentStep === 1 ? 'Back to Selection' : 'Previous'}
          </Button>
          <div className="flex gap-2">
            {canSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip}
                className="text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                {skipButtonText}
              </Button>
            )}
            <Button 
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm"
            >
              {nextButtonText}
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 