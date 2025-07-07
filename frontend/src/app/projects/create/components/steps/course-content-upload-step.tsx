import React, { useState, useCallback } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { API_BASE_URL, isTestMode, validateFiles } from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';

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

export function CourseContentUploadStep({ onUploadComplete }: CourseContentUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    if (files.length === 0) {
      setError("Please upload at least one file before analyzing.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // TEST MODE: Use mock data
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Analyzing', files.length, 'files with mock data');
        
        // Simulate upload progress
        files.forEach(file => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        });
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock data for each file
        const mockResults = files.map((file, index) => ({
          ...MOCK_PROCESSED_DOCUMENT,
          id: index + 1,
          metadata: {
            ...MOCK_PROCESSED_DOCUMENT.metadata,
            source_file: file.name
          }
        }));
        
        onUploadComplete(mockResults, files.map(f => f.name));
        setIsAnalyzing(false);
        return;
      }

      // Process each file in parallel
      const results = await Promise.all(
        files.map(async (file) => {
          // Step 1: Upload file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('file_type', 'pdf');
          formData.append('upload_type', 'course_files');

          const uploadResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${file.name}: ${uploadResponse.statusText}`);
          }

          const document = await uploadResponse.json();
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

          // Step 2: Start processing
          const processResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${document.id}/process/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          });

          if (!processResponse.ok) {
            throw new Error(`Failed to process ${file.name}: ${processResponse.statusText}`);
          }

          // Step 3: Poll for completion
          const maxAttempts = 10;
          let attempts = 0;
          let processedData = null;

          while (attempts < maxAttempts && !processedData) {
            const statusResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${document.id}/`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
            });

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              
              if (statusData.status === 'completed') {
                processedData = {
                  id: statusData.id,
                  original_text: statusData.original_text,
                  metadata: {
                    topics: statusData.processed_data?.topics || [],
                    extracted_text: statusData.original_text,
                    source_file: file.name,
                    page_count: statusData.processed_data?.page_count,
                    confidence_score: statusData.processed_data?.confidence_score
                  },
                  status: 'completed' as const
                };
                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                break;
              } else if (statusData.status === 'error') {
                throw new Error(`Processing failed for ${file.name}: ${statusData.error_message || 'Unknown error'}`);
              }
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (!processedData) {
            throw new Error(`Processing timed out for ${file.name}`);
          }

          return processedData;
        })
      );

      onUploadComplete(results, files.map(f => f.name));
    } catch (err) {
      console.error("Course content analysis failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [files, onUploadComplete]);

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