/**
 * Quiz Feature Utilities
 * 
 * Shared utility functions for the quiz feature to improve code reuse
 * and maintainability.
 */

import { DIFFICULTY_LEVELS, TIME_PER_QUESTION, QUESTION_MIX_RATIOS, GRADE_THRESHOLDS, TIME_EFFICIENCY_THRESHOLDS } from '../constants';

// ============================================================================
// File Handling Utilities
// ============================================================================

export const getFileIcon = (fileName: string, fileType?: string) => {
  const extension = fileType || fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: Record<string, string> = {
    pdf: 'text-red-500',
    docx: 'text-blue-500',
    doc: 'text-blue-500',
    txt: 'text-gray-500',
    jpg: 'text-green-500',
    jpeg: 'text-green-500',
    png: 'text-green-500',
    tsx: 'text-purple-500',
    ts: 'text-purple-500',
    js: 'text-purple-500',
    jsx: 'text-purple-500',
    html: 'text-orange-500',
    css: 'text-orange-500',
  };
  
  return iconMap[extension || ''] || 'text-gray-500';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension || '');
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

// ============================================================================
// Quiz Configuration Utilities
// ============================================================================

export const getDifficultySuggestions = (topic: string): string => {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('basic') || topicLower.includes('intro') || topicLower.includes('fundamental')) {
    return DIFFICULTY_LEVELS.BEGINNER;
  }
  
  if (topicLower.includes('advanced') || topicLower.includes('expert') || topicLower.includes('research')) {
    return DIFFICULTY_LEVELS.ADVANCED;
  }
  
  if (topicLower.includes('master') || topicLower.includes('phd') || topicLower.includes('doctoral')) {
    return DIFFICULTY_LEVELS.EXPERT;
  }
  
  return DIFFICULTY_LEVELS.INTERMEDIATE;
};

export const getSuggestedTimeLimit = (maxQuestions: number, difficulty: string): number => {
  const baseTimePerQuestion = TIME_PER_QUESTION[difficulty as keyof typeof TIME_PER_QUESTION] || 90;
  return maxQuestions * baseTimePerQuestion;
};

export const getSuggestedQuestionMix = (maxQuestions: number, difficulty: string) => {
  const ratio = QUESTION_MIX_RATIOS[difficulty as keyof typeof QUESTION_MIX_RATIOS] || QUESTION_MIX_RATIOS[DIFFICULTY_LEVELS.INTERMEDIATE];
  
  return {
    MCQ: Math.round(maxQuestions * ratio.MCQ),
    SHORT_ANSWER: Math.round(maxQuestions * ratio.SHORT_ANSWER),
    PRINCIPLE: Math.round(maxQuestions * ratio.PRINCIPLE),
  };
};

export const getQuestionMixTotal = (questionMix: any): number => {
  if (!questionMix) return 0;
  return (questionMix.MCQ || 0) + (questionMix.SHORT_ANSWER || 0) + (questionMix.PRINCIPLE || 0);
};

export const validateQuestionMix = (questionMix: any, maxQuestions: number): boolean => {
  if (!questionMix) return true;
  return getQuestionMixTotal(questionMix) === maxQuestions;
};

// ============================================================================
// Scoring and Analytics Utilities
// ============================================================================

export const calculateGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
};

export const calculateTimeEfficiency = (avgTimePerQuestion: number): 'fast' | 'normal' | 'slow' => {
  if (avgTimePerQuestion <= TIME_EFFICIENCY_THRESHOLDS.FAST) return 'fast';
  if (avgTimePerQuestion <= TIME_EFFICIENCY_THRESHOLDS.NORMAL) return 'normal';
  return 'slow';
};

export const calculateAccuracy = (correctAnswers: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

export const calculateAverageScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

// ============================================================================
// Time and Duration Utilities
// ============================================================================

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatTimeLimit = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

export const parseTimeLimit = (minutes: number): number => {
  return minutes * 60;
};

export const getTimeRemaining = (startTime: Date, timeLimitSec: number): number => {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  return Math.max(0, timeLimitSec - elapsed);
};

// ============================================================================
// Validation Utilities
// ============================================================================

export const validateQuizTitle = (title: string): string[] => {
  const errors: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  return errors;
};

export const validateQuizTopic = (topic: string): string[] => {
  const errors: string[] = [];
  
  if (!topic || topic.trim().length === 0) {
    errors.push('Topic is required');
  } else if (topic.length > 200) {
    errors.push('Topic must be less than 200 characters');
  }
  
  return errors;
};

export const validateQuestionCount = (count: number): string[] => {
  const errors: string[] = [];
  
  if (count < 1) {
    errors.push('Must have at least 1 question');
  } else if (count > 50) {
    errors.push('Cannot have more than 50 questions');
  }
  
  return errors;
};

export const validateTimeLimit = (seconds: number): string[] => {
  const errors: string[] = [];
  
  if (seconds < 60) {
    errors.push('Time limit must be at least 60 seconds');
  } else if (seconds > 7200) {
    errors.push('Time limit cannot exceed 2 hours');
  }
  
  return errors;
};

// ============================================================================
// UI Utilities
// ============================================================================

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'gray',
    active: 'blue',
    completed: 'green',
    archived: 'orange',
  };
  
  return colorMap[status] || 'gray';
};

export const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 2) return 'green';
  if (difficulty <= 3) return 'yellow';
  if (difficulty <= 4) return 'orange';
  return 'red';
};

export const getBloomLevelDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    Remember: 'Recall facts and basic concepts',
    Understand: 'Explain ideas or concepts',
    Apply: 'Use information in new situations',
    Analyze: 'Draw connections among ideas',
    Evaluate: 'Justify decisions or courses of action',
    Create: 'Produce new or original work',
  };
  
  return descriptions[level] || 'Unknown level';
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// Test Mode Utilities
// ============================================================================

export const isTestModeActive = (): boolean => {
  // Check if running in test environment
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  // Check for explicit test mode flag in development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  // Check for localhost and test mode
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  return false;
};

// ============================================================================
// Data Transformation Utilities
// ============================================================================

export const deriveTitleFromSource = (method: string, uploadedFiles: File[], selectedFiles: any[]): string => {
  if (method === 'files') {
    if (uploadedFiles.length > 0) {
      const base = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
      return `${base} Quiz`;
    }
    const picked = selectedFiles.find(f => f.id);
    if (picked) {
      const base = picked.name.replace(/\.[^.]+$/, '');
      return `${base} Quiz`;
    }
  }
  return '';
};

export const generateQuizId = (): string => {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// ============================================================================
// Local Storage Utilities
// ============================================================================

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
};
