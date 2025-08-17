import { ProjectApiResponse, ProjectV2 } from './types';
import { mapApiResponseToProjectV2, isStiModeEnabled } from './utils';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic API client for making HTTP requests
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Fetch projects from the API
 * Returns either legacy Project[] or ProjectV2[] based on STI mode
 */
export async function fetchProjects(): Promise<ProjectV2[]> {
  try {
    const apiResponse: ProjectApiResponse[] = await apiRequest<ProjectApiResponse[]>('/api/projects/');
    
    if (isStiModeEnabled()) {
      // Map to STI format
      return apiResponse.map(mapApiResponseToProjectV2);
    } else {
      // For legacy mode, we'd need to map to the old Project format
      // This is a simplified mapping - you might need to adjust based on your legacy structure
      return apiResponse.map((project) => ({
        id: project.id,
        kind: project.project_type as 'school' | 'self_study',
        description: project.name,
        lastUpdated: new Date(project.updated_at).toLocaleDateString(),
        type: 'biology' as const,
        progress: 0,
        collaborators: 0,
        ...(project.project_type === 'school' ? {
          school_meta: {
            course_name: project.course_name || '',
            course_code: project.course_code || '',
            teacher_name: project.teacher_name || '',
          }
        } : {
          self_study_meta: {
            goal_description: project.goal_description || '',
            study_frequency: project.study_frequency || '',
          }
        })
      })) as ProjectV2[];
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

/**
 * Create a new project
 */
export async function createProject(projectData: Record<string, unknown>): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse = await apiRequest<ProjectApiResponse>('/api/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    
    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(projectId: string, projectData: Record<string, unknown>): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse = await apiRequest<ProjectApiResponse>(`/api/projects/${projectId}/`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    });
    
    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await apiRequest(`/api/projects/${projectId}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

/**
 * Get a single project by ID
 */
export async function fetchProject(projectId: string): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse = await apiRequest<ProjectApiResponse>(`/api/projects/${projectId}/`);
    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw error;
  }
} 