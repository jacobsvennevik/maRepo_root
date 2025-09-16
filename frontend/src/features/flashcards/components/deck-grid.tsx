"use client";

import React, { useState } from 'react';
import { DeckCard } from './deck-card';
import { SortChips } from './sort-chips';
import { LayoutToggle } from './layout-toggle';
import { LoadingState, ErrorState, EmptyState } from './state-components';
import { useDeckSorting } from './hooks';
import { GRID_LAYOUT_CLASSES, LIST_LAYOUT_CLASSES } from './constants';
import { FlashcardSet } from '@/features/flashcards/types';
import { cn } from '@/lib/utils';
import type { SortOption, LayoutMode, DeckActionHandlers } from './types';

export interface DeckGridProps extends DeckActionHandlers {
  decks: FlashcardSet[];
  isLoading?: boolean;
  error?: string | null;
  projectId?: string;
  className?: string;
}

export function DeckGrid({
  decks,
  isLoading = false,
  error = null,
  projectId,
  onEdit,
  onDelete,
  onShare,
  onToggleFavorite,
  className,
}: DeckGridProps) {
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  const sortedDecks = useDeckSorting(decks, sortOption, sortDirection);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (decks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Decks
          </h2>
          <span className="text-sm text-gray-500">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <SortChips
            currentSort={sortOption}
            sortDirection={sortDirection}
            onSortChange={setSortOption}
            onDirectionChange={setSortDirection}
          />
          
          <LayoutToggle
            currentLayout={layoutMode}
            onLayoutChange={setLayoutMode}
          />
        </div>
      </div>

      {/* Deck Grid/List */}
      <div
        className={cn(
          layoutMode === 'grid' ? GRID_LAYOUT_CLASSES : LIST_LAYOUT_CLASSES
        )}
        role="grid"
        aria-label="Flashcard decks"
      >
        {sortedDecks.map((deck, index) => (
          <div
            key={deck.id}
            role="gridcell"
            aria-rowindex={Math.floor(index / (layoutMode === 'grid' ? 3 : 1)) + 1}
            aria-colindex={(index % (layoutMode === 'grid' ? 3 : 1)) + 1}
          >
            <DeckCard
              deck={deck}
              layout={layoutMode}
              projectId={projectId}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
              onToggleFavorite={onToggleFavorite}
              className="h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
