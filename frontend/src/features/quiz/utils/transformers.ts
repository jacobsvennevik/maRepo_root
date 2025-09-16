/**
 * Quiz Data Transformation Utilities
 * 
 * Transforms backend API responses to frontend data formats,
 * following the established patterns from Flashcards and Files.
 */

import type {
  DiagnosticSession,
  DiagnosticQuestion,
  DiagnosticResponse,
  DiagnosticAnalytics,
  QuizSession,
  QuizQuestion,
  QuizResponse,
  QuizAnalytics,
  QuizChoice,
  QuizSessionStatus,
  QuizQuestionType,
  BloomLevel
} from '../types';

/**
 * Transform backend DiagnosticSession to frontend QuizSession
 */
export function transformSession(backendSession: DiagnosticSession): QuizSession {
  return {
    id: backendSession.id,
    projectId: backendSession.project,
    title: backendSession.title || 'Quiz Session',
    topic: backendSession.topic,
    status: mapBackendStatus(backendSession.status),
    deliveryMode: backendSession.delivery_mode,
    maxQuestions: backendSession.max_questions,
    timeLimitSec: backendSession.time_limit_sec,
    createdAt: new Date(backendSession.created_at),
    updatedAt: new Date(backendSession.updated_at),
    createdBy: backendSession.created_by,
    seed: backendSession.seed,
    
    // Computed fields (will be populated by the service)
    questionCount: undefined,
    completionRate: undefined,
    averageScore: undefined,
    lastAccessed: undefined
  };
}

/**
 * Transform backend DiagnosticQuestion to frontend QuizQuestion
 */
export function transformQuestion(backendQuestion: DiagnosticQuestion): QuizQuestion {
  return {
    id: backendQuestion.id,
    sessionId: backendQuestion.session,
    type: mapBackendQuestionType(backendQuestion.type),
    text: backendQuestion.text,
    choices: backendQuestion.choices?.map((choice, index) => ({
      id: String.fromCharCode(65 + index), // A, B, C, D
      text: choice,
      isCorrect: index === backendQuestion.correct_choice_index
    })),
    correctChoiceIndex: backendQuestion.correct_choice_index,
    acceptableAnswers: backendQuestion.acceptable_answers,
    explanation: backendQuestion.explanation,
    difficulty: backendQuestion.difficulty,
    bloomLevel: backendQuestion.bloom_level,
    conceptId: backendQuestion.concept_id,
    tags: backendQuestion.tags || [],
    
    // UI state (will be populated during quiz session)
    userAnswer: undefined,
    isCorrect: undefined,
    timeTakenSec: undefined,
    isAnswered: false
  };
}

/**
 * Transform backend DiagnosticResponse to frontend QuizResponse
 */
export function transformResponse(backendResponse: DiagnosticResponse): QuizResponse {
  return {
    id: backendResponse.id,
    sessionId: backendResponse.session,
    questionId: backendResponse.question,
    userAnswer: backendResponse.user_answer,
    isCorrect: backendResponse.is_correct,
    timeTakenSec: backendResponse.time_taken_sec,
    submittedAt: new Date(backendResponse.submitted_at)
  };
}

/**
 * Transform backend DiagnosticAnalytics to frontend QuizAnalytics
 */
export function transformAnalytics(backendAnalytics: DiagnosticAnalytics): QuizAnalytics {
  const score = Math.round(backendAnalytics.accuracy_percentage);
  const grade = calculateGrade(score);
  const timeEfficiency = calculateTimeEfficiency(backendAnalytics.average_time_per_question);
  
  return {
    id: backendAnalytics.id,
    sessionId: backendAnalytics.session,
    totalQuestions: backendAnalytics.total_questions,
    correctAnswers: backendAnalytics.correct_answers,
    accuracyPercentage: backendAnalytics.accuracy_percentage,
    averageTimePerQuestion: backendAnalytics.average_time_per_question,
    totalTimeTaken: backendAnalytics.total_time_taken,
    completedAt: new Date(backendAnalytics.completed_at),
    
    // Computed fields
    score,
    grade,
    timeEfficiency
  };
}

/**
 * Map backend status to frontend status
 */
function mapBackendStatus(backendStatus: string): QuizSessionStatus {
  const statusMap: Record<string, QuizSessionStatus> = {
    'DRAFT': 'draft',
    'ACTIVE': 'active',
    'COMPLETED': 'completed',
    'ARCHIVED': 'archived'
  };
  
  return statusMap[backendStatus] || 'draft';
}

/**
 * Map backend question type to frontend question type
 */
function mapBackendQuestionType(backendType: string): QuizQuestionType {
  const typeMap: Record<string, QuizQuestionType> = {
    'MCQ': 'multiple_choice',
    'SHORT_ANSWER': 'short_answer',
    'PRINCIPLE': 'principle'
  };
  
  return typeMap[backendType] || 'short_answer';
}

/**
 * Calculate letter grade based on percentage score
 */
function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate time efficiency based on average time per question
 */
function calculateTimeEfficiency(avgTimePerQuestion: number): 'fast' | 'normal' | 'slow' {
  if (avgTimePerQuestion <= 30) return 'fast';
  if (avgTimePerQuestion <= 60) return 'normal';
  return 'slow';
}

/**
 * Transform multiple sessions at once
 */
export function transformSessions(backendSessions: DiagnosticSession[]): QuizSession[] {
  return backendSessions.map(transformSession);
}

/**
 * Transform multiple questions at once
 */
export function transformQuestions(backendQuestions: DiagnosticQuestion[]): QuizQuestion[] {
  return backendQuestions.map(transformQuestion);
}

/**
 * Transform multiple responses at once
 */
export function transformResponses(backendResponses: DiagnosticResponse[]): QuizResponse[] {
  return backendResponses.map(transformResponse);
}

/**
 * Calculate session statistics
 */
export function calculateSessionStats(session: QuizSession, responses: QuizResponse[]): {
  questionCount: number;
  completionRate: number;
  averageScore: number;
  lastAccessed?: Date;
} {
  const questionCount = session.maxQuestions;
  const answeredQuestions = responses.length;
  const completionRate = questionCount > 0 ? (answeredQuestions / questionCount) * 100 : 0;
  const correctAnswers = responses.filter(r => r.isCorrect).length;
  const averageScore = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const lastAccessed = responses.length > 0 
    ? new Date(Math.max(...responses.map(r => r.submittedAt.getTime())))
    : undefined;

  return {
    questionCount,
    completionRate,
    averageScore,
    lastAccessed
  };
}

/**
 * Calculate project-level statistics
 */
export function calculateProjectStats(sessions: QuizSession[]): {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
} {
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const sessionsWithScores = sessions.filter(s => s.averageScore !== undefined);
  const averageScore = sessionsWithScores.length > 0
    ? sessionsWithScores.reduce((sum, s) => sum + (s.averageScore || 0), 0) / sessionsWithScores.length
    : 0;
  const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeLimitSec || 0), 0);

  return {
    totalSessions,
    completedSessions,
    averageScore,
    totalTimeSpent
  };
}

/**
 * Validate quiz session data
 */
export function validateSession(session: Partial<QuizSession>): string[] {
  const errors: string[] = [];
  
  if (!session.title || session.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!session.maxQuestions || session.maxQuestions < 1) {
    errors.push('Must have at least 1 question');
  }
  
  if (session.maxQuestions && session.maxQuestions > 50) {
    errors.push('Cannot have more than 50 questions');
  }
  
  if (session.timeLimitSec && session.timeLimitSec < 60) {
    errors.push('Time limit must be at least 60 seconds');
  }
  
  return errors;
}

/**
 * Validate quiz question data
 */
export function validateQuestion(question: Partial<QuizQuestion>): string[] {
  const errors: string[] = [];
  
  if (!question.text || question.text.trim().length === 0) {
    errors.push('Question text is required');
  }
  
  if (question.type === 'multiple_choice') {
    if (!question.choices || question.choices.length < 2) {
      errors.push('Multiple choice questions must have at least 2 choices');
    }
    if (question.correctChoiceIndex === undefined) {
      errors.push('Must specify correct choice for multiple choice questions');
    }
  }
  
  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push('Explanation is required');
  }
  
  return errors;
}

/**
 * Format time duration for display
 */
export function formatDuration(seconds: number): string {
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
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: QuizSessionStatus): string {
  const colorMap: Record<QuizSessionStatus, string> = {
    draft: 'gray',
    active: 'blue',
    completed: 'green',
    archived: 'orange'
  };
  
  return colorMap[status] || 'gray';
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return 'green';
  if (difficulty <= 3) return 'yellow';
  if (difficulty <= 4) return 'orange';
  return 'red';
}

/**
 * Get bloom level description
 */
export function getBloomLevelDescription(level: BloomLevel): string {
  const descriptions: Record<BloomLevel, string> = {
    Remember: 'Recall facts and basic concepts',
    Understand: 'Explain ideas or concepts',
    Apply: 'Use information in new situations',
    Analyze: 'Draw connections among ideas',
    Evaluate: 'Justify decisions or courses of action',
    Create: 'Produce new or original work'
  };
  
  return descriptions[level];
}
