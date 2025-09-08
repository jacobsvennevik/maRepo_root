import { ProjectApiResponse, ProjectV2 } from "./types";
import { mapApiResponseToProjectV2 } from "./utils";
import { axiosApi } from "@/lib/axios-api";

/**
 * Generic API client for making HTTP requests using authenticated axios instance
 */
async function apiRequest<T>(endpoint: string, options: any = {}): Promise<T> {
  try {
    const response = await axiosApi({ url: endpoint, ...options });

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
      await apiRequest<ProjectApiResponse[]>("/projects/");

    // Ensure we have a valid response structure
    if (!apiResponse || !Array.isArray(apiResponse)) {
      throw new Error("Invalid response structure from API");
    }

    // Map to STI format
    return apiResponse.map(mapApiResponseToProjectV2);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      // Check if it's an authentication error
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        throw new Error("Authentication required. Please log in again.");
      }
      // Check if it's a network error
      if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
        throw new Error("Network error. Please check your connection and try again.");
      }
      // Check if it's a server error
      if (error.message.includes("500") || error.message.includes("Server Error")) {
        throw new Error("Server error. Please try again later.");
      }
      // Use the original error message if it's informative
      if (error.message && error.message !== "Failed to load projects") {
        throw new Error(error.message);
      }
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
      await apiRequest<ProjectApiResponse>("/projects/", {
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
      await apiRequest<ProjectApiResponse>(`/projects/${projectId}/`, {
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
    await apiRequest(`/projects/${projectId}/`, {
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
      await apiRequest<ProjectApiResponse>(`/projects/${projectId}/`);

    return mapApiResponseToProjectV2(apiResponse);
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw error;
  }
}
