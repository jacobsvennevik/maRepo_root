/**
 * Quiz Center TypeScript Interfaces
 * 
 * Comprehensive type definitions following the established patterns
 * from Flashcards and Files features.
 */

// ============================================================================
// Backend API Types (matching backend models)
// ============================================================================

export interface DiagnosticSession {
  id: string;
  project: string;
  title: string;
  topic?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  delivery_mode: 'IMMEDIATE' | 'DEFERRED';
  max_questions: number;
  time_limit_sec?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  seed?: number;
}

export interface DiagnosticQuestion {
  id: string;
  session: string;
  type: 'MCQ' | 'SHORT_ANSWER' | 'PRINCIPLE';
  text: string;
  choices?: string[];
  correct_choice_index?: number;
  acceptable_answers?: string[];
  explanation: string;
  difficulty: number;
  bloom_level: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
  concept_id: string;
  tags?: string[];
}

export interface DiagnosticResponse {
  id: string;
  session: string;
  question: string;
  user_answer: string;
  is_correct: boolean;
  time_taken_sec?: number;
  submitted_at: string;
}

export interface DiagnosticAnalytics {
  id: string;
  session: string;
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_time_per_question: number;
  total_time_taken: number;
  completed_at: string;
}

// ============================================================================
// Frontend Data Types (transformed for UI)
// ============================================================================

export interface QuizSession {
  id: string;
  projectId: string;
  title: string;
  topic?: string;
  status: QuizSessionStatus;
  deliveryMode: 'IMMEDIATE' | 'DEFERRED';
  maxQuestions: number;
  timeLimitSec?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  seed?: number;
  
  // Computed fields
  questionCount?: number;
  completionRate?: number;
  averageScore?: number;
  lastAccessed?: Date;
}

export type QuizSessionStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface QuizQuestion {
  id: string;
  sessionId: string;
  type: QuizQuestionType;
  text: string;
  choices?: QuizChoice[];
  correctChoiceIndex?: number;
  acceptableAnswers?: string[];
  explanation: string;
  difficulty: number;
  bloomLevel: BloomLevel;
  conceptId: string;
  tags?: string[];
  
  // UI state
  userAnswer?: string;
  isCorrect?: boolean;
  timeTakenSec?: number;
  isAnswered?: boolean;
}

export type QuizQuestionType = 'multiple_choice' | 'short_answer' | 'principle';
export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export interface QuizChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizResponse {
  id: string;
  sessionId: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTakenSec?: number;
  submittedAt: Date;
}

export interface QuizAnalytics {
  id: string;
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  averageTimePerQuestion: number;
  totalTimeTaken: number;
  completedAt: Date;
  
  // Additional computed fields
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timeEfficiency: 'fast' | 'normal' | 'slow';
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateQuizSessionRequest {
  project: string;
  topic?: string;
  source_ids?: string[];
  question_mix?: Record<string, number>;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  delivery_mode: 'IMMEDIATE' | 'DEFERRED';
  max_questions: number;
  time_limit_sec?: number;
}

export interface UpdateQuizSessionRequest {
  title?: string;
  topic?: string;
  status?: QuizSessionStatus;
  delivery_mode?: 'IMMEDIATE' | 'DEFERRED';
  time_limit_sec?: number;
}

export interface StartQuizSessionResponse {
  session_id: string;
  questions: QuizQuestion[];
  time_limit_sec?: number;
  delivery_mode: string;
}

export interface SubmitQuizAnswerRequest {
  question_id: string;
  user_answer: string;
  time_taken_sec?: number;
}

export interface SubmitQuizAnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;
  score?: number;
}

export interface QuizSessionListResponse {
  results: DiagnosticSession[];
  count: number;
  next?: string;
  previous?: string;
}

// ============================================================================
// State Management Types
// ============================================================================

export interface QuizCenterState {
  sessions: QuizSession[];
  currentSession?: QuizSession;
  currentQuestions?: QuizQuestion[];
  analytics?: QuizAnalytics;
  
  // Loading states
  loading: boolean;
  loadingSessions: boolean;
  loadingSession: boolean;
  loadingQuestions: boolean;
  submittingAnswer: boolean;
  generatingQuiz: boolean;
  
  // Error states
  error: string | null;
  sessionError: string | null;
  questionsError: string | null;
  submissionError: string | null;
  
  // UI state
  selectedSessionId?: string;
  currentQuestionIndex: number;
  sessionStarted: boolean;
  sessionCompleted: boolean;
  
  // Stats
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface QuizSessionFilters {
  status?: QuizSessionStatus[];
  difficulty?: string[];
  topic?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface QuizSessionSort {
  field: 'created_at' | 'title' | 'status' | 'completion_rate' | 'average_score';
  direction: 'asc' | 'desc';
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface QuizCenterProps {
  projectId: string;
}

export interface QuizSessionCardProps {
  session: QuizSession;
  onStart: (sessionId: string) => void;
  onEdit: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onViewAnalytics: (sessionId: string) => void;
}

export interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  timeLimitSec?: number;
  showExplanation?: boolean;
}

export interface QuizAnalyticsCardProps {
  analytics: QuizAnalytics;
  session: QuizSession;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface QuizStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTimeSpent: number;
  accuracyTrend: Array<{
    date: string;
    accuracy: number;
  }>;
  difficultyDistribution: Record<string, number>;
  topicDistribution: Record<string, number>;
}

export interface QuizRecommendations {
  suggestedTopics: string[];
  difficultyAdjustment: 'increase' | 'decrease' | 'maintain';
  focusAreas: string[];
  studyTips: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export interface QuizError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type QuizErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';
