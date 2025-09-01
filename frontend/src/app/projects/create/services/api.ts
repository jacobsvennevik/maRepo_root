import axios from "axios";
import axiosInstance from "@/lib/axios";
import { ProjectSetup } from "../types";

export interface ProjectData {
  name: string;
  project_type: "school" | "self_study";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Test mode - set to true to bypass API calls and use mock data
const TEST_MODE =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_TEST_MODE !== "false";

export const createProject = async (projectData: ProjectData) => {
  try {
    const response = await axiosInstance.post("/api/projects/", projectData, {
      headers: {
        "Idempotency-Key": crypto.randomUUID()
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Project creation error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to create project",
      );
    }
    throw new Error("Failed to create project");
  }
};

export const uploadFileWithProgress = async (
  projectId: string,
  file: File,
  onProgress: (progress: number) => void,
) => {

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);

    const response = await axiosInstance.post(
      `/api/projects/${projectId}/upload_file/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("File upload error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to upload file",
      );
    }
    throw new Error("Failed to upload file");
  }
};

export async function uploadSyllabus(
  projectId: string,
  file: File,
): Promise<any> {

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post(
      `/api/projects/${projectId}/upload_file/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Syllabus upload error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to upload syllabus",
      );
    }
    throw new Error("Failed to upload syllabus");
  }
}

export async function uploadFile(file: File, uploadType: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  // Map frontend upload types to backend endpoints
  const uploadTypeMap: Record<string, string> = {
    'course-files': 'course-files',
    'test-files': 'test-files', 
    'learning-materials': 'learning-materials',
    'syllabus': 'course-files', // Map syllabus to course-files
    'tests': 'test-files',      // Map tests to test-files
    'content': 'learning-materials' // Map content to learning-materials
  };

  const backendUploadType = uploadTypeMap[uploadType] || uploadType;

  try {
    const response = await axiosInstance.post(
      `/api/upload/${backendUploadType}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("File upload error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to upload file",
      );
    }
    throw new Error("Failed to upload file");
  }
}

export const getProjects = async () => {
  try {
    const response = await axiosInstance.get("/api/projects/");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to fetch projects",
      );
    }
    throw new Error("Failed to fetch projects");
  }
};

export const finalizeProject = async (projectId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/projects/${projectId}/`, {
      is_draft: false,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.detail ||
          error.response.data.message ||
          "Failed to finalize project",
      );
    }
    throw new Error("Failed to finalize project");
  }
};

export const cleanupAbandonedDrafts = async (hours: number = 24) => {
  try {
    const response = await axiosInstance.post("/api/projects/cleanup_drafts/", {
      hours,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(
        error.response.status,
        error.response.data.error ||
          error.response.data.message ||
          "Failed to cleanup abandoned drafts",
      );
    }
    throw new Error("Failed to cleanup abandoned drafts");
  }
};

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}
