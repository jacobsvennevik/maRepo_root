# Flashcard Carousel Component

A sophisticated, animated flashcard carousel component that provides an engaging learning experience with 3D flip animations and smooth navigation.

## Features

### 🎠 Carousel Interface
- **Horizontal scrolling** with smooth snap-to-center behavior
- **Partially visible side cards** that scale down to 30% with reduced opacity
- **Responsive design** that adapts to different screen sizes
- **Touch-friendly** scrolling on mobile devices

### 🎭 3D Card Animations
- **3D flip effect** with perspective and backface visibility
- **Smooth transitions** between question and answer states
- **Hover effects** with shadow elevation changes
- **Card scaling** animations for focus management

### 🎮 Interactive Controls
- **Navigation arrows** on left and right sides
- **Progress dots** showing current position in the deck
- **Keyboard shortcuts** (arrow keys, spacebar, enter)
- **Action buttons** for editing, adding cards, and viewing all

### 🎨 Visual Design
- **Modern UI** with rounded corners and subtle shadows
- **Color-coded cards** (blue for questions, green for answers)
- **Gradient backgrounds** and smooth color transitions
- **Responsive typography** that scales appropriately

## Usage

### Basic Implementation

```tsx
import { FlashcardCarousel } from '@/features/flashcards/components/FlashcardCarousel';

function MyFlashcardPage() {
  const flashcardSet = {
    id: 1,
    title: "World Geography",
    description: "Learn about countries and capitals",
    // ... other properties
  };

  return (
    <FlashcardCarousel
      flashcardSet={flashcardSet}
      onBack={() => router.back()}
      onEditCard={(card) => handleEditCard(card)}
      onDiscardCard={(card) => handleDiscardCard(card)}
      onAddCard={() => handleAddCard()}
      onViewAll={() => handleViewAll()}
    />
  );
}
```

### Required Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `flashcardSet` | `FlashcardSet` | Yes | The flashcard set to display |
| `onBack` | `() => void` | Yes | Function called when back button is clicked |
| `onEditCard` | `(card: Flashcard) => void` | No | Function called when edit button is clicked |
| `onDiscardCard` | `(card: Flashcard) => void` | No | Function called when discard button is clicked |
| `onAddCard` | `() => void` | No | Function called when add card button is clicked |
| `onViewAll` | `() => void` | No | Function called when view all button is clicked |

## Keyboard Shortcuts

- **Arrow Left/Right**: Navigate between cards
- **Spacebar**: Next card
- **Enter/F**: Flip current card
- **Escape**: Close modals

## Styling

The component uses a combination of Tailwind CSS classes and custom CSS for advanced animations. The custom CSS file (`FlashcardCarousel.css`) provides:

- 3D perspective and transform styles
- Custom scrollbar hiding
- Enhanced transition effects
- Responsive scaling classes

## Dependencies

- **React**: 18+ with hooks
- **Lucide React**: For icons
- **Tailwind CSS**: For styling
- **Custom CSS**: For 3D effects and animations

## Browser Support

- **Modern browsers** with CSS Grid and Flexbox support
- **Mobile browsers** with touch scrolling support
- **CSS transforms** and transitions support required

## Performance

- **Hardware acceleration** for smooth animations
- **Efficient re-renders** with React hooks optimization
- **Smooth scrolling** with CSS scroll-snap
- **Optimized transitions** targeting transform properties

## Accessibility

- **Keyboard navigation** support
- **Screen reader** friendly structure
- **Focus management** for interactive elements
- **ARIA labels** for navigation controls

## Customization

The component can be customized by:

1. **Modifying the CSS** file for different animation timings
2. **Adjusting color schemes** in the Tailwind classes
3. **Changing card dimensions** and spacing
4. **Adding custom animations** for specific interactions

## Examples

See `FlashcardCarouselDemo.tsx` for a complete working example with sample data.
