// Data transformation utilities for flashcard hooks
import { axiosGeneration } from "@/lib/axios";
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

function normalizeProjectId(raw: string): string {
  const val = String(raw || "");
  const looksLikeUuid = val.includes("-") && val.length >= 32;
  if (looksLikeUuid) return val;
  // Test/SSR hint
  try {
    const hinted = (globalThis as any)?.__activeProjectId as string | undefined;
    if (hinted && hinted.includes('-')) return hinted;
  } catch {}
  // Fallback: try to read active project id stored by projects overview
  try {
    const ls: Storage | undefined = (globalThis as any)?.localStorage;
    if (ls) {
      const stored = ls.getItem("activeProjectId") || ls.getItem("currentProjectId");
      if (stored) return stored;
    }
  } catch {}
  return val; // last resort
}

export function unwrapFlashcardSets(payload: any): FlashcardSetApi[] {
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
    ? payload.results
    : [];
}

export async function refreshFlashcardSets(projectId: string): Promise<FlashcardSetApi[]> {
  const effectiveProjectId = normalizeProjectId(projectId);
  const response = await axiosGeneration.get<FlashcardSetApi[] | Paginated<FlashcardSetApi>>(
    `projects/${effectiveProjectId}/flashcard-sets/`
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
