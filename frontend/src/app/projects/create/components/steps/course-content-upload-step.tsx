import React, { useState, useCallback } from 'react';
import getConfig from 'next/config';
import { FileUpload } from '@/components/ui/file-upload';
import { uploadFileWithProgress, APIError } from '../../services/api';
import { createFileRemover, handleUploadError } from '../../utils/file-helpers';
import { 
  isTestMode, 
  validateFiles,
  clearProgress
} from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';

// Utility type for processed document returned by backend
interface ProcessedDocument {
  id: number;
  original_text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface CourseContentUploadStepProps {
  onUploadComplete: (backendData: ProcessedDocument[], fileNames: string[]) => void;
}



/*
 * CourseContentUploadStep
 * -----------------------
 * Allows the student to upload additional course materials (slides, hand-outs, PDF excerpts).
 * After the files are uploaded this component triggers backend processing
 * and notifies the parent with the extracted data so that the next step (CourseContentReviewStep)
 * can display a preview for confirmation.
 */
export function CourseContentUploadStep({ onUploadComplete }: CourseContentUploadStepProps) {
  const { publicRuntimeConfig } = getConfig() || {};
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Shared remove handler
  const handleRemove = useCallback((fileToRemove: File) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter(file => file.name !== fileToRemove.name);
      
      // Clear error if no files remain or if only valid files remain
      if (newFiles.length === 0) {
        setError(null);
      } else {
        // Check if remaining files are valid using shared utility
        const validTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
        const validation = validateFiles(newFiles, validTypes, 25);
        
        if (validation.valid) {
          setError(null);
        }
      }
      
      return newFiles;
    });
    
    // Clear progress for the removed file using shared utility
    clearProgress(setUploadProgress, fileToRemove.name);
  }, []);

  // ----------------- UPLOAD HANDLER -----------------
  const handleUpload = useCallback((newFiles: File[]) => {
    // Add all files to the files array first
    setFiles(newFiles);
    
    // Validate file types and sizes using shared utility
    const validTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const validation = validateFiles(newFiles, validTypes, 25);

    if (validation.invalidFiles.length > 0) {
      setError('File type not supported. Please upload PDF, PPT, or DOC files only.');
      return;
    }

    if (validation.oversizedFiles.length > 0) {
      setError('File is too large. Maximum size is 25MB per file.');
      return;
    }

    // Clear error if all files are valid
    setError(null);
  }, []);

  // ----------------- ANALYZE HANDLER ----------------
  const handleAnalyze = useCallback(async () => {
    if (!files.length) return;

    // Filter out invalid files before processing using shared utility
    const validTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const validation = validateFiles(files, validTypes, 25);
    
    const validFiles = files.filter(file => 
      validation.invalidFiles.includes(file) === false && 
      validation.oversizedFiles.includes(file) === false
    );

    if (validFiles.length === 0) {
      setError('No valid files to analyze. Please upload PDF, PPT, or DOC files under 25MB.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const results = await Promise.all(
        validFiles.map(async (file, index) => {
          if (isTestMode()) {
            // Use mock data in test mode
            return {
              id: index + 1,
              original_text: `Mock excerpt from ${file.name}: Lorem ipsum dolor sit amet, consectetur adipiscing elit…`,
              metadata: {
                source_file: file.name,
                page_count: 10,
                snippet: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...'
              },
              status: 'completed'
            };
          }

          return await uploadFileWithProgress(file, (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          });
        })
      );

      onUploadComplete(results, validFiles.map(f => f.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [files, onUploadComplete]);

  return (
    <div className="space-y-6" data-testid="course-content-upload-step">
      {isTestMode() && <TestModeBanner />}
      {error && <ErrorMessage message={error} />}
      <FileUpload
        title="Upload your course materials"
        description="Upload slides, handouts, or excerpts (max ~100 pages). Full textbooks are not allowed."
        onUpload={handleUpload}
        onRemove={handleRemove}
        files={files}
        error={error}
        uploadProgress={uploadProgress}
      />
      {files.length > 0 && (
        <AnalyzeButton
          onClick={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={false}
          filesCount={files.length}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          🔍 Analyze {files.length} {files.length === 1 ? 'File' : 'Files'}
        </AnalyzeButton>
      )}
    </div>
  );
} 