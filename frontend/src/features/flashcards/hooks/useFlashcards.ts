import { useState, useEffect, useCallback } from 'react';
import { flashcardApi } from '../services/flashcardApi';
import type { 
  Flashcard, 
  FlashcardSet, 
  CreateFlashcardForm, 
  CreateFlashcardSetForm, 
  StudyStats,
  FlashcardDashboardState,
  FlashcardCarouselState
} from '../types';

// Hook for managing flashcard dashboard state
export function useFlashcardDashboard(projectId: string) {
  const [state, setState] = useState<FlashcardDashboardState>({
    flashcardSets: [],
    stats: null,
    loading: true,
    error: null,
    searchTerm: '',
    viewMode: 'grid'
  });

  const loadFlashcardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🚀 Loading flashcard data for project:', projectId);
      
      const sets = await flashcardApi.getProjectFlashcardSets(projectId);
      const stats = await flashcardApi.calculateProjectStats(projectId, sets);
      
      setState(prev => ({
        ...prev,
        flashcardSets: sets,
        stats,
        loading: false
      }));
      
      console.log('✅ Successfully loaded:', { setsCount: sets.length, stats });
    } catch (error) {
      console.error('❌ Failed to load flashcard data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load flashcards',
        loading: false
      }));
    }
  }, [projectId]);

  const createFlashcardSet = useCallback(async (form: CreateFlashcardSetForm) => {
    try {
      const newSet = await flashcardApi.createProjectFlashcardSet(projectId, form);
      if (newSet) {
        setState(prev => ({
          ...prev,
          flashcardSets: [newSet, ...prev.flashcardSets]
        }));
      }
      return newSet;
    } catch (error) {
      console.error('❌ Failed to create flashcard set:', error);
      throw error;
    }
  }, [projectId]);

  const deleteFlashcardSet = useCallback(async (setId: number) => {
    try {
      await flashcardApi.deleteFlashcardSet(setId);
      setState(prev => ({
        ...prev,
        flashcardSets: prev.flashcardSets.filter(set => set.id !== setId)
      }));
    } catch (error) {
      console.error('❌ Failed to delete flashcard set:', error);
      throw error;
    }
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }));
  }, []);

  const setViewMode = useCallback((viewMode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  // Filter and sort flashcard sets
  const filteredAndSortedSets = state.flashcardSets
    .filter(set => 
      set.title.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  useEffect(() => {
    loadFlashcardData();
  }, [loadFlashcardData]);

  return {
    ...state,
    filteredAndSortedSets,
    loadFlashcardData,
    createFlashcardSet,
    deleteFlashcardSet,
    setSearchTerm,
    setViewMode
  };
}

// Hook for managing flashcard carousel state
export function useFlashcardCarousel(setId: number, projectId?: string, initialFlashcards?: Flashcard[]) {
  const [state, setState] = useState<FlashcardCarouselState>({
    currentIndex: 0,
    showAnswer: false,
    isFlipped: false,
    isLoading: true,
    error: null
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards || []);

  const loadFlashcards = useCallback(async () => {
    // If we already have initial flashcards (e.g., from mock data), use those
    if (initialFlashcards && initialFlashcards.length > 0) {
      console.log('🚀 Using provided flashcards for set:', setId);
      setFlashcards(initialFlashcards);
      setState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ Loaded flashcards from props:', { count: initialFlashcards.length });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🚀 Loading flashcards for set:', setId, 'project:', projectId);
      const cards = await flashcardApi.getFlashcards(setId, projectId);
      setFlashcards(cards);
      setState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ Successfully loaded flashcards:', { count: cards.length });
    } catch (error) {
      console.error('❌ Failed to load flashcards:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load flashcards',
        isLoading: false
      }));
    }
  }, [setId, projectId, initialFlashcards]);

  const nextCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % flashcards.length,
      showAnswer: false,
      isFlipped: false
    }));
  }, [flashcards.length]);

  const prevCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? flashcards.length - 1 : prev.currentIndex - 1,
      showAnswer: false,
      isFlipped: false
    }));
  }, [flashcards.length]);

  const goToCard = useCallback((index: number) => {
    if (index < 0 || index >= flashcards.length) return;
    setState(prev => ({
      ...prev,
      currentIndex: index,
      showAnswer: false,
      isFlipped: false
    }));
  }, [flashcards.length]);

  const flipCard = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAnswer: !prev.showAnswer,
      isFlipped: !prev.isFlipped
    }));
  }, []);

  const createFlashcard = useCallback(async (form: CreateFlashcardForm) => {
    try {
      const newCard = await flashcardApi.createFlashcard(setId, form);
      if (newCard) {
        setFlashcards(prev => [...prev, newCard]);
        // Navigate to the new card
        goToCard(flashcards.length);
      }
      return newCard;
    } catch (error) {
      console.error('❌ Failed to create flashcard:', error);
      throw error;
    }
  }, [setId, flashcards.length, goToCard]);

  const updateFlashcard = useCallback(async (cardId: number, form: Partial<CreateFlashcardForm>) => {
    try {
      const updatedCard = await flashcardApi.updateFlashcard(cardId, form);
      if (updatedCard) {
        setFlashcards(prev => 
          prev.map(card => card.id === cardId ? updatedCard : card)
        );
      }
      return updatedCard;
    } catch (error) {
      console.error('❌ Failed to update flashcard:', error);
      throw error;
    }
  }, []);

  const deleteFlashcard = useCallback(async (cardId: number) => {
    try {
      await flashcardApi.deleteFlashcard(cardId);
      setFlashcards(prev => prev.filter(card => card.id !== cardId));
      
      // Adjust current index if needed
      setState(prev => {
        const newIndex = prev.currentIndex >= flashcards.length - 1 
          ? Math.max(0, flashcards.length - 2) 
          : prev.currentIndex;
        return { ...prev, currentIndex: newIndex };
      });
    } catch (error) {
      console.error('❌ Failed to delete flashcard:', error);
      throw error;
    }
  }, [flashcards.length]);

  const markCardReviewed = useCallback(async (wasCorrect: boolean) => {
    const currentCard = flashcards[state.currentIndex];
    if (!currentCard) return;

    try {
      await flashcardApi.markCardReviewed(currentCard.id, wasCorrect);
      // Update the card's review data
      setFlashcards(prev => 
        prev.map(card => 
          card.id === currentCard.id 
            ? { 
                ...card, 
                total_reviews: card.total_reviews + 1,
                correct_reviews: card.correct_reviews + (wasCorrect ? 1 : 0),
                last_reviewed: new Date().toISOString()
              }
            : card
        )
      );
    } catch (error) {
      console.error('❌ Failed to mark card reviewed:', error);
      throw error;
    }
  }, [flashcards, state.currentIndex]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return {
    ...state,
    flashcards,
    currentCard: flashcards[state.currentIndex],
    totalCards: flashcards.length,
    nextCard,
    prevCard,
    goToCard,
    flipCard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    markCardReviewed,
    reload: loadFlashcards
  };
}

// Hook for keyboard navigation
export function useFlashcardKeyboardNavigation(
  onNext: () => void,
  onPrev: () => void,
  onFlip: () => void,
  onCorrect: () => void,
  onIncorrect: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrev();
          break;
        case 'Enter':
        case 'f':
          event.preventDefault();
          onFlip();
          break;
        case '1':
        case 'y':
          event.preventDefault();
          onCorrect();
          break;
        case '2':
        case 'n':
          event.preventDefault();
          onIncorrect();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onFlip, onCorrect, onIncorrect]);
}

