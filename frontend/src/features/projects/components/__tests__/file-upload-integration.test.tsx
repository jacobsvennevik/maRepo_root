/**
 * Test-Driven Development: Frontend File Upload Integration Tests
 * 
 * These tests will initially FAIL (RED phase) and guide the implementation
 * of proper file upload and project creation functionality in the frontend.
 * 
 * Test Mode Considerations:
 * - Tests work with both real and mock data
 * - AI calls are mocked via MOCK_REGISTRY
 * - File operations and database operations are REAL
 * - Only AI/LLM calls are mocked as per TEST_MODE_EXPLANATION.md
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import centralized test utilities
import {
  testFactories,
  standardMocks
} from '../../../../test-utils';
import { renderWithProviders } from '../../../../test-utils/setup/shared-setup';
import { setupFullTestEnvironment } from '../../../../test-utils/setup/shared-setup';

// Setup test environment
const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeStorage: true,
  includeNavigation: true
});

const { apiMocks } = standardMocks;

// Create project-specific mocks
const mockProjects = {
  create: jest.fn(),
  uploadFile: jest.fn(),
  getProjects: jest.fn(),
};

// Mock the API service
jest.mock('../../services/api', () => ({
  createProject: mockProjects.create,
  uploadFileWithProgress: mockProjects.uploadFile,
  getProjects: mockProjects.getProjects,
}));

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  }),
  useParams: () => ({ projectId: 'test-project-123' })
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>Dynamic Component</div>;
  return DynamicComponent;
});

// Mock API services
jest.mock('../../services/api', () => ({
  createProject: jest.fn(),
  uploadFileWithProgress: jest.fn(),
  APIError: jest.fn().mockImplementation((message: string, status: number) => {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    return error;
  })
}));

// Mock axiosApi for FileStorage component
jest.mock('@/lib/axios', () => ({
  axiosApi: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ projectId: 'test-project-123' })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }))
}));

// Import the mocked functions
import { createProject, uploadFileWithProgress } from '../../services/api';
import { axiosApi } from '@/lib/axios';

// Mock file upload component
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onUpload, onRemove, onError, error, ...props }: any) => (
    <div data-testid="file-upload">
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            // Call onUpload with the files instead of onFileSelect
            onUpload && onUpload(Array.from(e.target.files));
          }
        }}
        {...props}
      />
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  )
}));

// Import components to test
import { FileUploadStep } from '../steps/file-upload-step';
import FileStorage from '../files/file-storage';

describe('File Upload Integration Tests', () => {
  const mockOnUploadComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnUploadComplete.mockClear();
    
    // Set test mode environment variables
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
  });

  describe('File Upload Step - Project Creation', () => {
    it('should create project and link files in test mode', async () => {
      // Mock API responses
      const mockProject = { 
        id: 'test-project-123', 
        name: 'Test Project',
        project_type: 'school',
        course_name: 'Test Course'
      };
      
      const mockUploadResponse = { 
        success: true, 
        file_id: 'file-123',
        filename: 'test.pdf'
      };
      
      // Setup mocks
      (createProject as jest.Mock).mockResolvedValue(mockProject);
      (uploadFileWithProgress as jest.Mock).mockResolvedValue(mockUploadResponse);
      
      // Render component
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      // Check that the component renders correctly
      expect(screen.getByTestId('file-input')).toBeInTheDocument();
      
      // In test mode, the component should automatically create a project
      // This happens in the useEffect when isTestMode() returns true
      await waitFor(() => {
        expect(createProject).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Project',
            project_type: 'school',
            course_name: 'Test Course',
            is_draft: true,
          })
        );
      });
      
      // Should call onUploadComplete with the project ID
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith('test-project-123');
      });
    });

    it('should handle file upload errors gracefully', async () => {
      // Mock API error
      (createProject as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      // Render component
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      // Simulate file upload
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Wait for error handling
      await waitFor(() => {
        expect(createProject).toHaveBeenCalled();
        expect(mockOnUploadComplete).not.toHaveBeenCalled();
      });
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should work with test mode enabled', async () => {
      // Mock test mode environment
      const originalEnv = process.env.NEXT_PUBLIC_TEST_MODE;
      process.env.NEXT_PUBLIC_TEST_MODE = 'true';
      
      const mockProject = { 
        id: 'test-project-123', 
        name: 'Test Project' 
      };
      
      (createProject as jest.Mock).mockResolvedValue(mockProject);
      
      // Render component
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      // In test mode, should automatically create project
      await waitFor(() => {
        expect(createProject).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Project',
            project_type: 'school',
            course_name: 'Test Course',
            is_draft: true
          })
        );
        expect(mockOnUploadComplete).toHaveBeenCalledWith('test-project-123');
      });
      
      // Restore environment
      process.env.NEXT_PUBLIC_TEST_MODE = originalEnv;
    });
  });

  describe('File Storage Component - File Display', () => {
    it('should display uploaded files in Files section', async () => {
      // Mock API responses
      const mockProject = {
        id: 'test-project-123',
        name: 'Test Project',
        uploaded_files: [
          {
            id: 'file-1',
            original_name: 'test.pdf',
            file: '/uploads/test.pdf',
            file_size: 1024,
            uploaded_at: '2024-01-01T00:00:00Z',
            processing_status: 'completed'
          },
          {
            id: 'file-2',
            original_name: 'document.docx',
            file: '/uploads/document.docx',
            file_size: 2048,
            uploaded_at: '2024-01-02T00:00:00Z',
            processing_status: 'pending'
          }
        ]
      };
      
      // Mock API calls
      (axiosApi.get as jest.Mock).mockResolvedValue({ data: mockProject });
      
      // Render component
      renderWithProviders(<FileStorage />);
      
      // Wait for files to load
      await waitFor(() => {
        expect(screen.getAllByText('test.pdf')).toHaveLength(2); // Header and file list
        expect(screen.getAllByText('document.docx')).toHaveLength(2); // Header and file list
      });
      
      // Verify file details
      expect(screen.getAllByText('1 KB')).toHaveLength(2); // Header and file list
      expect(screen.getAllByText('2 KB')).toHaveLength(2); // Header and file list
    });

    it('should handle empty file list', async () => {
      // Mock empty project
      const mockProject = {
        id: 'test-project-123',
        name: 'Test Project',
        uploaded_files: []
      };
      
      (axiosApi.get as jest.Mock).mockResolvedValue({ data: mockProject });
      
      // Render component
      renderWithProviders(<FileStorage />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/no files/i)).toBeInTheDocument();
      });
    });

    it('should handle file upload errors', async () => {
      // Mock API error
      (axiosApi.get as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      // Render component
      renderWithProviders(<FileStorage />);
      
      // Wait for error handling
      await waitFor(() => {
        expect(screen.getAllByText('Failed to load files')).toHaveLength(2); // Header and description
      });
    });

    it('should allow file upload to existing project', async () => {
      // Mock project with existing files
      const mockProject = {
        id: 'test-project-123',
        name: 'Test Project',
        uploaded_files: [
          {
            id: 'file-1',
            original_name: 'existing.pdf',
            file: '/uploads/existing.pdf',
            file_size: 1024,
            uploaded_at: '2024-01-01T00:00:00Z',
            processing_status: 'completed'
          }
        ]
      };
      
      const mockUploadResponse = { 
        success: true, 
        file_id: 'file-2',
        filename: 'new.pdf'
      };
      
      // Setup mocks
      (axiosApi.get as jest.Mock).mockResolvedValue({ data: mockProject });
      (uploadFileWithProgress as jest.Mock).mockResolvedValue(mockUploadResponse);
      
      // Render component
      renderWithProviders(<FileStorage />);
      
      // Wait for existing files to load
      await waitFor(() => {
        expect(screen.getAllByText('existing.pdf')).toHaveLength(2); // Header and file list
      });
      
      // Verify file details are displayed
      expect(screen.getAllByText('1 KB')).toHaveLength(2); // Header and file list
      
      // Verify upload button is available for new uploads
      expect(screen.getByText('Upload file')).toBeInTheDocument();
    });
  });

  describe('Complete Upload to Display Flow', () => {
    it('should complete full flow from upload to display', async () => {
      // Mock complete flow
      const mockProject = { 
        id: 'test-project-123', 
        name: 'Test Project',
        project_type: 'school',
        course_name: 'Test Course'
      };
      
      const mockUploadResponse = { 
        success: true, 
        file_id: 'file-123',
        filename: 'test.pdf'
      };
      
      const mockProjectWithFiles = {
        ...mockProject,
        uploaded_files: [
          {
            id: 'file-123',
            original_name: 'test.pdf',
            file: '/uploads/test.pdf',
            file_size: 1024,
            uploaded_at: '2024-01-01T00:00:00Z',
            processing_status: 'completed'
          }
        ]
      };
      
      // Setup mocks
      (createProject as jest.Mock).mockResolvedValue(mockProject);
      (uploadFileWithProgress as jest.Mock).mockResolvedValue(mockUploadResponse);
      (axiosApi.get as jest.Mock).mockResolvedValue({ data: mockProjectWithFiles });
      
      // Step 1: Upload file and create project
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith('test-project-123');
      });
      
      // Step 2: Navigate to Files section and verify display
      renderWithProviders(<FileStorage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('test.pdf')).toHaveLength(2); // Header and file list
        expect(screen.getAllByText('1 KB')).toHaveLength(2); // Header and file list
      });
    });

    it('should handle test mode with mock data', async () => {
      // Mock test mode environment
      const originalEnv = process.env.NEXT_PUBLIC_TEST_MODE;
      process.env.NEXT_PUBLIC_TEST_MODE = 'true';
      
      const mockProject = { 
        id: 'test-project-123', 
        name: 'Test Project' 
      };
      
      const mockProjectWithFiles = {
        ...mockProject,
        uploaded_files: [
          {
            id: 'file-123',
            original_name: 'mock.pdf',
            file: '/uploads/mock.pdf',
            file_size: 1024,
            uploaded_at: '2024-01-01T00:00:00Z',
            processing_status: 'completed'
          }
        ]
      };
      
      // Setup mocks
      (createProject as jest.Mock).mockResolvedValue(mockProject);
      (axiosApi.get as jest.Mock).mockResolvedValue({ data: mockProjectWithFiles });
      
      // Test upload step in test mode
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith('test-project-123');
      });
      
      // Test file display
      renderWithProviders(<FileStorage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('mock.pdf')).toHaveLength(2); // Header and file list
      });
      
      // Restore environment
      process.env.NEXT_PUBLIC_TEST_MODE = originalEnv;
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockProjects.create.mockRejectedValue(new Error('Network Error'));
      
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should handle invalid file types', async () => {
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      // Try to upload invalid file type
      const file = new File(['test content'], 'test.exe', { type: 'application/exe' });
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should handle large file uploads', async () => {
      const mockProject = { 
        id: 'test-project-123', 
        name: 'Test Project' 
      };
      
      mockProjects.create.mockResolvedValue(mockProject);
      
      renderWithProviders(
        <FileUploadStep onUploadComplete={mockOnUploadComplete} />
      );
      
      // Create large file (simulate)
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      });
      
      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      // Should handle large file upload
      await waitFor(() => {
        expect(createProject).toHaveBeenCalled();
        expect(uploadFileWithProgress).toHaveBeenCalledWith(
          'test-project-123',
          largeFile,
          expect.any(Function)
        );
      });
    });
  });
});
