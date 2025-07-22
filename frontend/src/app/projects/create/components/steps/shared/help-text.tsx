import React from 'react';
import { HelpCircle } from "lucide-react";

interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpText({ children, className = "text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg" }: HelpTextProps) {
  return (
    <div className={className}>
      <HelpCircle className="inline h-4 w-4 mr-1" />
      {children}
    </div>
  );
} 