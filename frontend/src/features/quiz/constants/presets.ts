/**
 * Quiz Type Presets and Configuration
 * 
 * Predefined configurations for different quiz types to speed up
 * the creation process and provide smart defaults based on best practices.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface QuizPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quick' | 'academic' | 'professional' | 'custom';
  recommended: boolean;
  config: {
    quiz_type: 'formative' | 'summative' | 'diagnostic' | 'mastery';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    max_questions: number;
    time_limit_sec?: number;
    question_types: string[];
    delivery_mode: 'immediate' | 'scheduled' | 'self_paced';
    features: {
      hints_enabled: boolean;
      explanations_enabled: boolean;
      retries_allowed: boolean;
      randomize_questions: boolean;
      show_progress: boolean;
    };
  };
  tags: string[];
  estimatedTime: string;
  difficulty_description: string;
}

export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  presets: QuizPreset[];
}

// ============================================================================
// Quiz Type Presets
// ============================================================================

export const QUIZ_PRESETS: QuizPreset[] = [
  // Quick Assessment Presets
  {
    id: 'quick-check',
    name: 'Quick Knowledge Check',
    description: 'Fast 5-minute assessment to gauge understanding',
    icon: '⚡',
    category: 'quick',
    recommended: true,
    config: {
      quiz_type: 'formative',
      difficulty: 'INTERMEDIATE',
      max_questions: 5,
      time_limit_sec: 300, // 5 minutes
      question_types: ['multiple_choice', 'true_false'],
      delivery_mode: 'immediate',
      features: {
        hints_enabled: true,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['quick', 'formative', 'practice'],
    estimatedTime: '5 minutes',
    difficulty_description: 'Easy to moderate questions',
  },
  {
    id: 'diagnostic-basic',
    name: 'Basic Diagnostic',
    description: 'Identify knowledge gaps and learning needs',
    icon: '🔍',
    category: 'quick',
    recommended: true,
    config: {
      quiz_type: 'diagnostic',
      difficulty: 'INTERMEDIATE',
      max_questions: 8,
      time_limit_sec: 600, // 10 minutes
      question_types: ['multiple_choice', 'fill_blank'],
      delivery_mode: 'immediate',
      features: {
        hints_enabled: false,
        explanations_enabled: true,
        retries_allowed: false,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['diagnostic', 'assessment', 'gaps'],
    estimatedTime: '8-10 minutes',
    difficulty_description: 'Covers key concepts',
  },
  {
    id: 'practice-session',
    name: 'Practice Session',
    description: 'Extended practice with detailed feedback',
    icon: '💪',
    category: 'quick',
    recommended: false,
    config: {
      quiz_type: 'formative',
      difficulty: 'INTERMEDIATE',
      max_questions: 15,
      time_limit_sec: 1200, // 20 minutes
      question_types: ['multiple_choice', 'short_answer', 'true_false'],
      delivery_mode: 'self_paced',
      features: {
        hints_enabled: true,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['practice', 'extended', 'feedback'],
    estimatedTime: '15-20 minutes',
    difficulty_description: 'Comprehensive practice',
  },

  // Academic Presets
  {
    id: 'midterm-prep',
    name: 'Midterm Preparation',
    description: 'Comprehensive review for midterm exams',
    icon: '📚',
    category: 'academic',
    recommended: true,
    config: {
      quiz_type: 'summative',
      difficulty: 'INTERMEDIATE',
      max_questions: 25,
      time_limit_sec: 2400, // 40 minutes
      question_types: ['multiple_choice', 'short_answer', 'essay'],
      delivery_mode: 'scheduled',
      features: {
        hints_enabled: false,
        explanations_enabled: false,
        retries_allowed: false,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['academic', 'exam', 'comprehensive'],
    estimatedTime: '35-40 minutes',
    difficulty_description: 'Exam-level difficulty',
  },
  {
    id: 'final-exam',
    name: 'Final Exam Format',
    description: 'Full comprehensive examination',
    icon: '🎓',
    category: 'academic',
    recommended: false,
    config: {
      quiz_type: 'summative',
      difficulty: 'ADVANCED',
      max_questions: 50,
      time_limit_sec: 5400, // 90 minutes
      question_types: ['multiple_choice', 'short_answer', 'essay', 'problem_solving'],
      delivery_mode: 'scheduled',
      features: {
        hints_enabled: false,
        explanations_enabled: false,
        retries_allowed: false,
        randomize_questions: true,
        show_progress: false,
      },
    },
    tags: ['academic', 'final', 'comprehensive', 'high-stakes'],
    estimatedTime: '75-90 minutes',
    difficulty_description: 'Advanced comprehensive exam',
  },
  {
    id: 'chapter-review',
    name: 'Chapter Review Quiz',
    description: 'Review key concepts from a chapter or unit',
    icon: '📖',
    category: 'academic',
    recommended: true,
    config: {
      quiz_type: 'formative',
      difficulty: 'INTERMEDIATE',
      max_questions: 12,
      time_limit_sec: 900, // 15 minutes
      question_types: ['multiple_choice', 'true_false', 'fill_blank'],
      delivery_mode: 'self_paced',
      features: {
        hints_enabled: true,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: false,
        show_progress: true,
      },
    },
    tags: ['academic', 'chapter', 'review'],
    estimatedTime: '12-15 minutes',
    difficulty_description: 'Chapter-specific content',
  },

  // Professional Development Presets
  {
    id: 'certification-prep',
    name: 'Certification Prep',
    description: 'Prepare for professional certification exams',
    icon: '🏆',
    category: 'professional',
    recommended: true,
    config: {
      quiz_type: 'summative',
      difficulty: 'ADVANCED',
      max_questions: 30,
      time_limit_sec: 3600, // 60 minutes
      question_types: ['multiple_choice', 'scenario_based'],
      delivery_mode: 'scheduled',
      features: {
        hints_enabled: false,
        explanations_enabled: true,
        retries_allowed: false,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['professional', 'certification', 'career'],
    estimatedTime: '50-60 minutes',
    difficulty_description: 'Professional certification level',
  },
  {
    id: 'skills-assessment',
    name: 'Skills Assessment',
    description: 'Evaluate current skill level and competencies',
    icon: '⚡',
    category: 'professional',
    recommended: false,
    config: {
      quiz_type: 'diagnostic',
      difficulty: 'INTERMEDIATE',
      max_questions: 20,
      time_limit_sec: 1800, // 30 minutes
      question_types: ['multiple_choice', 'practical_application'],
      delivery_mode: 'immediate',
      features: {
        hints_enabled: false,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['professional', 'skills', 'assessment'],
    estimatedTime: '25-30 minutes',
    difficulty_description: 'Skills-focused evaluation',
  },

  // Mastery Learning Presets
  {
    id: 'mastery-check',
    name: 'Mastery Check',
    description: 'Verify complete understanding before advancing',
    icon: '✅',
    category: 'academic',
    recommended: false,
    config: {
      quiz_type: 'mastery',
      difficulty: 'INTERMEDIATE',
      max_questions: 10,
      time_limit_sec: 1200, // 20 minutes
      question_types: ['multiple_choice', 'short_answer'],
      delivery_mode: 'immediate',
      features: {
        hints_enabled: false,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: false,
        show_progress: true,
      },
    },
    tags: ['mastery', 'prerequisite', 'competency'],
    estimatedTime: '15-20 minutes',
    difficulty_description: 'Must achieve 80% to pass',
  },
];

// ============================================================================
// Preset Categories
// ============================================================================

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'quick',
    name: 'Quick Assessments',
    description: 'Fast, focused assessments for immediate feedback',
    icon: '⚡',
    presets: QUIZ_PRESETS.filter(p => p.category === 'quick'),
  },
  {
    id: 'academic',
    name: 'Academic Testing',
    description: 'Structured assessments for educational environments',
    icon: '🎓',
    presets: QUIZ_PRESETS.filter(p => p.category === 'academic'),
  },
  {
    id: 'professional',
    name: 'Professional Development',
    description: 'Career-focused assessments and skill evaluations',
    icon: '💼',
    presets: QUIZ_PRESETS.filter(p => p.category === 'professional'),
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get recommended presets for a specific use case
 */
export const getRecommendedPresets = (limit: number = 3): QuizPreset[] => {
  return QUIZ_PRESETS.filter(preset => preset.recommended).slice(0, limit);
};

/**
 * Get presets by category
 */
export const getPresetsByCategory = (category: string): QuizPreset[] => {
  return QUIZ_PRESETS.filter(preset => preset.category === category);
};

/**
 * Find preset by ID
 */
export const getPresetById = (id: string): QuizPreset | undefined => {
  return QUIZ_PRESETS.find(preset => preset.id === id);
};

/**
 * Get presets by difficulty level
 */
export const getPresetsByDifficulty = (difficulty: string): QuizPreset[] => {
  return QUIZ_PRESETS.filter(preset => preset.config.difficulty === difficulty);
};

/**
 * Get presets by quiz type
 */
export const getPresetsByQuizType = (quizType: string): QuizPreset[] => {
  return QUIZ_PRESETS.filter(preset => preset.config.quiz_type === quizType);
};

/**
 * Search presets by name or tags
 */
export const searchPresets = (query: string): QuizPreset[] => {
  const lowerQuery = query.toLowerCase();
  return QUIZ_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description.toLowerCase().includes(lowerQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get custom preset template for advanced users
 */
export const getCustomPresetTemplate = (): Partial<QuizPreset> => {
  return {
    id: 'custom',
    name: 'Custom Configuration',
    description: 'Create your own quiz configuration',
    icon: '⚙️',
    category: 'custom',
    recommended: false,
    config: {
      quiz_type: 'formative',
      difficulty: 'INTERMEDIATE',
      max_questions: 10,
      question_types: ['multiple_choice'],
      delivery_mode: 'immediate',
      features: {
        hints_enabled: true,
        explanations_enabled: true,
        retries_allowed: true,
        randomize_questions: true,
        show_progress: true,
      },
    },
    tags: ['custom'],
    estimatedTime: '10-15 minutes',
    difficulty_description: 'Customizable',
  };
};

export default {
  QUIZ_PRESETS,
  PRESET_CATEGORIES,
  getRecommendedPresets,
  getPresetsByCategory,
  getPresetById,
  getPresetsByDifficulty,
  getPresetsByQuizType,
  searchPresets,
  getCustomPresetTemplate,
};

