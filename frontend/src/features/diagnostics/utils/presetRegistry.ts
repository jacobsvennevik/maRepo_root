// Style Preset Registry
// Data-driven preset system with proper schema validation

import { StyleConfig } from './styleValidator';

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  config: StyleConfig;
  category: 'assessment' | 'practice' | 'review';
  tags: string[];
}

export interface PresetRegistry {
  [key: string]: StylePreset;
}

/**
 * Core MVP presets as specified in requirements
 */
export const STYLE_PRESETS: PresetRegistry = {
  mcq_quiz: {
    id: 'mcq_quiz',
    label: 'MCQ Quiz',
    description: 'Multiple choice questions with immediate feedback',
    icon: 'target',
    category: 'assessment',
    tags: ['quick', 'immediate', 'multiple-choice'],
    config: {
      item_mix: {
        single_select: 0.9,
        cloze: 0.1,
        short_answer: 0,
        numeric: 0,
        multi_step: 0
      },
      timing: {
        total_minutes: 15,
        per_item_seconds: 60,
        mode: 'soft'
      },
      feedback: 'immediate',
      difficulty: 'balanced',
      hints: false
    }
  },

  mixed_checkpoint: {
    id: 'mixed_checkpoint',
    label: 'Mixed Checkpoint',
    description: 'Combination of question types with deferred feedback',
    icon: 'check-circle',
    category: 'assessment',
    tags: ['comprehensive', 'deferred', 'mixed-types'],
    config: {
      item_mix: {
        single_select: 0.6,
        short_answer: 0.4,
        cloze: 0,
        numeric: 0,
        multi_step: 0
      },
      timing: {
        total_minutes: 30,
        per_item_seconds: 90,
        mode: 'soft'
      },
      feedback: 'on_submit',
      difficulty: 'balanced',
      hints: true
    }
  },

  stem_problem_set: {
    id: 'stem_problem_set',
    label: 'STEM Problem Set',
    description: 'Numeric and multi-step problems with tiered hints',
    icon: 'settings',
    category: 'assessment',
    tags: ['stem', 'complex', 'tiered-hints'],
    config: {
      item_mix: {
        numeric: 0.7,
        multi_step: 0.3,
        single_select: 0,
        short_answer: 0,
        cloze: 0
      },
      timing: {
        total_minutes: 45,
        per_item_seconds: 300,
        mode: 'soft'
      },
      feedback: 'tiered_hints',
      difficulty: 'harder',
      hints: true
    }
  }
};

/**
 * Extended presets for future use
 */
export const EXTENDED_PRESETS: PresetRegistry = {
  quick_practice: {
    id: 'quick_practice',
    label: 'Quick Practice',
    description: 'Fast-paced practice session with immediate feedback',
    icon: 'zap',
    category: 'practice',
    tags: ['quick', 'practice', 'immediate'],
    config: {
      item_mix: {
        single_select: 0.8,
        cloze: 0.2,
        short_answer: 0,
        numeric: 0,
        multi_step: 0
      },
      timing: {
        total_minutes: 10,
        per_item_seconds: 30,
        mode: 'hard'
      },
      feedback: 'immediate',
      difficulty: 'easier',
      hints: true
    }
  },

  comprehensive_review: {
    id: 'comprehensive_review',
    label: 'Comprehensive Review',
    description: 'Thorough review covering all question types',
    icon: 'book-open',
    category: 'review',
    tags: ['comprehensive', 'review', 'all-types'],
    config: {
      item_mix: {
        single_select: 0.4,
        short_answer: 0.3,
        numeric: 0.2,
        multi_step: 0.1,
        cloze: 0
      },
      timing: {
        total_minutes: 60,
        per_item_seconds: 120,
        mode: 'soft'
      },
      feedback: 'on_submit',
      difficulty: 'balanced',
      hints: true
    }
  },

  exam_preparation: {
    id: 'exam_preparation',
    label: 'Exam Preparation',
    description: 'Strict timing with no hints for exam simulation',
    icon: 'graduation-cap',
    category: 'assessment',
    tags: ['exam', 'strict', 'no-hints'],
    config: {
      item_mix: {
        single_select: 0.7,
        short_answer: 0.2,
        numeric: 0.1,
        multi_step: 0,
        cloze: 0
      },
      timing: {
        total_minutes: 90,
        per_item_seconds: 90,
        mode: 'hard'
      },
      feedback: 'end_only',
      difficulty: 'harder',
      hints: false
    }
  }
};

/**
 * Get all available presets
 */
export function getAllPresets(): PresetRegistry {
  return { ...STYLE_PRESETS, ...EXTENDED_PRESETS };
}

/**
 * Get MVP presets only
 */
export function getMVPPresets(): PresetRegistry {
  return STYLE_PRESETS;
}

/**
 * Get preset by ID
 */
export function getPreset(presetId: string): StylePreset | null {
  const allPresets = getAllPresets();
  return allPresets[presetId] || null;
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): StylePreset[] {
  const allPresets = getAllPresets();
  return Object.values(allPresets).filter(preset => preset.category === category);
}

/**
 * Get presets by tags
 */
export function getPresetsByTags(tags: string[]): StylePreset[] {
  const allPresets = getAllPresets();
  return Object.values(allPresets).filter(preset =>
    tags.some(tag => preset.tags.includes(tag))
  );
}

/**
 * Search presets by query
 */
export function searchPresets(query: string): StylePreset[] {
  const allPresets = getAllPresets();
  const lowercaseQuery = query.toLowerCase();
  
  return Object.values(allPresets).filter(preset =>
    preset.label.toLowerCase().includes(lowercaseQuery) ||
    preset.description.toLowerCase().includes(lowercaseQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * Validate preset configuration
 */
export function validatePresetConfig(config: StyleConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate item_mix
  if (config.item_mix) {
    const sum = Object.values(config.item_mix).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      errors.push(`Item mix sums to ${sum.toFixed(2)}, should be 1.0`);
    }
    
    const hasNegativeValues = Object.values(config.item_mix).some(v => v < 0);
    if (hasNegativeValues) {
      errors.push('Item mix contains negative values');
    }
  }

  // Validate timing
  if (config.timing) {
    if (config.timing.total_minutes && config.timing.total_minutes <= 0) {
      errors.push('Total minutes must be positive');
    }
    
    if (config.timing.per_item_seconds && config.timing.per_item_seconds <= 0) {
      errors.push('Per item seconds must be positive');
    }
    
    if (config.timing.mode === 'hard' && config.timing.per_item_seconds && config.timing.per_item_seconds < 5) {
      errors.push('Hard timing requires ≥5 seconds per item');
    }
  }

  // Validate feedback and hints consistency
  if (config.feedback === 'end_only' && config.hints === true) {
    warnings.push('End-only feedback typically disables hints');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get preset recommendations based on context
 */
export function getPresetRecommendations(context: {
  timeAvailable?: number;
  difficulty?: string;
  questionTypes?: string[];
  feedbackPreference?: string;
}): StylePreset[] {
  const allPresets = getAllPresets();
  const recommendations: StylePreset[] = [];

  Object.values(allPresets).forEach(preset => {
    let score = 0;

    // Time-based scoring
    if (context.timeAvailable && preset.config.timing?.total_minutes) {
      const timeDiff = Math.abs(context.timeAvailable - preset.config.timing.total_minutes);
      score += Math.max(0, 10 - timeDiff / 5); // Closer time = higher score
    }

    // Difficulty-based scoring
    if (context.difficulty && preset.config.difficulty === context.difficulty) {
      score += 10;
    }

    // Question type scoring
    if (context.questionTypes && preset.config.item_mix) {
      const matchingTypes = context.questionTypes.filter(type => 
        preset.config.item_mix?.[type] && preset.config.item_mix[type] > 0
      );
      score += matchingTypes.length * 5;
    }

    // Feedback preference scoring
    if (context.feedbackPreference && preset.config.feedback === context.feedbackPreference) {
      score += 10;
    }

    if (score > 0) {
      recommendations.push({ ...preset, score });
    }
  });

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => (b as any).score - (a as any).score)
    .slice(0, 3)
    .map(preset => {
      const { score, ...presetWithoutScore } = preset as any;
      return presetWithoutScore;
    });
}

/**
 * Export preset configuration as JSON
 */
export function exportPresetConfig(preset: StylePreset): string {
  return JSON.stringify(preset.config, null, 2);
}

/**
 * Import preset configuration from JSON
 */
export function importPresetConfig(jsonString: string): StyleConfig | null {
  try {
    const config = JSON.parse(jsonString);
    const validation = validatePresetConfig(config);
    
    if (validation.isValid) {
      return config;
    } else {
      console.error('Invalid preset configuration:', validation.errors);
      return null;
    }
  } catch (error) {
    console.error('Failed to parse preset configuration:', error);
    return null;
  }
}
