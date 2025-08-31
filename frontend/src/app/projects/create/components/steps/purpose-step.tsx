"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioCardGroup, type RadioCardOption } from "./shared";

interface PurposeStepProps {
  purpose: string;
  onPurposeChange: (purpose: string) => void;
}

export function PurposeStep({
  purpose,
  onPurposeChange,
}: PurposeStepProps) {
  const purposeOptions = [
    { value: 'good-grades', label: 'Good Grades', description: 'Achieve high academic performance' },
    { value: 'personal-interest', label: 'Personal Interest', description: 'Learn for personal growth and curiosity' },
    { value: 'career-development', label: 'Career Development', description: 'Advance your professional skills' },
    { value: 'custom', label: 'Custom Purpose', description: 'Define your own specific purpose' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {purposeOptions.map((option) => (
          <div 
            key={option.value} 
            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
              purpose === option.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onPurposeChange(option.value)}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{option.label}</div>
              <p className="text-xs text-gray-600 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
