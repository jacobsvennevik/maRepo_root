'use client';

import React from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
}

export function StepIndicator({ 
  steps, 
  currentStepIndex, 
  completedSteps, 
  skippedSteps 
}: StepIndicatorProps) {
  return (
    <div className="hidden lg:block mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isSkipped = skippedSteps.includes(step.id);
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  {
                    "bg-green-500 border-green-500 text-white": isCompleted,
                    "bg-gray-100 border-gray-300 text-gray-400": isSkipped,
                    "bg-blue-500 border-blue-500 text-white": isCurrent,
                    "bg-gray-200 border-gray-300 text-gray-600": isPast && !isCompleted && !isSkipped,
                    "bg-white border-gray-300 text-gray-400": index > currentStepIndex,
                  }
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isSkipped ? (
                    <span className="text-xs font-medium">-</span>
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center max-w-24">
                  <div className={cn(
                    "text-xs font-medium transition-colors",
                    {
                      "text-green-600": isCompleted,
                      "text-gray-400": isSkipped || index > currentStepIndex,
                      "text-blue-600": isCurrent,
                      "text-gray-600": isPast && !isCompleted && !isSkipped,
                    }
                  )}>
                    {step.title}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  {
                    "bg-green-500": isCompleted,
                    "bg-gray-200": !isCompleted,
                  }
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
} 