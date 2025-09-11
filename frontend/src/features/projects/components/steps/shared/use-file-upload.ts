'use client';

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { APIError } from "../../../services/api";
import { isTestMode } from "../../../services/mock-data";

export interface UploadProgress {
  [fileName: string]: number;
}

export interface FileUploadState {
  files: File[];
  uploadProgress: UploadProgress;
  error: string | null;
  isAnalyzing: boolean;
  showSuccess: boolean;
}

export interface FileUploadActions {
  handleUpload: (newFiles: File[]) => void;
  handleRemove: (index: number) => void;
  setError: (error: string | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setShowSuccess: (showSuccess: boolean) => void;
  clearProgress: () => void;
}

export function useFileUpload(): [FileUploadState, FileUploadActions] {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleUpload = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const handleRemove = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setError(null);

      // Clear progress for the removed file
      const removedFile = files[index];
      if (removedFile) {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[removedFile.name];
          return newProgress;
        });
      }
    },
    [files],
  );

  const clearProgress = useCallback(() => {
    setUploadProgress({});
  }, []);

  const state: FileUploadState = {
    files,
    uploadProgress,
    error,
    isAnalyzing,
    showSuccess,
  };

  const actions: FileUploadActions = {
    handleUpload,
    handleRemove,
    setError,
    setIsAnalyzing,
    setShowSuccess,
    clearProgress,
  };

  return [state, actions];
}

// Helper function to handle API errors consistently
export function handleUploadError(error: unknown, router: any): string {
  if (error instanceof APIError) {
    if (error.statusCode === 401) {
      router.push("/login");
      return "Your session has expired. Please log in again.";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// Helper function to validate files
export function validateFiles(
  files: File[],
  validTypes: string[],
  maxSizeMB: number,
): { validFiles: File[]; invalidFiles: File[]; oversizedFiles: File[] } {
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];
  const oversizedFiles: File[] = [];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  files.forEach((file) => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = validTypes.some((type) =>
      type.startsWith(".") ? fileExtension === type : file.type.includes(type),
    );

    if (!isValidType) {
      invalidFiles.push(file);
    } else if (file.size > maxSizeBytes) {
      oversizedFiles.push(file);
    } else {
      validFiles.push(file);
    }
  });

  return { validFiles, invalidFiles, oversizedFiles };
}
