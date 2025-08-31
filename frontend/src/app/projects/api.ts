import { ProjectApiResponse, ProjectV2 } from "./types";
import { mapApiResponseToProjectV2 } from "./utils";
import axiosInstance from "@/lib/axios";

/**
 * Generic API client for making HTTP requests using authenticated axios instance
 */
async function apiRequest<T>(endpoint: string, options: any = {}): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });

    return response.data;
  } catch (error: any) {
    console.error("API request error:", error);
    throw error;
  }
}

/**
 * Fetch projects from the API
 * Returns ProjectV2[] with STI data structure
 */
export async function fetchProjects(): Promise<ProjectV2[]> {
  try {
    const apiResponse: ProjectApiResponse[] =
      await apiRequest<ProjectApiResponse[]>("/api/projects/");

    // Ensure we have a valid response structure
    if (!apiResponse || !Array.isArray(apiResponse)) {
      throw new Error("Invalid response structure from API");
    }

    // Map to STI format
    return apiResponse.map(mapApiResponseToProjectV2);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    // Provide a consistent error message for network/API errors
    if (error instanceof Error) {
      throw new Error("Failed to load projects");
    }
    throw new Error("Failed to load projects");
  }
}

/**
 * Create a new project
 */
export async function createProject(
  projectData: Record<string, unknown>,
): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse =
      await apiRequest<ProjectApiResponse>("/api/projects/", {
        method: "POST",
        data: projectData,
      });

    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  projectData: Record<string, unknown>,
): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse =
      await apiRequest<ProjectApiResponse>(`/api/projects/${projectId}/`, {
        method: "PATCH",
        data: projectData,
      });

    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error("Failed to update project:", error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await apiRequest(`/api/projects/${projectId}/`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
}

/**
 * Fetch a single project by ID
 */
export async function fetchProject(projectId: string): Promise<ProjectV2> {
  try {
    const apiResponse: ProjectApiResponse =
      await apiRequest<ProjectApiResponse>(`/api/projects/${projectId}/`);

    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw error;
  }
}
