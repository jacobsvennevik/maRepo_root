'use client';

import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadFileWithProgress, APIError } from '../../services/api';

interface TestUploadStepProps {
  projectId: string;
  onUploadComplete: (uploadedFiles: File[]) => void;
  onSkip?: () => void;
}

export function TestUploadStep({ projectId, onUploadComplete, onSkip }: TestUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
    setIsUploading(true);

    if (newFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      // Upload each file with progress tracking
      for (const file of newFiles) {
        try {
          console.log('Uploading test file:', file.name);
          await uploadFileWithProgress(
            projectId,
            file, 
            (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          );
          console.log('Test file upload complete:', file.name);
        } catch (error) {
          console.error('Test file upload error:', error);
          if (error instanceof APIError) {
            setError(`Upload failed: ${error.message}`);
          } else {
            setError(`Failed to upload ${file.name}. Please try again.`);
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: -1
          }));
          setIsUploading(false);
          return;
        }
      }

      // Notify parent component that the upload is done
      onUploadComplete(newFiles);
      setIsUploading(false);

    } catch (error) {
      console.error("Test upload failed:", error);
      
      if (error instanceof APIError) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsUploading(false);
    }
  }, [projectId, onUploadComplete]);

  const handleRemove = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
    
    // Clear progress for the removed file
    const removedFile = files[index];
    if (removedFile) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[removedFile.name];
        return newProgress;
      });
    }
  }, [files]);

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onUpload={handleUpload}
        onRemove={handleRemove}
        accept=".pdf,.doc,.docx,.txt"
        maxFiles={5}
        maxSize={10 * 1024 * 1024} // 10MB per file
        required={false}
        title="Upload your test materials"
        description="Upload past exams, practice tests, or study guides. This helps us understand what types of questions to expect."
        buttonText="Browse for test files"
        files={files}
        uploadProgress={uploadProgress}
        error={error || undefined}
        disabled={isUploading}
      />
      
      {onSkip && (
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            disabled={isUploading}
          >
            Skip this step
          </button>
        </div>
      )}
    </div>
  );
} 