import React from "react";
import { Button } from "@/components/ui/button";

interface SkipButtonProps {
  onSkip: () => void;
  text?: string;
  className?: string;
  disabled?: boolean;
}

export function SkipButton({
  onSkip,
  text = "Skip",
  className = "",
  disabled = false,
}: SkipButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onSkip}
      disabled={disabled}
      className={`text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 ${className}`}
      data-testid="skip-button"
    >
      {text}
    </Button>
  );
}
