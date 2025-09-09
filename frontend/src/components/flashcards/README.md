# Flashcard Deck Components

A comprehensive set of React components for displaying and managing flashcard decks with modern design, full accessibility support, and responsive layouts.

## Components

### DeckCard
The main component for displaying individual flashcard decks with two layout variants:
- **Grid Layout**: Card-based design with detailed information
- **List Layout**: Compact horizontal layout for space-efficient display

**Features:**
- Deck title, description, and metadata
- Card count, due today, last studied, updated date
- Favorite star indicator
- Difficulty level badge
- Primary "Study Deck" CTA button
- Quick actions menu (Edit, Share, Delete, Favorite)
- Full keyboard navigation and screen reader support
- Responsive design across all breakpoints

### DeckGrid
Container component that manages multiple deck cards with:
- Sorting options (Recent, Name, Cards) with direction toggle
- Layout toggle (Grid/List view)
- Loading, empty, and error states
- Responsive grid layout (1-4 columns based on screen size)
- Accessibility-compliant grid structure

### SortChips
Interactive sorting controls with:
- Three sort options: Recent, Name, Cards
- Visual direction indicators (up/down arrows)
- Accessible button states
- Smooth transitions

### LayoutToggle
Simple toggle for switching between grid and list views:
- Visual grid/list icons
- Active state indication
- Smooth transitions

## Usage

```tsx
import { DeckGrid } from '@/components/flashcards';

function MyFlashcardsPage() {
  const decks = [
    // Your flashcard deck data
  ];

  return (
    <DeckGrid
      decks={decks}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onShare={handleShare}
      onToggleFavorite={handleToggleFavorite}
    />
  );
}
```

## Design System Compliance

The components follow the existing design system:
- **Colors**: Uses existing color tokens (primary, ocean, emerald, etc.)
- **Typography**: Consistent with Inter font family and sizing
- **Spacing**: Follows Tailwind spacing scale
- **Shadows**: Subtle shadows with hover effects
- **Border Radius**: Consistent rounded corners (xl for cards)
- **Icons**: Lucide React icons throughout

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Enter/Space activation
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Color Contrast**: Meets WCAG AA standards

## Responsive Design

- **Mobile**: Single column layout with stacked controls
- **Tablet**: 2-column grid with horizontal controls
- **Desktop**: 3-4 column grid with inline controls
- **Large Screens**: Optimized spacing and layout

## Data Requirements

The components expect `FlashcardSet` objects with the following structure:

```typescript
interface FlashcardSet {
  id: number;
  title: string;
  description?: string;
  owner: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  created_at: string;
  updated_at: string;
  study_stats: {
    total_cards: number;
    due_cards: number;
    mastered_cards: number;
    learning_cards: number;
    review_cards: number;
    retention_rate: number;
    next_review: string;
  };
}
```

## Performance

- Optimized rendering with React.memo where appropriate
- Efficient sorting with useMemo
- Minimal re-renders through proper state management
- Lazy loading support ready

## Browser Support

- Modern browsers with CSS Grid support
- Graceful degradation for older browsers
- Mobile-first responsive design
