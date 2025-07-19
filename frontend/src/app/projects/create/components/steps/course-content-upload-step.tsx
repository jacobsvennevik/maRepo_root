import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { API_BASE_URL, validateFiles } from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';
import { CourseContentMockBanner } from '../shared/mock-mode-banner';
import { 
  MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT,
  simulateProcessingDelay,
  isTestMode,
  type ProcessedDocument 
} from '../../services/mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/cards/base-card';
import { FileUploader } from '@/components/ui/common/file-uploader';
import { APIError, handleAPIError } from '@/lib/errors';
import axiosInstance from '@/lib/axios';

// Note: ProcessedDocument type is now imported from services/mock-data.ts

interface CourseContentUploadStepProps {
  onUploadComplete: (backendData: ProcessedDocument[], fileNames: string[]) => void;
  onAnalysisComplete: () => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void; // Add onSkip callback
}

// Note: Mock data is now centralized in services/mock-data.ts

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    // If the error is already an APIError, use its message
    return error.message;
  }
  
  if (error instanceof Error) {
    // For other Error types, check if it's an axios error with response data
    const anyError = error as any;
    if (anyError.response?.data) {
      if (typeof anyError.response.data === 'string') {
        return anyError.response.data;
      }
      if (anyError.response.data.detail) {
        return anyError.response.data.detail;
      }
      if (anyError.response.data.message) {
        return anyError.response.data.message;
      }
      if (anyError.response.data.error) {
        return anyError.response.data.error;
      }
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

export function CourseContentUploadStep({ onUploadComplete, onAnalysisComplete, onNext, onBack, onSkip }: CourseContentUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [storedResults, setStoredResults] = useState<{ data: ProcessedDocument[], fileNames: string[] } | null>(null);
  const router = useRouter();

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    }
  }, [onSkip]);

  // Call onUploadComplete immediately when analysis completes for the guided setup
  React.useEffect(() => {
    if (showSuccess && storedResults) {
      onUploadComplete(storedResults.data, storedResults.fileNames);
    }
  }, [showSuccess, storedResults, onUploadComplete]);

  const handleUpload = useCallback((newFiles: File[]) => {
    // Validate file types and sizes
    const validTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const validation = validateFiles(newFiles, validTypes, 25);

    if (validation.invalidFiles.length > 0) {
      setError(`${validation.invalidFiles[0]} is not a supported file type`);
      return;
    }

    if (validation.oversizedFiles.length > 0) {
      setError('File is too large. Maximum size is 25MB per file.');
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!files.length) {
      setError('Please select a file to analyze');
      return;
    }

    const firstFile = files[0];
    setIsAnalyzing(true);
    setError(null);
    setShowSuccess(false);
    setStoredResults(null);
    let documentId: number | null = null;

    try {
      // TEST MODE: Skip API calls and use mock data
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Analyzing', files.length, 'course content files with mock data');
        
        // Simulate upload progress for all files
        for (const file of files) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        
        // Simulate processing time with realistic delay
        await simulateProcessingDelay(1500, 3000);
        
        const fileName = firstFile.name;
        console.log('🧪 TEST MODE: Course content extraction completed for:', fileName);
        console.log('🧪 TEST MODE: Using mock course content data');

        setIsAnalyzing(false);
        setShowSuccess(true);
        setStoredResults({
          data: [MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT],
          fileNames: [fileName]
        });
        onAnalysisComplete();
        return;
      }

      // Validate file size
      const maxSize = 25 * 1024 * 1024; // 25MB to match UI limit
      if (firstFile.size > maxSize) {
        throw new APIError(413, 'File size exceeds 25MB limit');
      }

      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', firstFile);
      formData.append('file_type', firstFile.type.toLowerCase().includes('pdf') ? 'pdf' : 'ppt');
      formData.append('upload_type', 'learning_materials');

      console.log('Uploading file:', {
        name: firstFile.name,
        size: firstFile.size,
        type: firstFile.type,
        file_type: firstFile.type.toLowerCase().includes('pdf') ? 'pdf' : 'ppt'
      });

      const uploadResponse = await axiosInstance.post('/api/pdf_service/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [firstFile.name]: progress }));
          }
        },
      });

      documentId = uploadResponse.data.id;
      console.log('File uploaded successfully:', uploadResponse.data);
      setUploadProgress(prev => ({ ...prev, [firstFile.name]: 100 }));

      // Step 2: Start processing
      const processResponse = await axiosInstance.post(`/api/pdf_service/documents/${documentId}/process/`);
      console.log('Processing started successfully:', processResponse.data);

      // Step 3: Poll for completion
      const maxAttempts = 60; // Increased from 30 to 60 attempts
      const pollInterval = 5000; // Increased from 3000 to 5000ms (5 seconds)
      let attempts = 0;
      let processedData = null;

      while (attempts < maxAttempts && !processedData) {
        try {
          const statusResponse = await axiosInstance.get(`/api/pdf_service/documents/${documentId}/`);
          const statusData = statusResponse.data;
          console.log(`Polling attempt ${attempts + 1}:`, statusData);

          if (statusData.status === 'error') {
            throw new APIError(500, statusData.error_message || 'Processing failed');
          }

          if (statusData.status === 'completed') {
            if (statusData.processed_data) {
              processedData = {
                id: statusData.id,
                original_text: statusData.original_text,
                metadata: statusData.processed_data,
                status: 'completed' as const
              };
              break;
            }

            // Try the processed_data endpoint as fallback
            try {
              const processedDataResponse = await axiosInstance.get(`/api/pdf_service/documents/${documentId}/processed_data/`);
              if (processedDataResponse.data) {
                processedData = {
                  id: statusData.id,
                  original_text: statusData.original_text,
                  metadata: processedDataResponse.data,
                  status: 'completed' as const
                };
                break;
              }
            } catch (processedDataError) {
              console.log('Processed data endpoint failed, continuing polling');
            }
          }

          await new Promise(resolve => setTimeout(resolve, pollInterval));
          attempts++;
        } catch (pollError) {
          console.error('Polling error:', pollError);
          throw new APIError(500, getReadableErrorMessage(pollError));
        }
      }

      if (!processedData) {
        throw new APIError(408, `Processing timed out for ${firstFile.name}. The file might be too large or complex to process.`);
      }

      console.log('SUCCESS: Using processed data:', processedData);
      setShowSuccess(true);
      setStoredResults({
        data: [processedData],
        fileNames: [firstFile.name]
      });
      onAnalysisComplete();

    } catch (error) {
      console.error("Content analysis failed:", error);
      setIsAnalyzing(false);
      setUploadProgress({});
      setShowSuccess(false);
      setStoredResults(null);
      
      const errorMessage = getReadableErrorMessage(error);
      
      if (error instanceof APIError && error.statusCode === 401) {
        setError("Your session has expired. Please log in again.");
        router.push('/login');
      } else {
        setError(errorMessage);
      }
    }
  }, [files, router, onAnalysisComplete]);

  return (
    <div className="space-y-6" data-testid="course-content-upload-step">
      <CourseContentMockBanner />
      <div className="space-y-4">
        <FileUpload
          onUpload={handleUpload}
          onRemove={handleRemove}
          accept=".pdf,.ppt,.pptx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          maxFiles={10}
          maxSize={25 * 1024 * 1024}
          title="Upload your course materials"
          description="Upload slides, handouts, or excerpts (max ~100 pages). Full textbooks are not allowed."
          files={files}
          uploadProgress={uploadProgress}
          error={error}
        />
        {error && <ErrorMessage message={error} />}
      </div>
      {files.length > 0 && !showSuccess && (
        <div className="flex justify-center">
          <AnalyzeButton
            onClick={handleAnalyze}
            isAnalyzing={isAnalyzing}
            disabled={isAnalyzing}
            filesCount={files.length}
          />
        </div>
      )}
      
      {/* Skip Button */}
      {onSkip && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSkip}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors duration-200"
            data-testid="skip-button"
          >
            Skip - I don't have course materials to upload
          </button>
        </div>
      )}
      {showSuccess && (
        <div className="flex items-center justify-center p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          <span className="font-medium">Course content analyzed successfully! Click "Next" to continue.</span>
        </div>
      )}
    </div>
  );
} 