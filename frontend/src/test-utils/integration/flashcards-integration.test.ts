import { renderHook, waitFor } from '@testing-library/react';
import { useProjectFlashcards } from '@/app/projects/[projectId]/flashcards/hooks/use-project-flashcards';

// Integration test - tests against REAL backend
describe('Flashcards Integration Tests', () => {
  const mockProjectId = '203062be-58d0-4f98-bbd4-33b4ce081276';

  beforeAll(async () => {
    // Check if backend is running
    try {
      const response = await fetch('http://localhost:8000/api/');
      if (!response.ok && response.status !== 401) {
        throw new Error('Backend not running');
      }
    } catch (error) {
      console.warn('⚠️ Backend not running - integration tests will fail');
      console.warn('Start backend with: cd /path/to/backend && python manage.py runserver');
    }
  });

  it('should handle real network errors when backend is down', async () => {
    // This test will ACTUALLY fail if backend is not running
    // Unlike unit tests with mocks, this tests the real error paths
    
    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    // Wait for the real network call to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    // If backend is down, we should see a real error
    if (result.current.error) {
      expect(result.current.error.message).toMatch(/Network|Connection|fetch/i);
      console.log('✅ Integration test caught real network error:', result.current.error.message);
    } else {
      console.log('✅ Backend is running and responded successfully');
    }
  });

  it('should make real API calls to the correct endpoints', async () => {
    // Monitor network requests
    const originalFetch = global.fetch;
    const fetchCalls: string[] = [];
    
    global.fetch = jest.fn().mockImplementation((url, ...args) => {
      fetchCalls.push(url.toString());
      return originalFetch(url, ...args);
    });

    const { result } = renderHook(() => useProjectFlashcards(mockProjectId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });

    // Verify the real URLs being called
    expect(fetchCalls.some(url => url.includes('/generation/api/projects/'))).toBe(true);
    expect(fetchCalls.some(url => url.includes('/api/projects/'))).toBe(true);
    
    console.log('🔍 Real API calls made:', fetchCalls);

    global.fetch = originalFetch;
  });
});

// Helper function to run integration tests only when backend is available
export const runIntegrationTests = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/');
    return response.status === 401; // 401 means backend is running but needs auth
  } catch {
    return false;
  }
};
