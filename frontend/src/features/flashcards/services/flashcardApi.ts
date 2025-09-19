import { axiosGeneration } from '@/lib/axios';
import { getProjectScoped, postProjectScoped } from '@/lib/projectApi'
import { buildTestModeHeaders } from '@/lib/testMode'
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
  async getProjectFlashcardSets(projectId: string): Promise<FlashcardSet[]> {
    const data = await getProjectScoped<FlashcardSetApiResponse | FlashcardSet[]>(`flashcard-sets/`, projectId)
    const sets = (data as any).results || data || []
    return sets
  }

  async createProjectFlashcardSet(projectId: string, form: CreateFlashcardSetForm): Promise<FlashcardSet | null> {
    const data = await postProjectScoped<FlashcardSet>(`flashcard-sets/`, projectId, { title: form.title })
    return data
  }

  async deleteFlashcardSet(setId: number): Promise<void> {
    console.group('🔍 Delete Flashcard Set API');
    console.log('→ DELETE /flashcard-sets/${setId}/');

    try {
      await axiosGeneration.delete(`flashcard-sets/${setId}/`);
      console.log('✅ Set deleted successfully');
    } catch (err) {
      console.error('❌ Delete failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async getFlashcards(setId: number, projectId?: string): Promise<Flashcard[]> {
    const endpoint = projectId 
      ? `projects/${projectId}/flashcard-sets/${setId}/flashcards/`
      : `flashcards/?flashcard_set=${setId}`
    const res = await axiosGeneration.get(endpoint)
    const responseData = res.data
    const cards = (responseData as any)?.results || responseData || []
    return Array.isArray(cards) ? cards : []
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

      const response = await axiosGeneration.post<Flashcard>(`/flashcards/`, payload);
      console.log('✅ Created flashcard:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Create failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async updateFlashcard(cardId: number, form: Partial<CreateFlashcardForm>): Promise<Flashcard | null> {
    console.group('🔍 Update Flashcard API');
    console.log('→ PUT /api/flashcards/${cardId}/');
    console.log('→ Payload:', form);

    try {
      const response = await axiosGeneration.put<Flashcard>(`/flashcards/${cardId}/`, form);
      console.log('✅ Updated flashcard:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ Update failure:', err);
      throw err;
    } finally {
      console.groupEnd();
    }
  }

  async deleteFlashcard(cardId: number): Promise<void> {
    console.group('🔍 Delete Flashcard API');
    console.log('→ DELETE /api/flashcards/${cardId}/');

    try {
      await axiosGeneration.delete(`flashcards/${cardId}/`);
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
    console.log('→ POST /api/flashcards/${cardId}/review/');
    console.log('→ Was correct:', wasCorrect);

    try {
      await axiosGeneration.post(`flashcards/${cardId}/review/`, { was_correct: wasCorrect });
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

export const flashcardApi = new FlashcardApiService();
