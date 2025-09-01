// Flashcard Core Types
export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  concept_id?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  card_type: 'definition' | 'concept' | 'example' | 'question';
  theme?: string;
  related_concepts: string[];
  hints: string[];
  examples: string[];
  common_misconceptions: string[];
  learning_objective?: string;
  notes?: string;
  source_material?: string;
  tags?: string[];
  difficulty_rating?: number;
  created_at: string;
  updated_at: string;
  algorithm: 'sm2' | 'leitner' | 'custom';
  learning_state: 'new' | 'learning' | 'review' | 'mastered';
  interval: number;
  repetitions: number;
  ease_factor: number;
  leitner_box: number;
  next_review: string;
  last_reviewed?: string;
  total_reviews: number;
  correct_reviews: number;
  metrics: Record<string, any>;
  flashcard_set: FlashcardSet;
  accuracy_rate: number;
  is_due: boolean;
  days_until_due: number;
  retention_rate: number;
  is_overdue: boolean;
  memory_strength: number;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description?: string;
  owner: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  target_audience?: string;
  estimated_study_time?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  flashcard_count: number;
  is_public: boolean;
  study_stats: StudyStats;
  flashcards?: Flashcard[];
  learning_objectives?: string[];
  themes?: string[];
  document?: any;
}

export interface StudyStats {
  total_cards: number;
  due_cards: number;
  mastered_cards: number;
  learning_cards: number;
  review_cards: number;
  retention_rate: number;
  streak_days: number;
  next_review: string;
}

export interface FlashcardReview {
  quality: number; // 0-5 quality rating
  response_time_seconds?: number;
  notes?: string;
}

// Form Types
export interface CreateFlashcardForm {
  question: string;
  answer: string;
  difficulty: Flashcard['difficulty'];
  bloom_level: Flashcard['bloom_level'];
  card_type: Flashcard['card_type'];
  hints?: string[];
  examples?: string[];
  common_misconceptions?: string[];
  learning_objective?: string;
  notes?: string;
  source_material?: string;
  tags?: string[];
  difficulty_rating?: number;
}

export interface CreateFlashcardSetForm {
  title: string;
  description?: string;
  difficulty_level: FlashcardSet['difficulty_level'];
  target_audience?: string;
  tags?: string[];
  is_public?: boolean;
}

// API Response Types
export interface FlashcardApiResponse {
  results: Flashcard[];
  count: number;
  next?: string;
  previous?: string;
}

export interface FlashcardSetApiResponse {
  results: FlashcardSet[];
  count: number;
  next?: string;
  previous?: string;
}

// UI State Types
export interface FlashcardCarouselState {
  currentIndex: number;
  showAnswer: boolean;
  isFlipped: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface FlashcardDashboardState {
  flashcardSets: FlashcardSet[];
  stats: StudyStats | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  viewMode: 'grid' | 'list';
}

// Navigation Types
export interface FlashcardNavigation {
  projectId: string;
  setId?: number;
  cardId?: number;
}

