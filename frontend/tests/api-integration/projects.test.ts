/**
 * API Integration Tests for Projects
 * These tests will identify and help fix Project API endpoint issues
 */

import { axiosApi } from '@/lib/axios';
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

describe('Projects API Integration Tests', () => {
  const testProjectId = 'test-project-123';
  
  describe('Project CRUD Operations', () => {
    it('should test project creation endpoint', async () => {
      const endpoint = 'projects/';
      const projectData = {
        name: 'Test Project',
        description: 'A test project for API validation',
        education_level: 'undergraduate'
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        const response = await axiosApi.post(endpoint, projectData);
        console.log('✅ Project creation success:', response.status);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test project listing endpoint', async () => {
      const endpoint = 'projects/';
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test individual project retrieval', async () => {
      const endpoint = `projects/${testProjectId}/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (fullURL) {
          expect(fullURL).toContain(testProjectId);
        }
      }
    });

    it('should test project update endpoint', async () => {
      const endpoint = `projects/${testProjectId}/`;
      const updateData = {
        name: 'Updated Test Project',
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

    it('should test project deletion endpoint', async () => {
      const endpoint = `projects/${testProjectId}/`;
      
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

  describe('Project Files API', () => {
    it('should test project files listing', async () => {
      const endpoint = `projects/${testProjectId}/files/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (fullURL) {
          expect(fullURL).toContain('files');
        }
      }
    });

    it('should test file upload endpoint', async () => {
      const endpoint = `projects/${testProjectId}/upload_file/`;
      
      // Create a mock FormData object
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('file_type', 'course_files');
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
      }
    });

    it('should test individual file retrieval', async () => {
      const fileId = 'test-file-456';
      const endpoint = `projects/${testProjectId}/files/${fileId}/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (fullURL) {
          expect(fullURL).toContain(fileId);
        }
      }
    });

    it('should test file deletion', async () => {
      const fileId = 'test-file-456';
      const endpoint = `projects/${testProjectId}/files/${fileId}/`;
      
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

  describe('Project Study Materials API', () => {
    it('should test study materials listing', async () => {
      const endpoint = `projects/${testProjectId}/study-materials/`;
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.get(endpoint);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (fullURL) {
          expect(fullURL).toContain('study-materials');
        }
      }
    });

    it('should test study material creation', async () => {
      const endpoint = `projects/${testProjectId}/study-materials/`;
      const materialData = {
        title: 'Test Study Material',
        content: 'This is test content for study materials',
        material_type: 'notes'
      };
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, materialData);
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
      }
    });
  });

  describe('Project Cleanup API', () => {
    it('should test draft cleanup endpoint', async () => {
      const endpoint = 'projects/cleanup_drafts/';
      
      const full = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
      expect(full).toHaveNoDoubleSlash();
      
      try {
        await axiosApi.post(endpoint, {});
      } catch (error: any) {
        const fullURL = joinUrl(error.config?.baseURL || '', error.config?.url || '');
        expect(fullURL).toHaveNoDoubleSlash();
        if (error.config?.method) {
          expect(error.config.method).toBe('post');
        }
        if (error.config?.url) {
          expect(error.config.url).toBe(endpoint);
        }
      }
    });

    it('should test project analytics', async () => {
      const endpoint = `projects/${testProjectId}/analytics/`;
      
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

  describe('Error Pattern Detection', () => {
    it('should analyze Project API error patterns', () => {
      // Check for double slash patterns
      const doubleSlashErrors = apiErrors.filter(err => 
        err.some((arg: any) => 
          typeof arg === 'object' && 
          (arg.url?.includes('//') || arg.fullURL?.includes('//projects/'))
        )
      );
      
      expect(doubleSlashErrors.length).toBe(0);
    });

    it('should check for authentication errors', () => {
      const authErrors = apiErrors.filter(err =>
        err.some((arg: any) => 
          typeof arg === 'object' && 
          (arg.status === 401 || arg.status === 403)
        )
      );
      
      console.log('🔍 Authentication errors found:', authErrors.length);
      
      if (authErrors.length > 0) {
        console.warn('⚠️  Authentication issues detected in Project API!');
        authErrors.forEach((err, index) => {
          console.warn(`🚫 Auth Error ${index + 1}:`, err);
        });
      }
    });
  });

  describe('Project URL Validation', () => {
    it('should validate all project-related endpoint URLs', () => {
      const testEndpoints = [
        'projects/',
        `projects/${testProjectId}/`,
        `projects/${testProjectId}/files/`,
        `projects/${testProjectId}/files/123/`,
        `projects/${testProjectId}/upload_file/`,
        `projects/${testProjectId}/study-materials/`,
        `projects/${testProjectId}/study-materials/456/`,
        `projects/${testProjectId}/analytics/`,
        'projects/cleanup_drafts/',
      ];
      
      testEndpoints.forEach(endpoint => {
        // Check for leading slash (should not have one)
        expect(endpoint.startsWith('/')).toBe(false);
        
        // Check for double slashes
        expect(endpoint.includes('//')).toBe(false);
        
        const fullURL = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
        // Verify no double slashes in full URL
        expect(fullURL).toHaveNoDoubleSlash();
      });
    });

    it('should validate specific problematic endpoints', () => {
      // Test the specific endpoints that were causing issues
      const problematicEndpoints = [
        `projects/${testProjectId}/flashcard-sets/`,
        `projects/${testProjectId}/files/`,
        `projects/${testProjectId}/study-materials/`,
      ];
      
      problematicEndpoints.forEach(endpoint => {
        // These were the ones causing the double slash issues
        expect(endpoint.startsWith('/')).toBe(false);
        const fullURL = joinUrl((axiosApi.defaults as any).baseURL, endpoint);
        // This should NOT contain double slashes
        expect(fullURL).toHaveNoDoubleSlash();
        expect(fullURL).toContain(endpoint);
      });
    });
  });
});
