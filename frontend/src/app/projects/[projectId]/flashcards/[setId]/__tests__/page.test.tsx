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

// Mock FlashcardCarousel component as named export
jest.mock('@/features/flashcards/components/FlashcardCarousel', () => ({
  FlashcardCarousel: ({ flashcardSet }: { flashcardSet: FlashcardSet }) => (
    <div data-testid="flashcard-carousel">Flashcard Set: {flashcardSet.title}</div>
  )
}));

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
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({
      projectId: mockProjectId,
      setId: mockSetId,
    } as any);
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

      (mockAxiosGeneration.get as jest.Mock).mockResolvedValue({ data: mockFlashcardSet });

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
          `projects/${mockProjectId}/flashcard-sets/${mockSetId}/`
        );
      });

      expect(await screen.findByTestId('flashcard-carousel')).toBeInTheDocument();
      expect(screen.getByText('Flashcard Set: Test Flashcard Set')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      (mockAxiosGeneration.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<FlashcardSetCarouselPage />);

      // check for spinner container existence
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });

  describe('Mock flashcard set handling', () => {
    it('should handle mock flashcard sets correctly', async () => {
      mockUseParams.mockReturnValue({
        projectId: mockProjectId,
        setId: 'mock_test',
      } as any);

      render(<FlashcardSetCarouselPage />);

      expect(await screen.findByTestId('flashcard-carousel')).toBeInTheDocument();
      expect(screen.getByText('Flashcard Set: Mock Flashcard Set')).toBeInTheDocument();
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

      (mockAxiosGeneration.get as jest.Mock).mockResolvedValue({ data: mockFlashcardSet });

      render(<FlashcardSetCarouselPage />);

      await waitFor(() => {
        expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
          `projects/${mockProjectId}/flashcard-sets/${mockSetId}/`
        );
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when flashcard set is not found', async () => {
      const notFoundError: any = new Error('Not found');
      notFoundError.response = { status: 404, data: { detail: 'Not found' } };
      (mockAxiosGeneration.get as jest.Mock).mockRejectedValue(notFoundError);

      render(<FlashcardSetCarouselPage />);

      expect(await screen.findByText('Not found')).toBeInTheDocument();
    });

    it('should display generic error message when no specific error is provided', async () => {
      // reject with no message so component uses fallback text
      (mockAxiosGeneration.get as jest.Mock).mockRejectedValue({});

      render(<FlashcardSetCarouselPage />);

      expect(await screen.findByText('Failed to load flashcard set')).toBeInTheDocument();
    });
  });

  describe('Invalid setId handling', () => {
    it('should not render anything for invalid setId', () => {
      mockUseParams.mockReturnValue({
        projectId: mockProjectId,
        setId: 'invalid',
      } as any);

      const { container } = render(<FlashcardSetCarouselPage />);
      expect(container.firstChild).toBeNull();
    });
  });
});
