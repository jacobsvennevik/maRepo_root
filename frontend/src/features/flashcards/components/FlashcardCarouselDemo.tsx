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
  project: 1,
  total_cards: 7,
  due_cards: 3,
  learning_cards: 2,
  review_cards: 2,
  average_accuracy: 0.85,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
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
