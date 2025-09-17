// Data transformation utilities for flashcard hooks
import { axiosApi } from "@/lib/axios-api";
import type { Paginated } from "@/lib/api/pagination";

export interface FlashcardSetApi {
  id: number;
  title: string;
  total_cards: number;
  due_cards: number;
  learning_cards: number;
  review_cards: number;
  new_cards: number;
  average_accuracy: number;
  created_at: string;
}

export function unwrapFlashcardSets(payload: any): FlashcardSetApi[] {
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
    ? payload.results
    : [];
}

export async function refreshFlashcardSets(projectId: string): Promise<FlashcardSetApi[]> {
  const response = await axiosApi.get<FlashcardSetApi[] | Paginated<FlashcardSetApi>>(
    `projects/${projectId}/flashcard-sets/`
  );
  return unwrapFlashcardSets(response.data);
}

export function calculateFlashcardStats(sets: FlashcardSetApi[]) {
  const totalCards = sets.reduce((sum, set) => sum + set.total_cards, 0);
  const dueToday = sets.reduce((sum, set) => sum + set.due_cards, 0);
  const learningCards = sets.reduce((sum, set) => sum + set.learning_cards, 0);
  const reviewCards = sets.reduce((sum, set) => sum + set.review_cards, 0);
  const avgAccuracy = sets.length > 0
    ? sets.reduce((sum, set) => sum + set.average_accuracy, 0) / sets.length
    : 0;

  return {
    total_sets: sets.length,
    total_cards: totalCards,
    due_today: dueToday,
    learning_cards: learningCards,
    mastered_cards: reviewCards,
    average_accuracy: avgAccuracy,
  };
}
