import { http } from '@/lib/http';
import type { 
  Flashcard, 
  FlashcardSet, 
  CreateFlashcardForm, 
  CreateFlashcardSetForm, 
  StudyStats,
  FlashcardApiResponse,
  FlashcardSetApiResponse
} from '../types';

class FlashcardApiService {
  // Flashcard Set Operations
  async getProjectFlashcardSets(projectId: string): Promise<FlashcardSet[]> {
    console.group('🔍 Flashcard Sets API');
    console.log('→ GET /projects/${projectId}/flashcard-sets/');

    try {
      const data = await http.get<FlashcardSetApiResponse | FlashcardSet[]>(`/projects/${projectId}/flashcard-sets/`);
      console.log('✅ Payload:', data);
      
      // Handle different response formats
      const sets = (data as any).results || data || [];
      console.log('📋 Normalized sets:', sets);
      
      return sets;
    } catch (err) {
      console.error('❌ Network/parse failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async createProjectFlashcardSet(projectId: string, form: CreateFlashcardSetForm): Promise<FlashcardSet | null> {
    console.group('🔍 Create Flashcard Set API');
    console.log('→ POST /projects/${projectId}/flashcard-sets/');
    console.log('→ Payload:', form);

    try {
      const data = await http.post<FlashcardSet>(`/projects/${projectId}/flashcard-sets/`, { title: form.title });
      console.log('✅ Created set:', data);
      return data;
    } catch (err) {
      console.error('❌ Create failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async deleteFlashcardSet(setId: number): Promise<void> {
    console.group('🔍 Delete Flashcard Set API');
    console.log('→ DELETE /flashcard-sets/${setId}/');

    try {
      await http.delete(`/flashcard-sets/${setId}/`);
      console.log('✅ Set deleted successfully');
    } catch (err) {
      console.error('❌ Delete failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  // Flashcard Operations
  async getFlashcards(setId: number): Promise<Flashcard[]> {
    console.group('🔍 Flashcards API');
    console.log('→ GET /flashcards/?flashcard_set=${setId}');

    try {
      const data = await http.get<FlashcardApiResponse | Flashcard[]>(`/flashcards/?flashcard_set=${setId}`);
      console.log('✅ Payload:', data);
      
      // Handle different response formats
      const cards = (data as any).results || data || [];
      console.log('📋 Normalized cards:', cards);
      
      return cards;
    } catch (err) {
      console.error('❌ Network/parse failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async createFlashcard(setId: number, form: CreateFlashcardForm): Promise<Flashcard | null> {
    console.group('🔍 Create Flashcard API');
    console.log('→ POST /flashcards/');
    console.log('→ Payload:', form);

    try {
      const payload = {
        ...form,
        flashcard_set: setId
      };

      const data = await http.post<Flashcard>(`/flashcards/`, payload);
      console.log('✅ Created flashcard:', data);
      return data;
    } catch (err) {
      console.error('❌ Create failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async updateFlashcard(cardId: number, form: Partial<CreateFlashcardForm>): Promise<Flashcard | null> {
    console.group('🔍 Update Flashcard API');
    console.log('→ PUT /flashcards/${cardId}/');
    console.log('→ Payload:', form);

    try {
      const data = await http.put<Flashcard>(`/flashcards/${cardId}/`, form);
      console.log('✅ Updated flashcard:', data);
      return data;
    } catch (err) {
      console.error('❌ Update failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async deleteFlashcard(cardId: number): Promise<void> {
    console.group('🔍 Delete Flashcard API');
    console.log('→ DELETE /flashcards/${cardId}/');

    try {
      await http.delete(`/flashcards/${cardId}/`);
      console.log('✅ Flashcard deleted successfully');
    } catch (err) {
      console.error('❌ Delete failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  // Study Operations
  async markCardReviewed(cardId: number, wasCorrect: boolean): Promise<void> {
    console.group('🔍 Mark Card Reviewed API');
    console.log('→ POST /flashcards/${cardId}/review/');
    console.log('→ Was correct:', wasCorrect);

    try {
      await http.post(`/flashcards/${cardId}/review/`, { was_correct: wasCorrect });
      console.log('✅ Card review recorded');
    } catch (err) {
      console.error('❌ Review failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  // Stats Operations
  async calculateProjectStats(projectId: string, sets: FlashcardSet[]): Promise<StudyStats> {
    console.group('📊 Calculate Project Stats');
    console.log('→ Calculating stats from', sets.length, 'sets');

    try {
      let totalCards = 0;
      let totalDueCards = 0;
      let totalLearningCards = 0;
      let totalReviewCards = 0;
      let totalMasteredCards = 0;
      
      for (const set of sets) {
        if (set.flashcards) {
          totalCards += set.flashcards.length;
          
          for (const card of set.flashcards) {
            if (card.learning_state === 'learning') totalLearningCards++;
            else if (card.learning_state === 'review') totalReviewCards++;
            else if (card.learning_state === 'mastered') totalMasteredCards++;
            
            if (card.next_review && new Date(card.next_review) <= new Date()) {
              totalDueCards++;
            }
          }
        }
      }
      
      const retentionRate = totalCards > 0 ? Math.round((totalMasteredCards / totalCards) * 100) : 0;
      
      const stats: StudyStats = {
        total_cards: totalCards,
        due_cards: totalDueCards,
        mastered_cards: totalMasteredCards,
        learning_cards: totalLearningCards,
        review_cards: totalReviewCards,
        retention_rate: retentionRate,
        streak_days: 0, // TODO: Implement streak calculation
        next_review: new Date().toISOString(),
      };
      
      console.log('✅ Calculated stats:', stats);
      return stats;
    } catch (err) {
      console.error('❌ Stats calculation failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const flashcardApi = new FlashcardApiService();
