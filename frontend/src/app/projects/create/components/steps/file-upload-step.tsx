'use client';

import { useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { createProject, uploadFileWithProgress, APIError, ProjectData } from '../../services/api';
import { isTestMode } from '../../services/mock-data';
import { useFileUpload, handleUploadError } from './shared';

interface SyllabusUploadStepProps {
  onUploadComplete: (projectId: string) => void;
}

export function SyllabusUploadStep({ onUploadComplete }: SyllabusUploadStepProps) {
  const [state, actions] = useFileUpload();

  /**
   * Enable a quick workflow while developing or running frontend tests.
   * When NEXT_PUBLIC_TEST_MODE="true" (and NODE_ENV is development) the step
   * automatically creates a mock project using the shared `createProject` helper
   * and immediately invokes `onUploadComplete` – no manual file-selection or
   * network requests required.
   */
  useEffect(() => {
    if (!isTestMode()) return;

    (async () => {
      try {
        const mockProjectData: Partial<ProjectData> = {
          name: 'Test Project',
          project_type: 'school',
          course_name: 'Test Course',
          is_draft: true,
        };

        console.log('🧪 TEST MODE: Creating mock project automatically');
        const newProject = await createProject(mockProjectData as ProjectData);
        console.log('🧪 TEST MODE: Mock project ready → skipping file upload');

        // Immediately signal completion so the wizard can advance
        onUploadComplete(newProject.id);
      } catch (err) {
        console.error('🧪 TEST MODE: Failed to bootstrap mock project', err);
      }
    })();
    // we only want to run this once on mount in test mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (newFiles: File[]) => {
    actions.handleUpload(newFiles);
    actions.setError(null);

    if (newFiles.length === 0) return;

    try {
      // 1. Create a draft project
      const fileName = newFiles[0].name;
      const projectName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
      
      const projectData: Partial<ProjectData> = {
        name: projectName,
        project_type: 'school',
        course_name: projectName, // Required for school projects
        is_draft: true,
      };

      console.log('Creating project with data:', projectData);
      const newProject = await createProject(projectData as ProjectData);
      console.log('Project created:', newProject);

      // 2. Upload each file with progress tracking
      for (const file of newFiles) {
        try {
          console.log('Uploading file:', file.name);
          await uploadFileWithProgress(
            newProject.id,
            file, 
            (progress) => {
              // Update progress through the hook
              const newProgress = { ...state.uploadProgress, [file.name]: progress };
              // Note: This would need to be handled differently in a real implementation
              // For now, we'll use the existing pattern
            }
          );
          console.log('File upload complete:', file.name);
        } catch (error) {
          console.error('File upload error:', error);
          const errorMessage = handleUploadError(error, null);
          actions.setError(errorMessage);
          return;
        }
      }

      // 3. Notify parent component that the upload is done
      onUploadComplete(newProject.id);

    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = handleUploadError(error, null);
      actions.setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onUpload={handleUpload}
        onRemove={actions.handleRemove}
        accept=".pdf"
        maxFiles={1}
        maxSize={10 * 1024 * 1024} // 10MB
        required={true}
        title="Upload your course syllabus"
        description="Upload your syllabus and we'll automatically extract course details, deadlines, and topics to set up your project."
        buttonText="Browse for syllabus"
        files={state.files}
        uploadProgress={state.uploadProgress}
        error={state.error || undefined}
      />
    </div>
  );
} 