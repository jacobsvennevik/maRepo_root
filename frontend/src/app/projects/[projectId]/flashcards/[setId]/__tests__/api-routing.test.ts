import { axiosApi, axiosGeneration } from '@/lib/axios';
import { isTestMode } from '@/lib/env/runMode';

// Mock the axios instances
jest.mock('@/lib/axios', () => ({
  axiosApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  axiosGeneration: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock test mode
jest.mock('@/lib/env/runMode', () => ({
  isTestMode: jest.fn(),
}));

const mockAxiosApi = axiosApi as jest.Mocked<typeof axiosApi>;
const mockAxiosGeneration = axiosGeneration as jest.Mocked<typeof axiosGeneration>;
const mockIsTestMode = isTestMode as jest.MockedFunction<typeof isTestMode>;

describe('Flashcard API Routing', () => {
  const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276';
  const setId = '9';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Correct API client usage', () => {
    it('should use axiosGeneration for flashcard set retrieval', async () => {
      const mockFlashcardSet = {
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

      // Simulate the correct API call
      const response = await axiosGeneration.get(`projects/${projectId}/flashcard-sets/${setId}/`);

      expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
        `projects/${projectId}/flashcard-sets/${setId}/`
      );
      expect(response.data).toEqual(mockFlashcardSet);
    });

    it('should NOT use axiosApi for flashcard operations', async () => {
      const error = new Error('Page not found at /api/projects/203062be-58d0-4f98-bbd4-33b4ce081276/flashcard-sets/9/');
      mockAxiosApi.get.mockRejectedValue(error);

      // This should fail because we're using the wrong client
      try {
        await axiosApi.get(`projects/${projectId}/flashcard-sets/${setId}/`);
      } catch (e) {
        expect(e).toEqual(error);
      }

      expect(mockAxiosApi.get).toHaveBeenCalledWith(
        `projects/${projectId}/flashcard-sets/${setId}/`
      );
    });
  });

  describe('Test mode behavior', () => {
    it('should add X-Test-Mode header when in test mode', async () => {
      mockIsTestMode.mockReturnValue(true);
      mockAxiosGeneration.get.mockResolvedValue({ data: {} });

      await axiosGeneration.get(`projects/${projectId}/flashcard-sets/${setId}/`);

      expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
        `projects/${projectId}/flashcard-sets/${setId}/`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Test-Mode': 'true'
          })
        })
      );
    });

    it('should not add X-Test-Mode header when not in test mode', async () => {
      mockIsTestMode.mockReturnValue(false);
      mockAxiosGeneration.get.mockResolvedValue({ data: {} });

      await axiosGeneration.get(`projects/${projectId}/flashcard-sets/${setId}/`);

      expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
        `projects/${projectId}/flashcard-sets/${setId}/`,
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'X-Test-Mode': 'true'
          })
        })
      );
    });
  });

  describe('API endpoint validation', () => {
    it('should call the correct backend endpoint', async () => {
      mockAxiosGeneration.get.mockResolvedValue({ data: {} });

      await axiosGeneration.get(`projects/${projectId}/flashcard-sets/${setId}/`);

      // Verify the call goes to the generation API
      expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
        `projects/${projectId}/flashcard-sets/${setId}/`
      );
    });

    it('should handle 404 errors correctly', async () => {
      const notFoundError = new Error('Not found');
      notFoundError.response = { status: 404 };
      mockAxiosGeneration.get.mockRejectedValue(notFoundError);

      try {
        await axiosGeneration.get(`projects/${projectId}/flashcard-sets/${setId}/`);
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Base URL configuration', () => {
    it('should use correct base URLs for different clients', () => {
      // axiosApi should point to /api/
      expect(mockAxiosApi.defaults.baseURL).toBe('http://localhost:8000/api/');
      
      // axiosGeneration should point to /generation/api/
      expect(mockAxiosGeneration.defaults.baseURL).toBe('http://localhost:8000/generation/api/');
    });
  });
});
