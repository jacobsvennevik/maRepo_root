// Shared constants for flashcard components
export const SORT_OPTIONS = [
  { value: 'recent' as const, label: 'Recent' },
  { value: 'name' as const, label: 'Name' },
  { value: 'cards' as const, label: 'Cards' },
] as const;

export const GRID_LAYOUT_CLASSES = 'grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
export const LIST_LAYOUT_CLASSES = 'space-y-3';

export const EMPTY_STATE_CONFIG = {
  icon: 'BookOpen',
  title: 'No decks yet',
  description: 'Create your first flashcard deck to start studying',
} as const;

export const LOADING_STATE_CONFIG = {
  icon: 'Loader2',
  message: 'Loading decks...',
} as const;

export const ERROR_STATE_CONFIG = {
  icon: 'AlertCircle',
  title: 'Error loading decks',
} as const;
