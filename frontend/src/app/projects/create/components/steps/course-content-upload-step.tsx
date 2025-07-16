import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { API_BASE_URL, isTestMode, validateFiles } from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/cards/base-card';
import { FileUploader } from '@/components/ui/common/file-uploader';
import { APIError, handleAPIError } from '@/lib/errors';
import axiosInstance from '@/lib/axios';

// Utility type for processed document returned by backend
interface ProcessedDocument {
  id: number;
  original_text: string;
  metadata: {
    topics?: string[];
    extracted_text?: string;
    source_file?: string;
    page_count?: number;
    confidence_score?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface CourseContentUploadStepProps {
  onUploadComplete: (backendData: ProcessedDocument[], fileNames: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MOCK_PROCESSED_DOCUMENT: ProcessedDocument = {
  id: 456,
  original_text: "Sample course content about machine learning algorithms and neural networks...",
  metadata: {
    topics: [
      "Machine Learning Basics",
      "Neural Networks",
      "Deep Learning",
      "Model Evaluation"
    ],
    extracted_text: "This content covers fundamental machine learning concepts...",
    source_file: "machine_learning_slides.pdf",
    page_count: 45,
    confidence_score: 0.92
  },
  status: 'completed'
};

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

export function CourseContentUploadStep({ onUploadComplete, onNext, onBack }: CourseContentUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

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
    let documentId: number | null = null;

    try {
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
      onUploadComplete([processedData], [firstFile.name]);

    } catch (error) {
      console.error("Content analysis failed:", error);
      setIsAnalyzing(false);
      setUploadProgress({});
      
      const errorMessage = getReadableErrorMessage(error);
      
      if (error instanceof APIError && error.statusCode === 401) {
        setError("Your session has expired. Please log in again.");
        router.push('/login');
      } else {
        setError(errorMessage);
      }
    }
  }, [files, onUploadComplete, router]);

  return (
    <div className="space-y-6" data-testid="course-content-upload-step">
      {isTestMode() && <TestModeBanner />}
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
      </div>
      {files.length > 0 && (
        <div className="flex justify-center">
          <AnalyzeButton
            onClick={handleAnalyze}
            isAnalyzing={isAnalyzing}
            disabled={isAnalyzing}
            filesCount={files.length}
          />
        </div>
      )}
    </div>
  );
} 