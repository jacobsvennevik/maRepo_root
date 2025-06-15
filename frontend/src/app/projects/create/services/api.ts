import { ProjectSetup } from '../types';

export interface ProjectData {
  name: string;
  project_type: 'school' | 'self_study';
  course_name?: string;
  course_code?: string;
  teacher_name?: string;
  goal_description?: string;
  study_frequency?: string;
  important_dates?: { title: string; date: string; }[];
  [key: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function createProject(projectData: ProjectData, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create project');
  }

  return response.json();
}

export async function uploadFile(file: File, uploadType: string, token: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/${uploadType}/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload file');
  }

  return response.json();
} 