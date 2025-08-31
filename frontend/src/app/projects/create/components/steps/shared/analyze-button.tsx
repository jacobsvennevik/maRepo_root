import React from "react";

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing?: boolean;
  disabled?: boolean;
  filesCount: number;
  className?: string;
}

export function AnalyzeButton({
  onClick,
  isAnalyzing = false,
  disabled = false,
  filesCount,
  className = "px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
}: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className={className}
      data-testid="analyze-button"
    >
      🔍 Analyze {filesCount} {filesCount === 1 ? "File" : "Files"}
    </button>
  );
}
