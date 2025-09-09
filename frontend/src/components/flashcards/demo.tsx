"use client";

import React, { useState } from 'react';
import { DeckGrid } from '@/components/flashcards';
import { FlashcardSet } from '@/features/flashcards/types';

// Mock data for demonstration
const mockDecks: FlashcardSet[] = [
  {
    id: 1,
    title: "Classic Literature",
    description: "Famous works and authors from literary history",
    owner: 1,
    difficulty_level: 'INTERMEDIATE',
    target_audience: 'Literature Students',
    estimated_study_time: 120,
    tags: ['favorite'],
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    flashcard_count: 1,
    is_public: false,
    study_stats: {
      total_cards: 1,
      due_cards: 3,
      mastered_cards: 8,
      learning_cards: 4,
      review_cards: 8,
      retention_rate: 0.85,
      streak_days: 5,
      next_review: '2024-01-20T10:00:00Z',
    },
    flashcards: [],
    learning_objectives: [],
    themes: [],
  },
  {
    id: 2,
    title: "Basic Science",
    description: "Fundamental concepts in biology, chemistry, and physics",
    owner: 1,
    difficulty_level: 'BEGINNER',
    target_audience: 'High School Students',
    estimated_study_time: 180,
    tags: [],
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    flashcard_count: 2,
    is_public: false,
    study_stats: {
      total_cards: 2,
      due_cards: 7,
      mastered_cards: 12,
      learning_cards: 6,
      review_cards: 12,
      retention_rate: 0.78,
      streak_days: 3,
      next_review: '2024-01-18T10:00:00Z',
    },
    flashcards: [],
    learning_objectives: [],
    themes: [],
  },
  {
    id: 3,
    title: "World Geography",
    description: "Countries, capitals, and landmarks around the world",
    owner: 1,
    difficulty_level: 'ADVANCED',
    target_audience: 'Geography Enthusiasts',
    estimated_study_time: 240,
    tags: [],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    flashcard_count: 50,
    is_public: false,
    study_stats: {
      total_cards: 50,
      due_cards: 12,
      mastered_cards: 25,
      learning_cards: 13,
      review_cards: 25,
      retention_rate: 0.92,
      streak_days: 7,
      next_review: '2024-01-10T10:00:00Z',
    },
    flashcards: [],
    learning_objectives: [],
    themes: [],
  },
];

export function FlashcardDeckDemo() {
  const [decks] = useState<FlashcardSet[]>(mockDecks);

  const handleEdit = (deck: FlashcardSet) => {
    console.log('Edit deck:', deck.title);
  };

  const handleDelete = (deck: FlashcardSet) => {
    console.log('Delete deck:', deck.title);
  };

  const handleShare = (deck: FlashcardSet) => {
    console.log('Share deck:', deck.title);
  };

  const handleToggleFavorite = (deck: FlashcardSet) => {
    console.log('Toggle favorite:', deck.title);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flashcard Deck Redesign Demo
          </h1>
          <p className="text-gray-600">
            New deck card design with sorting, layout options, and full accessibility support.
          </p>
        </div>

        <DeckGrid
          decks={decks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShare={handleShare}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
}
