// Shared hooks for flashcard components
import { useMemo } from 'react';
import type { SortOption } from './types';
import type { FlashcardSet } from '@/features/flashcards/types';

export function useDeckSorting(decks: FlashcardSet[], sortOption: SortOption, sortDirection: 'asc' | 'desc') {
  return useMemo(() => {
    const sorted = [...decks].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'recent':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'cards':
          comparison = (a.study_stats?.total_cards || 0) - (b.study_stats?.total_cards || 0);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [decks, sortOption, sortDirection]);
}
