import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectFlashcards } from './use-project-flashcards';
import { axiosApi, axiosGeneration } from '@/lib/axios';

// Mock the axios instances
jest.mock('@/lib/axios', () => ({
  axiosApi: {
    get: jest.fn(),
  },
  axiosGeneration: {
    get: jest.fn(),
  }
}));

const mockAxiosApi = axiosApi as any;
const mockAxiosGeneration = axiosGeneration as any;

describe('useProjectFlashcards Error Handling', () => {
  const mockProjectId = '203062be-58d0-4f98-bbd4-33b4ce081276';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle project data fetch timeout errors', async () => {
    // Mock timeout error for project data
    const timeoutError = new Error('Network Error');
    timeoutError.name = 'AxiosError';
    (timeoutError as any).code = 'ECONNABORTED';
    (timeoutError as any).message = 'timeout of 30000ms exceeded';

    mockAxiosApi.get.mockRejectedValueOnce(timeoutError);
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    // Should set error state on timeout
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });

    // Verify correct API calls were attempted
    expect(mockAxiosApi.get).toHaveBeenCalledWith(`projects/${mockProjectId}/`);
  });

  it('should handle flashcard sets fetch errors', async () => {
    // Mock successful project fetch but failed flashcard sets fetch
    const mockProject = {
      id: mockProjectId,
      name: 'Test Project',
      uploaded_files: []
    };

    const flashcardError = new Error('Flashcard fetch failed');
    (flashcardError as any).response = {
      status: 500,
      data: { detail: 'Database connection failed' }
    };

    mockAxiosApi.get.mockResolvedValueOnce({ data: mockProject });
    mockAxiosGeneration.get.mockRejectedValueOnce(flashcardError);

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.flashcardSets).toEqual([]);
    });

    expect(mockAxiosGeneration.get).toHaveBeenCalledWith(`projects/${mockProjectId}/flashcard-sets/`);
  });

  it('should handle PostgreSQL "too many clients" errors gracefully', async () => {
    const dbError = new Error('Database connection failed');
    (dbError as any).response = {
      status: 500,
      data: { 
        detail: 'connection to server failed: FATAL: sorry, too many clients already'
      }
    };

    mockAxiosApi.get.mockRejectedValueOnce(dbError);
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('Database connection failed');
    });
  });

  it('should recover after successful retry', async () => {
    const mockProject = {
      id: mockProjectId,
      name: 'Test Project',
      uploaded_files: [
        { id: '1', name: 'test.pdf', file_size: 1024 }
      ]
    };

    const mockFlashcardSets = [
      {
        id: '1',
        title: 'Test Set',
        cards_count: 10,
        created_at: '2025-09-19T07:00:00Z'
      }
    ];

    // First calls fail, then succeed
    mockAxiosApi.get
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({ data: mockProject });

    mockAxiosGeneration.get
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({ data: mockFlashcardSets });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    // Should show error initially
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Trigger retry
    await act(async () => {
      await result.current.retryFetch();
    });

    // Should succeed after retry
    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.flashcardSets).toHaveLength(1);
      expect(result.current.projectFiles).toHaveLength(1);
      expect(result.current.flashcardSets[0].title).toBe('Test Set');
    });
  });

  it('should handle malformed API responses', async () => {
    // Mock malformed responses
    mockAxiosApi.get.mockResolvedValueOnce({ data: null });
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: { invalid: 'format' } });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    await waitFor(() => {
      // Should handle null/malformed data gracefully
      expect(result.current.flashcardSets).toEqual([]);
      expect(result.current.projectFiles).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should prevent concurrent requests during loading', async () => {
    // Mock slow responses
    const slowPromise1 = new Promise(resolve => 
      setTimeout(() => resolve({ data: { uploaded_files: [] } }), 1000)
    );
    const slowPromise2 = new Promise(resolve => 
      setTimeout(() => resolve({ data: [] }), 1000)
    );

    mockAxiosApi.get.mockReturnValueOnce(slowPromise1);
    mockAxiosGeneration.get.mockReturnValueOnce(slowPromise2);

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    // Trigger multiple refresh calls while loading
    await act(async () => {
      result.current.retryFetch();
      result.current.retryFetch();
      result.current.retryFetch();
    });

    // Should only make one set of API calls
    await waitFor(() => {
      expect(mockAxiosApi.get).toHaveBeenCalledTimes(1);
      expect(mockAxiosGeneration.get).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle creation success and update state', async () => {
    const mockProject = {
      id: mockProjectId,
      name: 'Test Project',
      uploaded_files: []
    };

    const mockNewSet = {
      id: '2',
      title: 'New Set',
      cards_count: 5,
      created_at: '2025-09-19T08:00:00Z'
    };

    mockAxiosApi.get.mockResolvedValue({ data: mockProject });
    mockAxiosGeneration.get
      .mockResolvedValueOnce({ data: [] }) // Initial empty state
      .mockResolvedValueOnce({ data: [mockNewSet] }); // After creation

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.flashcardSets).toEqual([]);
    });

    // Simulate successful creation
    await act(async () => {
      result.current.onCreationSuccess();
    });

    // Should refresh and show new set
    await waitFor(() => {
      expect(result.current.flashcardSets).toHaveLength(1);
      expect(result.current.flashcardSets[0].title).toBe('New Set');
    });
  });

  it('should handle stats calculation with empty data', async () => {
    const mockProject = {
      id: mockProjectId,
      name: 'Test Project',
      uploaded_files: []
    };

    mockAxiosApi.get.mockResolvedValueOnce({ data: mockProject });
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    await waitFor(() => {
      expect(result.current.stats).toEqual({
        totalSets: 0,
        totalCards: 0,
        averageCardsPerSet: 0,
        lastStudied: null
      });
    });
  });
});
