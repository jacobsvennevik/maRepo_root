'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  showSpinner?: boolean;
  showSparkles?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  message = 'Loading...', 
  subMessage,
  showSpinner = true,
  showSparkles = false,
  size = 'md',
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
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
        {showSpinner && (
          <Loader2 className={cn(
            "animate-spin text-blue-600",
            sizeClasses[size]
          )} />
        )}
        {showSparkles && (
          <Sparkles className={cn(
            "animate-pulse text-purple-500",
            sizeClasses[size]
          )} />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className={cn(
          "font-medium text-gray-900",
          textSizes[size]
        )}>
          {message}
        </h3>
        {subMessage && (
          <p className={cn(
            "text-gray-600",
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {subMessage}
          </p>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

export function FullScreenLoading({ message, subMessage }: { message?: string; subMessage?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <LoadingState 
        message={message || 'Setting up your project...'}
        subMessage={subMessage || 'This will just take a moment'}
        size="lg"
        showSparkles={true}
      />
    </div>
  );
} 