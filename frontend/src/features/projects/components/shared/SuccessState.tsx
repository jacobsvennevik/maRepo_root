'use client';

import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  showSparkles?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function SuccessState({ 
  title, 
  message,
  icon,
  showSparkles = false,
  size = 'md',
  className,
  children
}: SuccessStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 text-center",
      className
    )}>
      <div className="relative mb-4">
        {icon || (
          <div className={cn(
            "bg-green-100 rounded-full flex items-center justify-center",
            sizeClasses[size]
          )}>
            <CheckCircle className={cn(
              "text-green-600",
              size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-10 h-10'
            )} />
          </div>
        )}
        {showSparkles && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className={cn(
          "font-semibold text-gray-900",
          textSizes[size]
        )}>
          {title}
        </h3>
        {message && (
          <p className={cn(
            "text-gray-600",
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {message}
          </p>
        )}
      </div>

      {children && (
        <div className="mt-4 w-full">
          {children}
        </div>
      )}
    </div>
  );
}

export function AnimatedSuccess({ 
  title, 
  message, 
  onComplete,
  duration = 2000 
}: { 
  title: string; 
  message?: string; 
  onComplete?: () => void;
  duration?: number;
}) {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div className="animate-in fade-in duration-500">
      <SuccessState 
        title={title}
        message={message}
        showSparkles={true}
        size="lg"
      />
    </div>
  );
} 