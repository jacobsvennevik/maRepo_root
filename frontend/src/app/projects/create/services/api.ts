import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { ProjectSetup } from '../types';

export interface ProjectData {
  name: string;
  project_type: 'school' | 'self_study';
  course_name?: string;
  course_code?: string;
  teacher_name?: string;
  syllabus?: string;
  goal_description?: string;
  study_frequency?: string;
  start_date?: string;
  end_date?: string;
  is_draft?: boolean;
  [key: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Test mode - set to true to bypass API calls and use mock data
const TEST_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_MODE !== 'false';

export const createProject = async (projectData: ProjectData) => {
  // TEST MODE: Return mock project data
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Creating mock project instead of API call', projectData);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockProject = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      name: projectData.name,
      project_type: projectData.project_type,
      course_name: projectData.course_name,
      course_code: projectData.course_code,
      teacher_name: projectData.teacher_name,
      is_draft: projectData.is_draft,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...projectData
    };
    
    console.log('🧪 TEST MODE: Mock project created:', mockProject);
    return mockProject;
  }

  try {
    const response = await axiosInstance.post('/api/projects/', projectData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Project creation error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new APIError(
        error.response.status, 
        error.response.data.detail || error.response.data.message || 'Failed to create project'
      );
    }
    throw new Error('Failed to create project');
  }
};

export const uploadFileWithProgress = async (
  projectId: string,
  file: File,
  onProgress: (progress: number) => void
) => {
  // TEST MODE: Simulate file upload with progress
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Simulating file upload with progress', { projectId, fileName: file.name });
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(progress);
    }
    
    const mockResponse = {
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      size: file.size,
      upload_date: new Date().toISOString(),
      project_id: projectId
    };
    
    console.log('🧪 TEST MODE: Mock file uploaded:', mockResponse);
    return mockResponse;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    const response = await axiosInstance.post(
      `/api/projects/${projectId}/upload_file/`,
      formData,
      {
    headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('File upload error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new APIError(
        error.response.status, 
        error.response.data.detail || error.response.data.message || 'Failed to upload file'
      );
  }
    throw new Error('Failed to upload file');
}
};

export async function uploadSyllabus(projectId: string, file: File): Promise<any> {
  // TEST MODE: Return mock syllabus upload
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Mock syllabus upload', { projectId, fileName: file.name });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      project_id: projectId,
      upload_type: 'syllabus'
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post(
      `/api/projects/${projectId}/upload_file/`,
      formData,
      {
    headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Syllabus upload error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail || error.response.data.message || 'Failed to upload syllabus'
      );
  }
    throw new Error('Failed to upload syllabus');
  }
}

export async function uploadFile(file: File, uploadType: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post(
      `/api/upload/${uploadType}/`,
      formData,
      {
    headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('File upload error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail || error.response.data.message || 'Failed to upload file'
      );
  }
    throw new Error('Failed to upload file');
  }
}

export const getProjects = async () => {
  if (TEST_MODE) {
    // Return mock projects if in test mode
    const { mockProjects } = await import('../../data/mock-projects');
    return mockProjects;
  }
  try {
    const response = await axiosInstance.get('/api/projects/');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.detail || error.response.data.message || 'Failed to fetch projects'
      );
    }
    throw new Error('Failed to fetch projects');
  }
};

export const finalizeProject = async (projectId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/projects/${projectId}/`, { is_draft: false });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.detail || error.response.data.message || 'Failed to finalize project'
      );
    }
    throw new Error('Failed to finalize project');
  }
};

export const cleanupAbandonedDrafts = async (hours: number = 24) => {
  try {
    const response = await axiosInstance.post('/api/projects/cleanup_drafts/', { hours });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.error || error.response.data.message || 'Failed to cleanup abandoned drafts'
      );
    }
    throw new Error('Failed to cleanup abandoned drafts');
  }
};

export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
} 