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

export const createProject = async (projectData: ProjectData) => {
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

export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
} 