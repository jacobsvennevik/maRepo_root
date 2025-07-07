// Shared UI components for upload steps
import React from 'react';

interface TestModeBannerProps {
  testId?: string;
}

export function TestModeBanner({ testId = "test-mode-banner" }: TestModeBannerProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3" data-testid={testId}>
      <div className="flex items-center space-x-2">
        <span className="text-yellow-600 text-sm">🧪</span>
        <span className="text-yellow-800 text-sm font-medium">Test Mode Active</span>
      </div>
      <p className="text-yellow-700 text-xs mt-1">
        Using mock data for test analysis. Set NEXT_PUBLIC_TEST_MODE=false to disable.
      </p>
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  testId?: string;
}

export function ErrorMessage({ message, testId = "error-message" }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3" data-testid={testId}>
      <div className="flex items-center space-x-2">
        <span className="text-red-600 text-sm">⚠️</span>
        <span className="text-red-800 text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
  filesCount: number;
  children?: React.ReactNode;
  testId?: string;
  className?: string;
}

export function AnalyzeButton({ 
  onClick, 
  isAnalyzing, 
  disabled, 
  filesCount, 
  children,
  testId = "analyze-button",
  className = "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
}: AnalyzeButtonProps) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled || isAnalyzing}
        className={className}
        data-testid={testId}
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing {filesCount} file{filesCount !== 1 ? 's' : ''}...
          </>
        ) : (
          children || `Analyze ${filesCount} file${filesCount !== 1 ? 's' : ''}`
        )}
      </button>
    </div>
  );
} 