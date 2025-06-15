'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { createProject, uploadFileWithProgress, APIError } from '../../services/api';

interface FileUploadStepProps {
  onExtractionComplete: (projectId: string) => void;
}

export function FileUploadStep({ onExtractionComplete }: FileUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);

    if (newFiles.length === 0) return;

    try {
      // 1. Create a draft project
      const fileName = newFiles[0].name;
      const projectName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
      
      const projectData = {
        name: projectName,
        project_type: 'school',
        course_name: projectName, // Required for school projects
        is_draft: true,
      };

      console.log('Creating project with data:', projectData);
      const newProject = await createProject(projectData);
      console.log('Project created:', newProject);

      // 2. Upload each file with progress tracking
      for (const file of newFiles) {
        try {
          console.log('Uploading file:', file.name);
          await uploadFileWithProgress(
            newProject.id,
            file, 
            (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          );
          console.log('File upload complete:', file.name);
        } catch (error) {
          console.error('File upload error:', error);
          if (error instanceof APIError) {
            setError(`Upload failed: ${error.message}`);
          } else {
            setError(`Failed to upload ${file.name}. Please try again.`);
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: -1
          }));
          return;
        }
      }

      // 3. Notify parent component
      onExtractionComplete(newProject.id);

    } catch (error) {
      console.error("Upload failed:", error);
      
      if (error instanceof APIError) {
        if (error.statusCode === 401) {
            setError("Your session has expired. Please log in again.");
          router.push('/login');
        } else {
            setError(error.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  }, [onExtractionComplete, router]);

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

  return (
    <div className="space-y-6">
      <FileUpload
        onUpload={handleUpload}
        onRemove={handleRemove}
        accept=".pdf"
        maxFiles={1}
        maxSize={10 * 1024 * 1024} // 10MB
        required={true}
        title="Upload your course syllabus"
        description="We'll automatically extract course details, deadlines, and topics to set up your project."
        buttonText="Browse for a file"
        files={files}
        uploadProgress={uploadProgress}
        error={error || undefined}
      />
    </div>
  );
} 