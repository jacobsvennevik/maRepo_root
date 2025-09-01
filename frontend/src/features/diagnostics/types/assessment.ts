// Assessment Types - Generalized for multiple assessment types
export type AssessmentKind = 'FLASHCARDS' | 'MCQ' | 'MIXED' | 'TRUE_FALSE' | 'FILL_BLANK';
export type ItemType = 'FLASHCARD' | 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'ORDERING';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type AttemptType = 'SPACED_REPETITION' | 'QUIZ' | 'PRACTICE';

export interface AssessmentSet {
  id: number;
  title: string;
  description?: string;
  kind: AssessmentKind;
  document?: number; // Document ID
  owner: number; // User ID
  created_at: string;
  updated_at: string;
  
  // Metadata
  learning_objectives?: string[];
  themes?: string[];
  difficulty_level?: DifficultyLevel;
  target_audience?: string;
  estimated_study_time?: number; // minutes
  tags?: string[];
  assessment_config?: Record<string, number>; // e.g., {"FLASHCARD": 60, "MCQ": 40}
  
  // Statistics fields (from backend serializer)
  total_items?: number;
  due_items?: number;
  learning_items?: number;
  review_items?: number;
  new_items?: number;
  average_accuracy?: number;
  
  // Item relationships (from backend serializer)
  items?: AssessmentItem[];
}

export interface AssessmentItem {
  id: number;
  assessment_set: number; // AssessmentSet ID
  item_type: ItemType;
  order_index: number;
  is_active: boolean;
  
  // Content fields (polymorphic based on item_type)
  question: string; // For flashcards: question; for MCQ: stem
  answer: string;   // For flashcards: answer; for MCQ: correct answer text
  
  // MCQ-specific fields
  choices?: string[]; // Array of choice strings
  correct_index?: number; // Index of correct choice
  explanation?: string; // Explanation for correct answer
  
  // Metadata
  difficulty: DifficultyLevel;
  bloom_level: BloomLevel;
  concept_id?: string;
  theme?: string;
  related_concepts?: string[];
  hints?: string[];
  examples?: string[];
  common_misconceptions?: string[];
  learning_objective?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Spaced repetition fields (for flashcards and some other types)
  algorithm: 'sm2' | 'leitner';
  learning_state: 'new' | 'learning' | 'review' | 'mastered';
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  ease_factor: number; // SM-2 ease factor
  leitner_box: number; // Current Leitner box (1-5)
  next_review: string; // ISO date string
  last_reviewed?: string; // ISO date string
  
  // Review tracking
  total_reviews: number;
  correct_reviews: number;
  
  // Additional metrics
  metrics?: Record<string, any>;
  
  // Computed properties
  retention_rate?: number; // Percentage
  is_due?: boolean;
  is_overdue?: boolean;
  days_until_due?: number;
  
  // For backward compatibility with existing flashcard code
  flashcard_set?: AssessmentSet;
  flashcard_set_id?: number;
}

export interface AssessmentAttempt {
  id: number;
  user: number; // User ID
  assessment_item: number; // AssessmentItem ID
  attempt_type: AttemptType;
  created_at: string;
  response_time_ms: number;
  
  // Polymorphic payload based on item type
  payload: Record<string, any>;
  
  // For spaced repetition (flashcards)
  quality?: number; // 0-5 rating
  
  // For MCQ/objective items
  selected_index?: number;
  is_correct?: boolean;
  confidence?: number; // 0-1 confidence rating
  
  // Additional fields
  notes?: string;
  session_id?: string;
}

// Review/Attempt interfaces
export interface FlashcardReview {
  quality: number; // 0-5 quality rating
  response_time_seconds?: number;
  notes?: string;
}

export interface MCQAttempt {
  selected_index: number;
  response_time_ms?: number;
  confidence?: number; // 0-1 confidence rating
  notes?: string;
}

export interface AssessmentReview {
  quality?: number; // For flashcards
  selected_index?: number; // For MCQ
  response_time_ms?: number;
  confidence?: number; // For MCQ
  notes?: string;
}

// Session interfaces
export interface StudySession {
  id: string;
  assessment_set_id: number;
  user_id: number;
  start_time: string;
  end_time?: string;
  items_reviewed: number;
  correct_answers: number;
  total_time: number; // Seconds
  algorithm: string;
}

export interface DueItemsResponse {
  due_items: AssessmentItem[];
  total_due: number;
  next_review_in: number; // Hours until next item is due
  study_recommendation: string;
}

export interface StudyStats {
  total_items: number;
  due_items: number;
  mastered_items: number;
  learning_items: number;
  review_items: number;
  retention_rate: number;
  streak_days: number;
  next_review: string;
}

// Generation interfaces
export interface CreateAssessmentSetForm {
  title: string;
  description?: string;
  kind: AssessmentKind;
  difficulty_level: DifficultyLevel;
  target_audience?: string;
  estimated_study_time?: number;
  tags?: string[];
  assessment_config?: Record<string, number>;
}

export interface CreateAssessmentItemForm {
  question: string;
  answer: string;
  item_type: ItemType;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
  difficulty?: DifficultyLevel;
  bloom_level?: BloomLevel;
  notes?: string;
  source_material?: string;
  tags?: string[];
}

export interface AssessmentGenerationRequest {
  title: string;
  kind: AssessmentKind;
  description?: string;
  content?: string;
  document_id?: number;
  num_items: number;
  difficulty: DifficultyLevel;
  choices_per_item?: number; // For MCQ
  assessment_config?: Record<string, number>; // For MIXED
  mock_mode?: boolean;
}

// Backward compatibility aliases
export interface FlashcardSet extends AssessmentSet {
  kind: 'FLASHCARDS';
}

export interface Flashcard extends AssessmentItem {
  item_type: 'FLASHCARD';
  flashcard_set: FlashcardSet;
  flashcard_set_id: number;
}

export interface CreateFlashcardSetForm extends CreateAssessmentSetForm {
  kind: 'FLASHCARDS';
}

export interface CreateFlashcardForm extends CreateAssessmentItemForm {
  item_type: 'FLASHCARD';
}

// Mock data interfaces for testing
export interface MockAssessmentData {
  sets: AssessmentSet[];
  items: AssessmentItem[];
  attempts: AssessmentAttempt[];
}

export interface MockGenerationResponse {
  assessment_set: AssessmentSet;
  items_created: number;
}

