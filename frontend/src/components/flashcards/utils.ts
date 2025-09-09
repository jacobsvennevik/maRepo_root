// Shared utilities for flashcard components
export const DECK_COLORS = {
  icon: [
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600', 
    'from-blue-500 to-blue-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
  ],
  button: [
    'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  ],
} as const;

export const getDeckColor = (deckId: number, type: 'icon' | 'button') => {
  const colors = DECK_COLORS[type];
  return colors[deckId % colors.length];
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateString);
};

export const getDueCardsColor = (dueCards: number) => {
  if (dueCards === 0) return 'text-gray-500';
  if (dueCards <= 3) return 'text-orange-600';
  return 'text-red-600';
};
