/**
 * API Integration Tests for Flashcards
 * These tests will identify and help fix API endpoint issues
 */

import { axiosApi, axiosGeneration } from '@/lib/axios';
import { joinUrl } from '../utils/url';

// Mock console.error to capture API errors
const originalConsoleError = console.error;
let apiErrors: any[] = [];

beforeEach(() => {
  apiErrors = [];
  console.error = jest.fn((...args: any[]) => {
    const first = args[0];
    const isInterestingString = typeof first === 'string' && (first.includes('API error') || first.includes('Server error'));
    const hasAxiosFields = args.some((a: any) => a && typeof a === 'object' && (a.url || a.fullURL || a.method));
    if (isInterestingString || hasAxiosFields) {
      apiErrors.push(args);
    }
    return originalConsoleError(...args);
  });
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Flashcard API Integration Tests', () => {
  const testProjectId = 'test-project-123';
  
  describe('Flashcard Sets API', () => {
    it('should test flashcard sets endpoint URL construction', async () => {
      // Test the endpoint that was failing with double slashes
      const endpoint = `projects/${testProjectId}/flashcard-sets/`;
      
      const fullURL = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(fullURL).toHaveNoDoubleSlash();
      
      try {
        const response = await axiosApi.get(endpoint);
        console.log('✅ Success response:', response.status);
      } catch (error: any) {
        const errFull = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(errFull).toHaveNoDoubleSlash();
        const msg = String(error?.message || '');
        expect(msg.toLowerCase()).toContain('network');
      }
      
      expect(fullURL).toHaveNoDoubleSlash();
    });

    it('should test individual flashcard set retrieval', async () => {
      const setId = 'test-set-456';
      const endpoint = `projects/${testProjectId}/flashcard-sets/${setId}/`;
      
      const base = (axiosGeneration.defaults as any).baseURL;
      const full = joinUrl(base, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosGeneration.get(endpoint);
      } catch (error: any) {
        const errFull = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(errFull).toHaveNoDoubleSlash();
        const msg = String(error?.message || '');
        expect(msg.toLowerCase()).toContain('network');
      }
    });

    it('should test flashcard creation endpoint', async () => {
      const endpoint = `projects/${testProjectId}/flashcard-sets/`;
      const testData = {
        name: 'Test Flashcard Set',
        description: 'A test set for API validation'
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, testData);
      } catch (error: any) {
        const errFull = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(errFull).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
      }
    });

    it('should test flashcards due endpoint', async () => {
      const endpoint = `projects/${testProjectId}/flashcards/due/?limit=10`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const errFull = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(errFull).toHaveNoDoubleSlash();
        if (errFull) {
          expect(errFull).toContain('limit=10');
        }
      }
    });
  });

  describe('Individual Flashcard Operations', () => {
    it('should test flashcard deletion endpoint', async () => {
      const cardId = 'test-card-789';
      const endpoint = `flashcards/${cardId}/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.delete(endpoint);
      } catch (error: any) {
        if (error.config?.method) {
          expect(error.config.method).toBe('delete');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test flashcard review endpoint', async () => {
      const cardId = 'test-card-789';
      const endpoint = `flashcards/${cardId}/review/`;
      const reviewData = { 
        difficulty: 'easy', 
        response_time: 5000 
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, reviewData);
      } catch (error: any) {
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });
  });

  describe('Error Pattern Detection', () => {
    it('should identify common API error patterns', () => {
      // Analyze error patterns
      const doubleSlashErrors = apiErrors.filter(err => 
        err.some((arg: any) => 
          typeof arg === 'object' && 
          arg.url?.includes('//')
        )
      );
      
      const networkErrors = apiErrors.filter(err =>
        err.some((arg: any) => 
          typeof arg === 'string' && 
          arg.includes('Network error')
        )
      );
      
      // In test environment, we expect network errors but no URL construction errors
      expect(doubleSlashErrors.length).toBe(0);
    });
  });

  describe('URL Construction Validation', () => {
    it('should validate all flashcard endpoint URLs', () => {
      const testEndpoints = [
        `projects/${testProjectId}/flashcard-sets/`,
        `projects/${testProjectId}/flashcard-sets/123/`,
        `projects/${testProjectId}/flashcards/due/`,
        `flashcards/456/`,
        `flashcards/456/review/`,
      ];
      
      testEndpoints.forEach(endpoint => {
        // Check for leading slash (should not have one when using axiosApi)
        expect(endpoint.startsWith('/')).toBe(false);
        
        // Check for double slashes within the endpoint
        expect(endpoint.includes('//')).toBe(false);
        
        const fullURL = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
        // Verify no double slashes in full URL
        expect(fullURL).toHaveNoDoubleSlash();
      });
    });
  });
});
