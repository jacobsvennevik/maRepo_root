'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const COMMON_FOCUS_AREAS = [
  'Mathematics',
  'Science',
  'Programming',
  'Language Learning',
  'History',
  'Literature',
  'Art & Design',
  'Music',
  'Business',
  'Technology',
  'Health & Fitness',
  'Cooking',
  'Photography',
  'Writing',
  'Philosophy',
  'Psychology'
];

interface FocusAreasStepProps {
  focusAreas: string[];
  onFocusAreaToggle: (area: string) => void;
}

export function FocusAreasStep({ focusAreas, onFocusAreaToggle }: FocusAreasStepProps) {
  const [customArea, setCustomArea] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddCustomArea = () => {
    if (customArea.trim() && !focusAreas.includes(customArea.trim())) {
      onFocusAreaToggle(customArea.trim());
      setCustomArea('');
      setShowCustomInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomArea();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">What topics will you focus on?</h3>
        <p className="text-slate-600 text-sm">Select the main areas you want to learn about</p>
      </div>

      {/* Common Focus Areas */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Common Focus Areas</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {COMMON_FOCUS_AREAS.map((area) => (
            <Card
              key={area}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                focusAreas.includes(area)
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => onFocusAreaToggle(area)}
            >
              <CardContent className="p-3 text-center">
                <span className={`text-sm font-medium ${
                  focusAreas.includes(area) ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {area}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Focus Areas */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Custom Focus Areas</h4>
        
        {/* Selected Custom Areas */}
        {focusAreas.filter(area => !COMMON_FOCUS_AREAS.includes(area)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {focusAreas
              .filter(area => !COMMON_FOCUS_AREAS.includes(area))
              .map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{area}</span>
                  <button
                    onClick={() => onFocusAreaToggle(area)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Add Custom Area */}
        {!showCustomInput ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Focus Area
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter custom focus area..."
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={handleAddCustomArea}
              disabled={!customArea.trim()}
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setCustomArea('');
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {focusAreas.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-2">
            Selected {focusAreas.length} focus area{focusAreas.length !== 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <span
                key={area}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 