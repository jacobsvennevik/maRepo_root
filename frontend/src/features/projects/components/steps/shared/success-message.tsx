import React from "react";

interface SuccessMessageProps {
  message?: string;
  className?: string;
}

export function SuccessMessage({
  message = 'Analysis completed successfully! Click "Next" to continue.',
  className = "flex items-center justify-center p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800",
}: SuccessMessageProps) {
  return (
    <div className={className} role="alert">
      <svg
        className="flex-shrink-0 inline w-4 h-4 me-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  );
}
