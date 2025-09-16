// Deterministic Preview Generator
// Generates consistent mock items based on seeded random number generation

import { StyleConfig } from './styleValidator';

export interface PreviewItem {
  id: string;
  type: 'mcq' | 'short_answer' | 'numeric' | 'multi_step' | 'cloze';
  question: string;
  options?: string[];
  answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export interface PreviewBadge {
  type: 'timing' | 'feedback' | 'difficulty';
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

/**
 * Seeded random number generator for deterministic previews
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * Generates a stable seed from configuration
 */
export function generateSeed(effectiveConfig: StyleConfig): number {
  const configString = JSON.stringify(effectiveConfig, Object.keys(effectiveConfig).sort());
  let hash = 0;
  
  for (let i = 0; i < configString.length; i++) {
    const char = configString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Generates deterministic preview items based on configuration
 */
export function generatePreviewItems(effectiveConfig: StyleConfig, maxItems: number = 3): PreviewItem[] {
  const seed = generateSeed(effectiveConfig);
  const rng = new SeededRandom(seed);
  const items: PreviewItem[] = [];
  
  const itemMix = effectiveConfig.item_mix || {
    single_select: 0.5,
    short_answer: 0.3,
    numeric: 0.2
  };

  // Generate items respecting proportions
  for (let i = 0; i < maxItems; i++) {
    const rand = rng.next();
    let cumulative = 0;
    
    if (rand < (cumulative += itemMix.single_select || 0)) {
      items.push(generateMCQItem(rng, i, effectiveConfig));
    } else if (rand < (cumulative += itemMix.short_answer || 0)) {
      items.push(generateShortAnswerItem(rng, i, effectiveConfig));
    } else if (rand < (cumulative += itemMix.numeric || 0)) {
      items.push(generateNumericItem(rng, i, effectiveConfig));
    } else if (rand < (cumulative += itemMix.multi_step || 0)) {
      items.push(generateMultiStepItem(rng, i, effectiveConfig));
    } else if (rand < (cumulative += itemMix.cloze || 0)) {
      items.push(generateClozeItem(rng, i, effectiveConfig));
    } else {
      // Fallback to MCQ if no specific type
      items.push(generateMCQItem(rng, i, effectiveConfig));
    }
  }

  return items;
}

/**
 * Generates preview badges based on configuration
 */
export function generatePreviewBadges(effectiveConfig: StyleConfig): PreviewBadge[] {
  const badges: PreviewBadge[] = [];

  // Timing badge
  if (effectiveConfig.timing?.mode) {
    badges.push({
      type: 'timing',
      label: getTimingLabel(effectiveConfig.timing.mode),
      variant: getTimingVariant(effectiveConfig.timing.mode)
    });
  }

  // Feedback badge
  if (effectiveConfig.feedback) {
    badges.push({
      type: 'feedback',
      label: getFeedbackLabel(effectiveConfig.feedback),
      variant: getFeedbackVariant(effectiveConfig.feedback)
    });
  }

  // Difficulty badge
  if (effectiveConfig.difficulty) {
    badges.push({
      type: 'difficulty',
      label: getDifficultyLabel(effectiveConfig.difficulty),
      variant: getDifficultyVariant(effectiveConfig.difficulty)
    });
  }

  return badges;
}

// Item generators
function generateMCQItem(rng: SeededRandom, index: number, config: StyleConfig): PreviewItem {
  const topics = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];
  const topic = rng.choice(topics);
  const difficulty = getDifficultyFromConfig(config.difficulty);
  
  return {
    id: `mcq-${index}`,
    type: 'mcq',
    question: `What is the primary principle behind ${topic.toLowerCase()}?`,
    options: [
      'Option A: First principle',
      'Option B: Second principle', 
      'Option C: Third principle',
      'Option D: Fourth principle'
    ],
    answer: 'Option A: First principle',
    difficulty,
    hints: config.hints ? [`Consider the fundamental laws of ${topic.toLowerCase()}`] : undefined
  };
}

function generateShortAnswerItem(rng: SeededRandom, index: number, config: StyleConfig): PreviewItem {
  const concepts = ['photosynthesis', 'thermodynamics', 'evolution', 'algorithms', 'probability'];
  const concept = rng.choice(concepts);
  const difficulty = getDifficultyFromConfig(config.difficulty);
  
  return {
    id: `short-${index}`,
    type: 'short_answer',
    question: `Explain the process of ${concept} in 2-3 sentences.`,
    difficulty,
    hints: config.hints ? [`Think about the key steps involved in ${concept}`] : undefined
  };
}

function generateNumericItem(rng: SeededRandom, index: number, config: StyleConfig): PreviewItem {
  const difficulty = getDifficultyFromConfig(config.difficulty);
  const baseValue = rng.nextInt(10, 100);
  
  return {
    id: `numeric-${index}`,
    type: 'numeric',
    question: `Calculate the result: ${baseValue} × ${rng.nextInt(2, 9)} + ${rng.nextInt(1, 20)}`,
    answer: `${baseValue * rng.nextInt(2, 9) + rng.nextInt(1, 20)}`,
    difficulty,
    hints: config.hints ? ['Remember order of operations: multiplication first, then addition'] : undefined
  };
}

function generateMultiStepItem(rng: SeededRandom, index: number, config: StyleConfig): PreviewItem {
  const difficulty = getDifficultyFromConfig(config.difficulty);
  
  return {
    id: `multistep-${index}`,
    type: 'multi_step',
    question: `Solve this multi-step problem:\n1. Calculate the area of a circle with radius 5\n2. Find the circumference\n3. Determine the ratio of area to circumference`,
    difficulty,
    hints: config.hints ? ['Use π ≈ 3.14159 for calculations'] : undefined
  };
}

function generateClozeItem(rng: SeededRandom, index: number, config: StyleConfig): PreviewItem {
  const difficulty = getDifficultyFromConfig(config.difficulty);
  
  return {
    id: `cloze-${index}`,
    type: 'cloze',
    question: `The process of _____ converts light energy into chemical energy through the reaction: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂`,
    answer: 'photosynthesis',
    difficulty,
    hints: config.hints ? ['This process occurs in plant cells'] : undefined
  };
}

// Helper functions
function getDifficultyFromConfig(difficulty?: string): 'easy' | 'medium' | 'hard' {
  switch (difficulty) {
    case 'easier': return 'easy';
    case 'harder': return 'hard';
    default: return 'medium';
  }
}

function getTimingLabel(mode: string): string {
  switch (mode) {
    case 'hard': return 'Hard Timing';
    case 'soft': return 'Soft Timing';
    case 'none': return 'No Timing';
    default: return 'Timing';
  }
}

function getTimingVariant(mode: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (mode) {
    case 'hard': return 'destructive';
    case 'soft': return 'secondary';
    case 'none': return 'outline';
    default: return 'default';
  }
}

function getFeedbackLabel(feedback: string): string {
  switch (feedback) {
    case 'immediate': return 'Immediate';
    case 'on_submit': return 'On Submit';
    case 'end_only': return 'End Only';
    case 'tiered_hints': return 'Tiered Hints';
    default: return 'Feedback';
  }
}

function getFeedbackVariant(feedback: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (feedback) {
    case 'immediate': return 'default';
    case 'on_submit': return 'secondary';
    case 'end_only': return 'destructive';
    case 'tiered_hints': return 'outline';
    default: return 'default';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easier': return 'Easy';
    case 'balanced': return 'Medium';
    case 'harder': return 'Hard';
    default: return 'Difficulty';
  }
}

function getDifficultyVariant(difficulty: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easier': return 'secondary';
    case 'balanced': return 'default';
    case 'harder': return 'destructive';
    default: return 'outline';
  }
}

/**
 * Gets a summary of the preview configuration
 */
export function getPreviewSummary(effectiveConfig: StyleConfig): {
  totalItems: number;
  itemTypes: string[];
  timingMode: string;
  feedbackMode: string;
  difficulty: string;
} {
  const itemMix = effectiveConfig.item_mix || {};
  const itemTypes = Object.keys(itemMix).filter(key => itemMix[key] > 0);
  
  return {
    totalItems: 3, // Default preview size
    itemTypes,
    timingMode: effectiveConfig.timing?.mode || 'soft',
    feedbackMode: effectiveConfig.feedback || 'immediate',
    difficulty: effectiveConfig.difficulty || 'balanced'
  };
}
