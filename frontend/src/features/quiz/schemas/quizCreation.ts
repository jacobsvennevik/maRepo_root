/**
 * Quiz Creation Schema
 * 
 * Comprehensive Zod schema for quiz creation following the established
 * patterns from the flashcard wizard.
 */

import { z } from 'zod';

// ============================================================================
// Core Quiz Configuration Schema
// ============================================================================

export const QuizCreationSchema = z.object({
  // Basic Information
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  topic: z.string()
    .min(1, 'Topic is required')
    .max(200, 'Topic must be less than 200 characters')
    .optional(),

  // Quiz Configuration
  quiz_type: z.enum(['formative', 'summative', 'diagnostic', 'mastery'])
    .default('formative'),
  
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .default('INTERMEDIATE'),
  
  delivery_mode: z.enum(['IMMEDIATE', 'DEFERRED'])
    .default('IMMEDIATE'),
  
  max_questions: z.number()
    .min(1, 'Must have at least 1 question')
    .max(50, 'Cannot have more than 50 questions')
    .default(10),
  
  time_limit_sec: z.number()
    .min(60, 'Time limit must be at least 60 seconds')
    .max(7200, 'Time limit cannot exceed 2 hours')
    .optional(),

  // Question Mix Configuration
  question_mix: z.object({
    MCQ: z.number().min(0).max(50).default(0),
    SHORT_ANSWER: z.number().min(0).max(50).default(0),
    PRINCIPLE: z.number().min(0).max(50).default(0),
  }).refine(
    (mix) => mix.MCQ + mix.SHORT_ANSWER + mix.PRINCIPLE > 0,
    'At least one question type must be selected'
  ).optional(),

  // Source Configuration
  source_type: z.enum(['auto', 'files', 'manual'])
    .default('auto'),
  
  source_ids: z.array(z.string()).optional(),
  
  uploaded_files: z.array(z.instanceof(File)).optional(),
  
  selected_existing_file_ids: z.array(z.union([z.string(), z.number()])).optional(),

  // Advanced Configuration
  language: z.string().default('en'),
  
  scheduled_for: z.date().optional(),
  
  due_at: z.date().optional(),
  
  // Test Style Configuration (following diagnostic pattern)
  test_style: z.string().nullable().optional(),
  
  style_config_override: z.record(z.any()).optional(),

  // Validation and Constraints
  allow_retakes: z.boolean().default(true),
  
  show_hints: z.boolean().default(false),
  
  randomize_questions: z.boolean().default(true),
  
  randomize_choices: z.boolean().default(true),
  
  // Analytics and Tracking
  track_analytics: z.boolean().default(true),
  
  require_explanation: z.boolean().default(true),
}).refine(
  (data) => {
    // Ensure question mix matches max_questions if provided
    if (data.question_mix && data.max_questions) {
      const totalMix = data.question_mix.MCQ + data.question_mix.SHORT_ANSWER + data.question_mix.PRINCIPLE;
      return totalMix === data.max_questions;
    }
    return true;
  },
  'Question mix must match the total number of questions'
).refine(
  (data) => {
    // Ensure due_at is after scheduled_for if both provided
    if (data.scheduled_for && data.due_at) {
      return data.due_at > data.scheduled_for;
    }
    return true;
  },
  'Due date must be after scheduled date'
);

// ============================================================================
// Step-specific Schemas
// ============================================================================

export const QuizMethodSchema = z.object({
  method: z.enum(['auto', 'files', 'manual']),
});

export const QuizBasicConfigSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  topic: z.string().min(1, 'Topic is required').max(200),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  max_questions: z.number().min(1).max(50),
  time_limit_sec: z.number().min(60).max(7200).optional(),
});

export const QuizSourceConfigSchema = z.object({
  source_type: z.enum(['auto', 'files', 'manual']),
  source_ids: z.array(z.string()).optional(),
  uploaded_files: z.array(z.instanceof(File)).optional(),
  selected_existing_file_ids: z.array(z.union([z.string(), z.number()])).optional(),
}).refine(
  (data) => {
    if (data.source_type === 'files') {
      return (data.source_ids && data.source_ids.length > 0) || 
             (data.uploaded_files && data.uploaded_files.length > 0) ||
             (data.selected_existing_file_ids && data.selected_existing_file_ids.length > 0);
    }
    return true;
  },
  'File source requires at least one file to be selected or uploaded'
);

export const QuizAdvancedConfigSchema = z.object({
  delivery_mode: z.enum(['IMMEDIATE', 'DEFERRED']),
  question_mix: z.object({
    MCQ: z.number().min(0).max(50),
    SHORT_ANSWER: z.number().min(0).max(50),
    PRINCIPLE: z.number().min(0).max(50),
  }).refine(
    (mix) => mix.MCQ + mix.SHORT_ANSWER + mix.PRINCIPLE > 0,
    'At least one question type must be selected'
  ),
  language: z.string().default('en'),
  scheduled_for: z.date().optional(),
  due_at: z.date().optional(),
  test_style: z.string().nullable().optional(),
  style_config_override: z.record(z.any()).optional(),
  allow_retakes: z.boolean().default(true),
  show_hints: z.boolean().default(false),
  randomize_questions: z.boolean().default(true),
  randomize_choices: z.boolean().default(true),
  track_analytics: z.boolean().default(true),
  require_explanation: z.boolean().default(true),
});

// ============================================================================
// Type Definitions
// ============================================================================

export type QuizCreationForm = z.infer<typeof QuizCreationSchema>;
export type QuizMethodForm = z.infer<typeof QuizMethodSchema>;
export type QuizBasicConfigForm = z.infer<typeof QuizBasicConfigSchema>;
export type QuizSourceConfigForm = z.infer<typeof QuizSourceConfigSchema>;
export type QuizAdvancedConfigForm = z.infer<typeof QuizAdvancedConfigSchema>;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_QUIZ_FORM_CONFIG: Partial<QuizCreationForm> = {
  difficulty: 'INTERMEDIATE',
  delivery_mode: 'IMMEDIATE',
  max_questions: 10,
  time_limit_sec: 900, // 15 minutes
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
};

// ============================================================================
// Validation Helpers
// ============================================================================

export const validateQuizConfig = (config: Partial<QuizCreationForm>): { valid: boolean; errors: string[] } => {
  try {
    QuizCreationSchema.parse(config);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
};

export const getQuizQuestionMixTotal = (mix: QuizCreationForm['question_mix']): number => {
  if (!mix) return 0;
  return mix.MCQ + mix.SHORT_ANSWER + mix.PRINCIPLE;
};

export const validateQuizQuestionMix = (mix: QuizCreationForm['question_mix'], maxQuestions: number): boolean => {
  if (!mix) return true;
  return getQuizQuestionMixTotal(mix) === maxQuestions;
};

// ============================================================================
// Smart Defaults and Suggestions
// ============================================================================

export const getQuizDifficultySuggestions = (topic: string): QuizCreationForm['difficulty'] => {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('basic') || topicLower.includes('intro') || topicLower.includes('fundamental')) {
    return 'BEGINNER';
  }
  
  if (topicLower.includes('advanced') || topicLower.includes('expert') || topicLower.includes('research')) {
    return 'ADVANCED';
  }
  
  if (topicLower.includes('master') || topicLower.includes('phd') || topicLower.includes('doctoral')) {
    return 'EXPERT';
  }
  
  return 'INTERMEDIATE';
};

export const getQuizSuggestedTimeLimit = (maxQuestions: number, difficulty: QuizCreationForm['difficulty']): number => {
  const baseTimePerQuestion = {
    'BEGINNER': 60,    // 1 minute per question
    'INTERMEDIATE': 90, // 1.5 minutes per question
    'ADVANCED': 120,   // 2 minutes per question
    'EXPERT': 150,     // 2.5 minutes per question
  };
  
  return maxQuestions * baseTimePerQuestion[difficulty];
};

export const getQuizSuggestedQuestionMix = (maxQuestions: number, difficulty: QuizCreationForm['difficulty']) => {
  const ratios = {
    'BEGINNER': { MCQ: 0.6, SHORT_ANSWER: 0.3, PRINCIPLE: 0.1 },
    'INTERMEDIATE': { MCQ: 0.4, SHORT_ANSWER: 0.4, PRINCIPLE: 0.2 },
    'ADVANCED': { MCQ: 0.3, SHORT_ANSWER: 0.4, PRINCIPLE: 0.3 },
    'EXPERT': { MCQ: 0.2, SHORT_ANSWER: 0.3, PRINCIPLE: 0.5 },
  };
  
  const ratio = ratios[difficulty];
  
  return {
    MCQ: Math.round(maxQuestions * ratio.MCQ),
    SHORT_ANSWER: Math.round(maxQuestions * ratio.SHORT_ANSWER),
    PRINCIPLE: Math.round(maxQuestions * ratio.PRINCIPLE),
  };
};

// ============================================================================
// Form Field Configuration
// ============================================================================

export const QUIZ_DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Basic concepts and recall' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Application and understanding' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Analysis and synthesis' },
  { value: 'EXPERT', label: 'Expert', description: 'Evaluation and creation' },
] as const;

export const QUIZ_DELIVERY_MODE_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate Feedback', description: 'Show results after each question' },
  { value: 'DEFERRED', label: 'Deferred Feedback', description: 'Show results after completing the quiz' },
] as const;

export const QUIZ_LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
] as const;
