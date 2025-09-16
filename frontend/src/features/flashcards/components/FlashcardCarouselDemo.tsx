"use client";

import React from 'react';
import { FlashcardCarousel } from './FlashcardCarousel';
import type { FlashcardSet } from '../types';

// Sample data for demonstration
const sampleFlashcardSet: FlashcardSet = {
  id: 1,
  title: "World Geography",
  description: "Learn about countries, capitals, and landmarks around the world",
  owner: 1,
  difficulty_level: 'INTERMEDIATE',
  tags: ['geography', 'world', 'capitals'],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  flashcard_count: 7,
  is_public: true,
  study_stats: {
    total_cards: 7,
    due_cards: 3,
    mastered_cards: 2,
    learning_cards: 2,
    review_cards: 2,
    retention_rate: 0.85,
    streak_days: 5,
    next_review: '2024-01-15T10:30:00Z'
  }
};

export const FlashcardCarouselDemo: React.FC = () => {
  const handleBack = () => {
    console.log('Back to decks clicked');
  };

  const handleEditCard = (card: any) => {
    console.log('Edit card:', card);
  };

  const handleDiscardCard = (card: any) => {
    console.log('Discard card:', card);
  };

  const handleAddCard = () => {
    console.log('Add card clicked');
  };

  const handleViewAll = () => {
    console.log('View all clicked');
  };

  return (
    <FlashcardCarousel
      flashcardSet={sampleFlashcardSet}
      onBack={handleBack}
      onEditCard={handleEditCard}
      onDiscardCard={handleDiscardCard}
      onAddCard={handleAddCard}
      onViewAll={handleViewAll}
    />
  );
};
