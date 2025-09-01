# Flashcard Frontend Implementation

This document describes the implementation of the flashcard frontend system for the OceanLearn platform.

## Overview

The flashcard system implements a comprehensive spaced repetition learning experience with three main components:

1. **FlashcardDashboard** - Overview page for managing flashcard sets
2. **FlashcardStudy** - Active study session with spaced repetition algorithms
3. **FlashcardSetEditor** - Management interface for individual flashcard sets

## Architecture

### Backend Integration

The frontend integrates with the existing backend flashcard system that includes:

- **Models**: `FlashcardSet`, `Flashcard` with spaced repetition fields
- **Algorithms**: SM-2 (SuperMemo 2) and Leitner Box System
- **API Endpoints**: Full CRUD operations for sets and cards, review submission, and analytics

### Frontend Components

#### 1. FlashcardDashboard (`/active-project/[projectId]/flashcards`)

**Purpose**: Entry point for flashcard interactions

**Features**:
- List of flashcard sets with metadata (# of cards, due cards)
- Create, edit, and delete flashcard sets
- Filter and sort options (by difficulty, due cards, recently reviewed)
- Visual progress indicators (retention rate, study streak, due cards)
- Study stats overview with key metrics

**Key Components**:
- Study stats cards (Total Cards, Due Cards, Retention Rate, Study Streak)
- Search and filtering system
- Flashcard set grid with action buttons
- Create new set dialog with comprehensive form

#### 2. FlashcardStudy (`/active-project/[projectId]/flashcards/[setId]/study`)

**Purpose**: Active review of cards using spaced repetition algorithms

**Features**:
- Card display with question/answer flip animation
- Quality rating system (0-5 scale for SM-2)
- Session tracking and progress monitoring
- Hint system for additional help
- Review notes input for personal insights
- Pause/resume functionality
- Card reset capability

**Study Flow**:
1. Display question
2. User thinks and optionally shows hint
3. Flip to reveal answer
4. User rates knowledge quality (0-5)
5. Optional notes input
6. Submit review and move to next card
7. Session completion with performance summary

#### 3. FlashcardSetEditor (`/active-project/[projectId]/flashcards/[setId]/edit`)

**Purpose**: Manage flashcards within a set

**Features**:
- List and grid view modes for cards
- Inline editing of question, answer, notes, and source material
- Bulk operations (select multiple cards for deletion)
- Import/export functionality (placeholder)
- Set configuration (algorithm selection, difficulty level)
- Search and filter by learning state

## Spaced Repetition Algorithms

### SM-2 Algorithm (SuperMemo 2)
- **Quality Scale**: 0-5 rating system
- **Adaptive Intervals**: Based on review quality and ease factor
- **Ease Factor**: Adjusts difficulty based on performance
- **Graduation**: Cards move from learning to review state

### Leitner Box System
- **Box Structure**: 5 boxes with increasing intervals
- **Simple Progression**: Move up on success, down on failure
- **Fixed Intervals**: 1, 3, 7, 14, 30 days

## Data Flow

1. **Dashboard Load**: Fetches flashcard sets and study statistics
2. **Study Session**: Loads cards for a specific set, tracks user progress
3. **Review Submission**: Sends quality ratings to backend for algorithm processing
4. **State Updates**: Backend calculates next review dates and learning states
5. **Progress Tracking**: Frontend displays updated statistics and due cards

## Navigation Structure

```
/active-project/[projectId]/
├── flashcards/                    # Main dashboard
├── flashcards/[setId]/study      # Study session
└── flashcards/[setId]/edit       # Set editor
```

## UI/UX Features

### Design Principles
- **Clean and Minimal**: Following existing DiagnosticDashboard patterns
- **Responsive**: Mobile-friendly design with adaptive layouts
- **Accessible**: Keyboard navigation and screen reader support
- **Visual Feedback**: Progress bars, badges, and status indicators

### Key UI Elements
- **Cards**: Consistent with existing design system
- **Buttons**: Standard button variants with appropriate icons
- **Forms**: Comprehensive input validation and user guidance
- **Progress Indicators**: Visual feedback for study sessions
- **Status Badges**: Clear indication of card states and algorithms

## Development Notes

### Mock Data
- Components include mock data for development and testing
- API endpoints are prepared but commented as TODO
- Easy to switch to real backend integration

### Type Safety
- Full TypeScript implementation with comprehensive interfaces
- Type-safe props and state management
- Proper error handling and loading states

### Performance
- Efficient filtering and sorting algorithms
- Optimized re-renders with proper dependency management
- Lazy loading of card content

## Future Enhancements

### Planned Features
- **Analytics Dashboard**: Detailed learning progress and retention curves
- **Custom Algorithms**: User-defined spaced repetition parameters
- **Collaborative Sets**: Shared flashcard sets between users
- **Mobile App**: Native mobile experience for study sessions
- **Offline Support**: Study without internet connection

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live progress
- **Caching**: Intelligent caching of card data and user preferences
- **Performance**: Virtual scrolling for large flashcard sets
- **Accessibility**: Enhanced screen reader and keyboard navigation

## Usage Instructions

### For Students
1. Navigate to a project's flashcard section
2. Browse available flashcard sets
3. Start a study session with a set
4. Review cards using the quality rating system
5. Track progress and maintain study streaks

### For Educators
1. Create flashcard sets for course content
2. Organize cards by topic and difficulty
3. Monitor student progress and retention
4. Adjust content based on performance analytics

## API Integration

When ready to connect to the backend:

1. Replace TODO comments with actual API calls
2. Update error handling for network failures
3. Implement proper authentication headers
4. Add loading states and error boundaries
5. Test with real data and edge cases

## Testing

The components are designed to work with mock data for development:
- Test all user interactions and state changes
- Verify responsive design across screen sizes
- Ensure accessibility compliance
- Validate form inputs and error handling

## Conclusion

This flashcard implementation provides a solid foundation for spaced repetition learning within the OceanLearn platform. The modular design allows for easy maintenance and future enhancements while maintaining consistency with the existing UI/UX patterns.

