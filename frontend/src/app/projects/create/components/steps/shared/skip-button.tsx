import React from 'react';

interface SkipButtonProps {
  onSkip: () => void;
  text?: string;
  className?: string;
}

export function SkipButton({ 
  onSkip, 
  text = "Skip - I don't have materials to upload",
  className = "px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
}: SkipButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <button
        onClick={onSkip}
        className={className}
        data-testid="skip-button"
      >
        {text}
      </button>
    </div>
  );
} 