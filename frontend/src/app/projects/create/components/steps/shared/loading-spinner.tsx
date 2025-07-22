import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function LoadingSpinner({ 
  message = "AI is analyzing your materials...",
  subMessage = "This may take a few moments",
  className = "text-center p-4 bg-blue-50 rounded-lg"
}: LoadingSpinnerProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-blue-600">{message}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subMessage}</p>
    </div>
  );
} 