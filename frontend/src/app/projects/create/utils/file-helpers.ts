import { useCallback } from 'react';
import { formatFileSize as sharedFormatFileSize } from "@/utils/fileHelpers";

export const formatFileSize = sharedFormatFileSize;

// Upload progress tracking utilities
export const updateProgress = (fileName: string, progress: number) => {
  return (prev: Record<string, number>) => ({
    ...prev,
    [fileName]: progress
  });
};

export const removeProgress = (fileName: string) => {
  return (prev: Record<string, number>) => {
    const newProgress = { ...prev };
    delete newProgress[fileName];
    return newProgress;
  };
};

// Drag and drop handlers factory
export const createDragHandlers = (
  onDrop: (files: File[]) => void,
  setIsDragOver: (isDragOver: boolean) => void
) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onDrop(droppedFiles);
  };

  return { handleDragOver, handleDragLeave, handleDrop };
};

// File removal handler hook
export const useFileRemover = <T extends { name?: string }>(
  files: T[],
  setFiles: (files: T[]) => void,
  setUploadProgress?: (updater: (prev: Record<string, number>) => Record<string, number>) => void
) => {
  return useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Clear progress for the removed file if progress tracking is enabled
    const removedFile = files[index];
    if (removedFile && removedFile.name && setUploadProgress) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[removedFile.name!];
        return newProgress;
      });
    }
  }, [files, setFiles, setUploadProgress]);
};

// Legacy factory for compatibility
export const createFileRemover = <T extends { name?: string }>(
  files: T[],
  setFiles: (files: T[]) => void,
  setUploadProgress?: (updater: (prev: Record<string, number>) => Record<string, number>) => void
) => {
  return (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Clear progress for the removed file if progress tracking is enabled
    const removedFile = files[index];
    if (removedFile && removedFile.name && setUploadProgress) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[removedFile.name!];
        return newProgress;
      });
    }
  };
};

// File selection handler hook
export const useFileSelector = <T>(
  existingFiles: T[],
  onFilesChange: (files: T[]) => void,
  fileTransformer?: (file: File) => T
) => {
  return useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const transformedFiles = fileTransformer 
      ? selectedFiles.map(fileTransformer)
      : selectedFiles as unknown as T[];
    onFilesChange([...existingFiles, ...transformedFiles]);
  }, [existingFiles, onFilesChange, fileTransformer]);
};

// Common file upload error handling
export const handleUploadError = (
  error: unknown,
  fileName: string,
  setError: (error: string | null) => void,
  setUploadProgress?: (updater: (prev: Record<string, number>) => Record<string, number>) => void
) => {
  console.error('File upload error:', error);
  
  let errorMessage: string;
  if (error instanceof Error) {
    if ('statusCode' in error && error.statusCode === 401) {
      errorMessage = "Your session has expired. Please log in again.";
    } else {
      errorMessage = error.message;
    }
  } else {
    errorMessage = `Failed to upload ${fileName}. Please try again.`;
  }
  
  setError(errorMessage);
  
  // Mark upload as failed in progress tracking
  if (setUploadProgress) {
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: -1
    }));
  }
}; 