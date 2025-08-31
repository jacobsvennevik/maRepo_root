import { registerUpload } from "./cleanup-utils";

// Shared upload utilities for project creation steps
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Test mode detection - check dynamically to respond to environment variable changes during tests
export const isTestMode = (): boolean => {
  // Check if running in test environment
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  // Check for explicit test mode flag in development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  // Check for localhost and test mode
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  return false;
};

// Shared authentication headers with fallback dev token
export const getAuthHeaders = (): HeadersInit => {
  const validDevToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14";
  const token = localStorage.getItem("authToken") || validDevToken;
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

// Shared file upload function
export const uploadFileToService = async (
  file: File,
  uploadType: "course_files" | "test_files" | "learning_materials",
  onProgress?: (progress: number) => void,
): Promise<{ id: number; filename: string; status: string }> => {
  const controller = new AbortController();

  // Register the upload for cleanup
  registerUpload(controller);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_type", uploadType);

    const response = await fetch(`${API_BASE_URL}/api/documents/upload/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return {
      id: result.id,
      filename: file.name,
      status: result.status,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Upload aborted:", file.name);
      throw new Error("Upload was cancelled");
    }
    throw error;
  }
};

// Shared document processing function
export const startDocumentProcessing = async (
  documentId: number,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  const controller = new AbortController();

  // Register the processing for cleanup
  registerUpload(controller);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${documentId}/process/`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Processing failed: ${response.status} ${response.statusText}`,
      );
    }

    if (onProgress) {
      onProgress(100);
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Document processing aborted:", documentId);
      throw new Error("Processing was cancelled");
    }
    throw error;
  }
};

// Shared polling function for document status
export const pollDocumentStatus = async (
  documentId: number,
  maxAttempts: number = 10,
  onProgress?: (progress: number) => void,
): Promise<any> => {
  let attempts = 0;
  let processedData = null;

  while (attempts < maxAttempts && !processedData) {
    try {
      const statusResponse = await fetch(
        `${API_BASE_URL}/api/pdf_service/documents/${documentId}/`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          processedData = statusData;
          if (onProgress) onProgress(100);
          break;
        } else if (statusData.status === "error") {
          throw new Error(
            "Document processing failed: " +
              (statusData.error_message || "Unknown error"),
          );
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (pollError) {
      // If this is a processing error, re-throw it
      if (
        pollError instanceof Error &&
        pollError.message.includes("Document processing failed")
      ) {
        throw pollError;
      }
      // Otherwise, continue polling
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return processedData;
};

// File validation utilities
export const validateFileType = (
  file: File,
  allowedTypes: string[],
): boolean => {
  return allowedTypes.some((type) => file.name.toLowerCase().endsWith(type));
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateFiles = (
  files: File[],
  allowedTypes: string[],
  maxSizeMB: number,
): { valid: boolean; invalidFiles: File[]; oversizedFiles: File[] } => {
  const invalidFiles = files.filter(
    (file) => !validateFileType(file, allowedTypes),
  );
  const oversizedFiles = files.filter(
    (file) => !validateFileSize(file, maxSizeMB),
  );

  return {
    valid: invalidFiles.length === 0 && oversizedFiles.length === 0,
    invalidFiles,
    oversizedFiles,
  };
};

// Progress tracking utilities
export const updateProgress = (
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >,
  fileName: string,
  progress: number,
) => {
  setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
};

export const clearProgress = (
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >,
  fileName: string,
) => {
  setUploadProgress((prev) => {
    const newProgress = { ...prev };
    delete newProgress[fileName];
    return newProgress;
  });
};
