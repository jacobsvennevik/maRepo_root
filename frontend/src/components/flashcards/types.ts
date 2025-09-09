// Shared types for flashcard components
export type SortOption = 'recent' | 'name' | 'cards';
export type LayoutMode = 'grid' | 'list';

export interface DeckActionHandlers {
  onEdit?: (deck: any) => void;
  onDelete?: (deck: any) => void;
  onShare?: (deck: any) => void;
  onToggleFavorite?: (deck: any) => void;
}

export interface SortChipsProps {
  currentSort: SortOption;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sort: SortOption) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
  className?: string;
}

export interface LayoutToggleProps {
  currentLayout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  className?: string;
}
