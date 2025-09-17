/**
 * Quiz Feature Constants
 * 
 * Centralized constants for the quiz feature to improve maintainability
 * and reduce code duplication.
 */

// ============================================================================
// Quiz Configuration Constants
// ============================================================================

export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_TIME_LIMIT_SEC: 60,
  MAX_TIME_LIMIT_SEC: 7200, // 2 hours
  DEFAULT_TIME_LIMIT_SEC: 900, // 15 minutes
  DEFAULT_MAX_QUESTIONS: 10,
} as const;

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE', 
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export const QUIZ_TYPES = {
  FORMATIVE: 'formative',
  SUMMATIVE: 'summative',
  DIAGNOSTIC: 'diagnostic',
  MASTERY: 'mastery',
} as const;

export const DELIVERY_MODES = {
  IMMEDIATE: 'IMMEDIATE',
  DEFERRED: 'DEFERRED',
} as const;

export const QUESTION_TYPES = {
  MCQ: 'MCQ',
  SHORT_ANSWER: 'SHORT_ANSWER',
  PRINCIPLE: 'PRINCIPLE',
} as const;

export const QUIZ_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const WIZARD_STEPS = {
  METHOD_SELECTION: 1,
  BASIC_CONFIG: 2,
  QUIZ_CONFIG: 3,
  SOURCE_CONFIG: 4,
  ADVANCED_CONFIG: 5,
  GENERATE_QUIZ: 6,
  REVIEW_CREATE: 7,
} as const;

export const TOTAL_WIZARD_STEPS = 7;

export const FILE_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  DOC: 'doc',
  TXT: 'txt',
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  TSX: 'tsx',
  TS: 'ts',
  JS: 'js',
  JSX: 'jsx',
  HTML: 'html',
  CSS: 'css',
} as const;

// ============================================================================
// Form Field Options
// ============================================================================

export const DIFFICULTY_OPTIONS = [
  { 
    value: DIFFICULTY_LEVELS.BEGINNER, 
    label: 'Beginner', 
    description: 'Basic concepts and recall' 
  },
  { 
    value: DIFFICULTY_LEVELS.INTERMEDIATE, 
    label: 'Intermediate', 
    description: 'Application and understanding' 
  },
  { 
    value: DIFFICULTY_LEVELS.ADVANCED, 
    label: 'Advanced', 
    description: 'Analysis and synthesis' 
  },
  { 
    value: DIFFICULTY_LEVELS.EXPERT, 
    label: 'Expert', 
    description: 'Complex problem solving' 
  },
] as const;

export const QUIZ_TYPE_OPTIONS = [
  {
    value: QUIZ_TYPES.FORMATIVE,
    label: 'Formative Practice',
    description: 'Learning-focused with immediate feedback'
  },
  {
    value: QUIZ_TYPES.SUMMATIVE,
    label: 'Summative Exam',
    description: 'Assessment-focused with measurement'
  },
  {
    value: QUIZ_TYPES.DIAGNOSTIC,
    label: 'Diagnostic Pre-test',
    description: 'Prior knowledge mapping'
  },
  {
    value: QUIZ_TYPES.MASTERY,
    label: 'Mastery Check',
    description: 'High-bar competency verification'
  },
] as const;

export const DELIVERY_MODE_OPTIONS = [
  { 
    value: DELIVERY_MODES.IMMEDIATE, 
    label: 'Immediate Feedback', 
    description: 'Show results after each question' 
  },
  { 
    value: DELIVERY_MODES.DEFERRED, 
    label: 'Deferred Feedback', 
    description: 'Show results after completing the quiz' 
  },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
] as const;

export const TEST_STYLE_OPTIONS = [
  { value: '', label: 'Default Style' },
  { value: 'academic', label: 'Academic' },
  { value: 'practical', label: 'Practical' },
  { value: 'conceptual', label: 'Conceptual' },
] as const;

// ============================================================================
// Time and Scoring Constants
// ============================================================================

export const TIME_PER_QUESTION = {
  [DIFFICULTY_LEVELS.BEGINNER]: 60,    // 1 minute per question
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 90, // 1.5 minutes per question
  [DIFFICULTY_LEVELS.ADVANCED]: 120,   // 2 minutes per question
  [DIFFICULTY_LEVELS.EXPERT]: 150,     // 2.5 minutes per question
} as const;

export const QUESTION_MIX_RATIOS = {
  [DIFFICULTY_LEVELS.BEGINNER]: { MCQ: 0.6, SHORT_ANSWER: 0.3, PRINCIPLE: 0.1 },
  [DIFFICULTY_LEVELS.INTERMEDIATE]: { MCQ: 0.4, SHORT_ANSWER: 0.4, PRINCIPLE: 0.2 },
  [DIFFICULTY_LEVELS.ADVANCED]: { MCQ: 0.3, SHORT_ANSWER: 0.4, PRINCIPLE: 0.3 },
  [DIFFICULTY_LEVELS.EXPERT]: { MCQ: 0.2, SHORT_ANSWER: 0.3, PRINCIPLE: 0.5 },
} as const;

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
} as const;

export const TIME_EFFICIENCY_THRESHOLDS = {
  FAST: 30,    // seconds
  NORMAL: 60,  // seconds
  SLOW: 61,    // seconds and above
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Cannot exceed ${max}`,
  INVALID_NUMBER: 'Please enter a valid number',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You don\'t have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  DIAGNOSTIC_SESSIONS: 'diagnostic-sessions/',
  DIAGNOSTICS: 'diagnostics/',
  QUIZZES_GENERATE: 'quizzes/generate/',
  SESSION_START: (sessionId: string) => `diagnostic-sessions/${sessionId}/start/`,
  SESSION_QUESTIONS: (sessionId: string) => `diagnostic-sessions/${sessionId}/questions/`,
  SESSION_RESPONSES: (sessionId: string) => `diagnostic-sessions/${sessionId}/responses/`,
  SESSION_ANALYTICS: (sessionId: string) => `diagnostic-sessions/${sessionId}/analytics/`,
  SESSION_STATS: 'diagnostic-sessions/stats/',
  BULK_DELETE: 'diagnostic-sessions/bulk-delete/',
  BULK_UPDATE: 'diagnostic-sessions/bulk-update/',
  TODAY_SESSIONS: 'diagnostic-sessions/today/',
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  QUIZ_DRAFT: 'quiz-draft',
  QUIZ_SETTINGS: 'quiz-settings',
  QUIZ_PROGRESS: 'quiz-progress',
  QUIZ_PREFERENCES: 'quiz-preferences',
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_QUIZ_CONFIG = {
  difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
  delivery_mode: DELIVERY_MODES.IMMEDIATE,
  max_questions: QUIZ_CONFIG.DEFAULT_MAX_QUESTIONS,
  time_limit_sec: QUIZ_CONFIG.DEFAULT_TIME_LIMIT_SEC,
  language: 'en',
  source_type: 'auto',
  allow_retakes: true,
  show_hints: false,
  randomize_questions: true,
  randomize_choices: true,
  track_analytics: true,
  require_explanation: true,
  question_mix: {
    MCQ: 4,
    SHORT_ANSWER: 4,
    PRINCIPLE: 2,
  },
} as const;
