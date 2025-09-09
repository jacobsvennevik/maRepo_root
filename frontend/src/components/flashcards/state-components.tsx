// Shared UI components for flashcard states
import React from 'react';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { LOADING_STATE_CONFIG, ERROR_STATE_CONFIG, EMPTY_STATE_CONFIG } from './constants';

interface StateDisplayProps {
  className?: string;
}

export function LoadingState({ className }: StateDisplayProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className || ''}`}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">{LOADING_STATE_CONFIG.message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ error, className }: StateDisplayProps & { error: string }) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className || ''}`}>
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-2">{ERROR_STATE_CONFIG.title}</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    </div>
  );
}

export function EmptyState({ className }: StateDisplayProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className || ''}`}>
      <div className="text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{EMPTY_STATE_CONFIG.title}</h3>
        <p className="text-gray-600">{EMPTY_STATE_CONFIG.description}</p>
      </div>
    </div>
  );
}
