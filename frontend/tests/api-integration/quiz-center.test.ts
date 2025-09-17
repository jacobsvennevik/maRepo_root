/**
 * API Integration Tests for Quiz Center
 * These tests will identify and help fix Quiz Center API endpoint issues
 */

import { axiosApi } from '@/lib/axios';
jest.setTimeout(30000);
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

describe('Quiz Center API Integration Tests', () => {
  const testProjectId = 'test-project-123';
  
  describe('Quiz Management API', () => {
    it('should test quiz creation endpoint', async () => {
      const endpoint = `projects/${testProjectId}/quizzes/`;
      const quizData = {
        title: 'Test Quiz',
        description: 'A test quiz for API validation',
        quiz_type: 'practice',
        source_files: ['file1.pdf'],
        difficulty: 'medium'
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        const response = await axiosApi.post(endpoint, quizData);
        console.log('✅ Quiz creation success:', response.status);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
      }
    });

    it('should test quiz listing endpoint', async () => {
      const endpoint = `projects/${testProjectId}/quizzes/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
      }
    });

    it('should test individual quiz retrieval', async () => {
      const quizId = 'test-quiz-456';
      const endpoint = `projects/${testProjectId}/quizzes/${quizId}/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (fullURL) {
          expect(fullURL).toContain(quizId);
        }
      }
    });

    it('should test quiz update endpoint', async () => {
      const quizId = 'test-quiz-456';
      const endpoint = `projects/${testProjectId}/quizzes/${quizId}/`;
      const updateData = {
        title: 'Updated Test Quiz',
        description: 'Updated description'
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.patch(endpoint, updateData);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('patch');
        }
      }
    });

    it('should test quiz deletion endpoint', async () => {
      const quizId = 'test-quiz-456';
      const endpoint = `projects/${testProjectId}/quizzes/${quizId}/`;
      
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
  });

  describe('Quiz Session API', () => {
    it('should test quiz session start endpoint', async () => {
      const quizId = 'test-quiz-456';
      const endpoint = `projects/${testProjectId}/quizzes/${quizId}/start/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, {});
      } catch (error: any) {
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test quiz answer submission endpoint', async () => {
      const sessionId = 'test-session-789';
      const endpoint = `quiz-sessions/${sessionId}/submit-answer/`;
      const answerData = {
        question_id: 'q1',
        answer: 'A',
        time_taken: 15000
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, answerData);
      } catch (error: any) {
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test quiz results endpoint', async () => {
      const sessionId = 'test-session-789';
      const endpoint = `quiz-sessions/${sessionId}/results/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });
  });

  describe('Quiz Analytics API', () => {
    it('should test quiz analytics endpoint', async () => {
      const quizId = 'test-quiz-456';
      const endpoint = `projects/${testProjectId}/quizzes/${quizId}/analytics/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
      }
    });

    it('should test project quiz statistics endpoint', async () => {
      const endpoint = `projects/${testProjectId}/quiz-statistics/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
      }
    });
  });

  describe('Quiz Template API', () => {
    it('should test quiz template listing', async () => {
      const endpoint = 'quiz-templates/';
      
      console.log('🔍 Testing quiz templates:', endpoint);
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        console.log('❌ Quiz templates error:', {
          url: error.config?.url
        });
        
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
        expect(endpoint.startsWith('/')).toBe(false);
      }
    });

    it('should test quiz generation from template', async () => {
      const templateId = 'template-123';
      const endpoint = `quiz-templates/${templateId}/generate/`;
      const generationData = {
        project_id: testProjectId,
        source_files: ['file1.pdf'],
        difficulty: 'medium',
        question_count: 10
      };
      
      console.log('🔍 Testing quiz generation from template:', endpoint);
      
      try {
        await axiosApi.post(endpoint, generationData);
      } catch (error: any) {
        console.log('❌ Quiz generation error:', {
          url: error.config?.url,
          method: error.config?.method
        });
        
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
    it('should analyze Quiz Center API error patterns', () => {
      console.log('📊 Quiz API Errors captured:', apiErrors);
      
      // Check for double slash patterns
      const doubleSlashErrors = apiErrors.filter(err => 
        err.some((arg: any) => 
          typeof arg === 'object' && 
          (arg.url?.includes('//') || arg.fullURL?.includes('//projects/'))
        )
      );
      
      console.log('🔍 Double slash errors in Quiz API:', doubleSlashErrors.length);
      
      if (doubleSlashErrors.length > 0) {
        console.warn('⚠️  Quiz API double slash issues detected!');
        doubleSlashErrors.forEach((err, index) => {
          console.warn(`❌ Quiz Error ${index + 1}:`, err);
        });
      }
      
      expect(doubleSlashErrors.length).toBe(0);
    });
  });

  describe('Quiz Center URL Validation', () => {
    it('should validate all quiz-related endpoint URLs', () => {
      const testEndpoints = [
        `projects/${testProjectId}/quizzes/`,
        `projects/${testProjectId}/quizzes/123/`,
        `projects/${testProjectId}/quizzes/123/start/`,
        `projects/${testProjectId}/quizzes/123/analytics/`,
        `projects/${testProjectId}/quiz-statistics/`,
        'quiz-sessions/456/submit-answer/',
        'quiz-sessions/456/results/',
        'quiz-templates/',
        'quiz-templates/123/generate/',
      ];
      
      testEndpoints.forEach(endpoint => {
        // Check for leading slash (should not have one)
        expect(endpoint.startsWith('/')).toBe(false);
        
        // Check for double slashes
        expect(endpoint.includes('//')).toBe(false);
        
        const fullURL = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
        expect(fullURL).toHaveNoDoubleSlash();
      });
    });
  });
});
