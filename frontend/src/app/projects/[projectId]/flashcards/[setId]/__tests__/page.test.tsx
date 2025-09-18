import { render, screen, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardSetCarouselPage from '../page';
import { axiosGeneration } from '@/lib/axios';
import type { FlashcardSet } from '@/features/flashcards/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock axios instances
jest.mock('@/lib/axios', () => ({
  axiosGeneration: {
    get: jest.fn(),
  },
}));

// Mock FlashcardCarousel component
jest.mock('@/features/flashcards/components/FlashcardCarousel', () => {
  return function MockFlashcardCarousel({ flashcardSet }: { flashcardSet: FlashcardSet }) {
    return <div data-testid="flashcard-carousel">Flashcard Set: {flashcardSet.title}</div>;
  };
});

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockAxiosGeneration = axiosGeneration as jest.Mocked<typeof axiosGeneration>;

describe('FlashcardSetCarouselPage', () => {
  const mockProjectId = '203062be-58d0-4f98-bbd4-33b4ce081276';
  const mockSetId = '9';
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({
      projectId: mockProjectId,
      setId: mockSetId,
    });
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe('Real flashcard set loading', () => {
    it('should use axiosGeneration for real flashcard set requests', async () => {
      const mockFlashcardSet: FlashcardSet = {
        id: 9,
        title: 'Test Flashcard Set',
        description: 'Test description',
        owner: 1,
        difficulty_level: 'INTERMEDIATE',
        target_audience: 'Students',
        estimated_study_time: 15,
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        flashcard_count: 3,
        is_public: false,
        study_stats: {
          total_cards: 3,
          due_cards: 3,
          mastered_cards: 0,
          learning_cards: 0,
          review_cards: 0,
          retention_rate: 0,
          streak_days: 0,
          next_review: '2024-01-01T00:00:00Z'
        },
        flashcards: []
      };

      mockAxiosGeneration.get.mockResolvedValue({ data: mockFlashcardSet });

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
          `projects/${mockProjectId}/flashcard-sets/${mockSetId}/`
        );
      });

      expect(screen.getByTestId('flashcard-carousel')).toBeInTheDocument();
      expect(screen.getByText('Flashcard Set: Test Flashcard Set')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Page not found at /api/projects/203062be-58d0-4f98-bbd4-33b4ce081276/flashcard-sets/9/';
      mockAxiosGeneration.get.mockRejectedValue(new Error(errorMessage));

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      mockAxiosGeneration.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<FlashcardSetCarouselPage />);

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Mock flashcard set handling', () => {
    it('should handle mock flashcard sets correctly', async () => {
      mockUseParams.mockReturnValue({
        projectId: mockProjectId,
        setId: 'mock_test',
      });

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(screen.getByTestId('flashcard-carousel')).toBeInTheDocument();
        expect(screen.getByText('Flashcard Set: Mock Flashcard Set')).toBeInTheDocument();
      });

      // Should not make any API calls for mock sets
      expect(mockAxiosGeneration.get).not.toHaveBeenCalled();
    });
  });

  describe('URL routing validation', () => {
    it('should use correct API endpoint for flashcard sets', async () => {
      const mockFlashcardSet: FlashcardSet = {
        id: 9,
        title: 'Test Set',
        description: 'Test',
        owner: 1,
        difficulty_level: 'INTERMEDIATE',
        target_audience: 'Students',
        estimated_study_time: 15,
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        flashcard_count: 0,
        is_public: false,
        study_stats: {
          total_cards: 0,
          due_cards: 0,
          mastered_cards: 0,
          learning_cards: 0,
          review_cards: 0,
          retention_rate: 0,
          streak_days: 0,
          next_review: '2024-01-01T00:00:00Z'
        },
        flashcards: []
      };

      mockAxiosGeneration.get.mockResolvedValue({ data: mockFlashcardSet });

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        // Verify the correct endpoint is called
        expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
          `projects/${mockProjectId}/flashcard-sets/${mockSetId}/`
        );
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when flashcard set is not found', async () => {
      const notFoundError = new Error('Not found');
      notFoundError.response = { status: 404 };
      mockAxiosGeneration.get.mockRejectedValue(notFoundError);

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(screen.getByText('Not found')).toBeInTheDocument();
      });
    });

    it('should display generic error message when no specific error is provided', async () => {
      mockAxiosGeneration.get.mockRejectedValue(new Error());

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load flashcard set')).toBeInTheDocument();
      });
    });
  });

  describe('Invalid setId handling', () => {
    it('should not render anything for invalid setId', () => {
      mockUseParams.mockReturnValue({
        projectId: mockProjectId,
        setId: 'invalid',
      });

      const { container } = render(<FlashcardSetCarouselPage />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});
