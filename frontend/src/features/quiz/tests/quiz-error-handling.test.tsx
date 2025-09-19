import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { axiosGeneration } from '@/lib/axios';
import ProjectTests from '@/app/projects/[projectId]/tests/page';

// Mock the axios instances
jest.mock('@/lib/axios', () => ({
  axiosGeneration: {
    get: jest.fn(),
    post: jest.fn(),
  },
  axiosApi: {
    get: jest.fn(),
  }
}));

// Mock the project context/provider
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

// Mock router
jest.mock('next/navigation', () => ({
  useParams: () => ({ projectId: '203062be-58d0-4f98-bbd4-33b4ce081276' }),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockAxiosGeneration = axiosGeneration as any;

describe('Quiz Center Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle network timeout errors gracefully', async () => {
    // Mock timeout error for diagnostic sessions
    const timeoutError = new Error('Network Error');
    timeoutError.name = 'AxiosError';
    (timeoutError as any).code = 'ECONNABORTED';
    (timeoutError as any).message = 'timeout of 30000ms exceeded';

    mockAxiosGeneration.get.mockRejectedValueOnce(timeoutError);

    render(<ProjectTests />);

    // Should show loading state initially
    expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();

    // Should show error message after timeout
    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/failed/i) || screen.getByText(/try again/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify the correct API call was attempted
    expect(mockAxiosGeneration.get).toHaveBeenCalledWith(
      'diagnostic-sessions/',
      expect.objectContaining({
        params: { project: '203062be-58d0-4f98-bbd4-33b4ce081276' }
      })
    );
  });

  it('should handle database connection errors (too many clients)', async () => {
    // Mock PostgreSQL connection error
    const dbError = new Error('Database connection failed');
    (dbError as any).response = {
      status: 500,
      data: { 
        detail: 'connection to server failed: FATAL: sorry, too many clients already'
      }
    };

    mockAxiosGeneration.get.mockRejectedValueOnce(dbError);

    render(<ProjectTests />);

    // Should show appropriate error message
    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/connection/i) || screen.getByText(/server/i)).toBeInTheDocument();
    });
  });

  it('should recover when API calls succeed after initial failure', async () => {
    const mockSessions = [
      {
        id: '1',
        title: 'Test Quiz 1',
        created_at: '2025-09-19T07:00:00Z',
        status: 'completed',
      }
    ];

    // First call fails, second succeeds
    mockAxiosGeneration.get
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce({ data: mockSessions });

    render(<ProjectTests />);

    // Should show error initially
    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
    });

    // Simulate retry (component should have retry mechanism)
    // This could be triggered by a retry button or automatic retry
    await act(async () => {
      // If there's a retry button, click it
      const retryButton = screen.queryByText(/retry/i) || screen.queryByText(/try again/i);
      if (retryButton) {
        retryButton.click();
      }
    });

    // Should show sessions after successful retry
    await waitFor(() => {
      expect(screen.getByText('Test Quiz 1') || screen.getByText(/quiz/i)).toBeInTheDocument();
    });
  });

  it('should handle empty quiz sessions gracefully', async () => {
    // Mock empty response
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: [] });

    render(<ProjectTests />);

    // Should show empty state message
    await waitFor(() => {
      expect(screen.getByText(/no quizzes/i) || screen.getByText(/generate your first quiz/i)).toBeInTheDocument();
    });
  });

  it('should handle quiz generation errors', async () => {
    // Mock successful sessions fetch but failed generation
    mockAxiosGeneration.get.mockResolvedValueOnce({ data: [] });
    
    const generationError = new Error('Generation failed');
    (generationError as any).response = {
      status: 400,
      data: { detail: 'Insufficient project materials for quiz generation' }
    };
    
    mockAxiosGeneration.post.mockRejectedValueOnce(generationError);

    render(<ProjectTests />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/generate/i) || screen.getByText(/create/i)).toBeInTheDocument();
    });

    // Simulate clicking generate quiz button
    const generateButton = screen.getByText(/auto-generate/i) || screen.getByText(/generate/i);
    if (generateButton) {
      await act(async () => {
        generateButton.click();
      });

      // Should show generation error
      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i) || screen.getByText(/insufficient/i)).toBeInTheDocument();
      });
    }
  });

  it('should handle concurrent API calls without duplicate requests', async () => {
    // Mock delay to simulate slow response
    const delayedPromise = new Promise(resolve => 
      setTimeout(() => resolve({ data: [] }), 1000)
    );
    
    mockAxiosGeneration.get.mockReturnValueOnce(delayedPromise);

    render(<ProjectTests />);

    // Verify only one API call is made despite potential re-renders
    await waitFor(() => {
      expect(mockAxiosGeneration.get).toHaveBeenCalledTimes(1);
    });
  });
});
