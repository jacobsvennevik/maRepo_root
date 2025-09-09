/**
 * Shared constants and design tokens.
 * Centralizes repeated values across components.
 */
export const DIFFICULTY_COLORS = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-blue-100 text-blue-800', 
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
} as const;

export const RATING_BUTTON_COLORS = {
  1: 'bg-red-500 hover:bg-red-600',
  2: 'bg-orange-500 hover:bg-orange-600',
  3: 'bg-yellow-500 hover:bg-yellow-600',
  4: 'bg-blue-500 hover:bg-blue-600',
  5: 'bg-green-500 hover:bg-green-600',
} as const;

export const RATING_LABELS = {
  1: 'Hard',
  2: 'Medium', 
  3: 'Good',
  4: 'Easy',
  5: 'Perfect',
} as const;

export const STUDY_STATS_COLORS = {
  total_cards: 'text-blue-600',
  reviewed_today: 'text-green-600',
  due_cards: 'text-orange-600',
  study_streak: 'text-purple-600',
} as const;

export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
  CONNECTION_CHECK_INTERVAL: 1000,
} as const;

export const GRAPHQL_CONFIG = {
  CACHE_POLICY: 'cache-first',
  ERROR_POLICY: 'all',
} as const;

export const UI_CONSTANTS = {
  MAX_CARDS_PREVIEW: 3,
  RECENT_REFLECTIONS_LIMIT: 5,
  PROGRESS_BAR_HEIGHT: 'h-2',
  CARD_MIN_HEIGHT: 'min-h-[300px]',
} as const;
