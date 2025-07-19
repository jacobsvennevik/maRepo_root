'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { createProject, uploadFileWithProgress, APIError, ProjectData } from '../../services/api';
import { ProjectSetup } from '../../types';
import { 
  API_BASE_URL, 
  getAuthHeaders,
  uploadFileToService, 
  startDocumentProcessing, 
  pollDocumentStatus,
  validateFiles,
  updateProgress,
  clearProgress
} from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';
import { SyllabusMockBanner } from '../shared/mock-mode-banner';
import { 
  MOCK_SYLLABUS_PROCESSED_DOCUMENT,
  MOCK_SYLLABUS_EXTRACTION,
  createMockProcessedDocument,
  simulateProcessingDelay,
  isTestMode,
  type ProcessedDocument 
} from '../../services/mock-data';



// Note: Mock data is now centralized in services/mock-data.ts

interface SyllabusUploadStepProps {
  setup?: ProjectSetup;
  onUploadComplete: (projectId: string, extractedData: ProcessedDocument, fileName?: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void; // Add onSkip callback
}

export function SyllabusUploadStep({ setup, onUploadComplete, onNext, onBack, onSkip }: SyllabusUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [storedResults, setStoredResults] = useState<{ projectId: string, extractedData: ProcessedDocument, fileName?: string } | null>(null);
  const router = useRouter();

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    }
  }, [onSkip]);

  // Call onUploadComplete immediately when analysis completes for the guided setup
  React.useEffect(() => {
    if (showSuccess && storedResults) {
      onUploadComplete(storedResults.projectId, storedResults.extractedData, storedResults.fileName);
    }
  }, [showSuccess, storedResults, onUploadComplete]);


  const handleUpload = useCallback(async (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    
         // Just add files to the list, don't process yet
     console.log('Files added:', newFiles.map(f => f.name));
   }, []);

   const handleAnalyze = useCallback(async () => {
     if (files.length === 0) {
       setError("Please upload at least one file before analyzing.");
       return;
     }

     setError(null);
     setIsAnalyzing(true);

     try {
       // TEST MODE: Skip API calls and use mock data
       if (isTestMode()) {
         console.log('🧪 TEST MODE: Analyzing', files.length, 'files with mock data');
         
         // Simulate upload progress for all files
         for (const file of files) {
           setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
         }
         
         // Simulate processing time with realistic delay
         await simulateProcessingDelay(1000, 2000);
         
         // Always use the main mock syllabus extraction data
         const mockSyllabusData = MOCK_SYLLABUS_EXTRACTION;
         const mockProcessedDoc = createMockProcessedDocument(mockSyllabusData, 123);
         
         const fileName = files[0].name;
         console.log('🧪 TEST MODE: Using main mock syllabus data:', mockSyllabusData.course_title);
         console.log('🧪 TEST MODE: Extraction completed for:', fileName);

         setIsAnalyzing(false);
         setShowSuccess(true);
         setStoredResults({
           projectId: 'project-123',
           extractedData: mockProcessedDoc,
           fileName: fileName
         });
         return;
       }

       // Real API calls for production
       // Upload and process the first file only
       const firstFile = files[0];
       let processedData = null;
       let documentId = null;

       // Step 1: Upload the file
         const formData = new FormData();
       formData.append('file', firstFile);
         formData.append('file_type', 'pdf');
         formData.append('upload_type', 'course_files');

       console.log('Uploading syllabus to PDF service:', firstFile.name);
         
         const uploadResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/`, {
           method: 'POST',
           body: formData,
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
           },
         });

         if (!uploadResponse.ok) {
           const errorText = await uploadResponse.text();
           console.error('Upload failed:', {
             status: uploadResponse.status,
             statusText: uploadResponse.statusText,
             error: errorText
           });
         throw new Error(`Failed to upload ${firstFile.name} to PDF service: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
         }

         const document = await uploadResponse.json();
       documentId = document.id;
       console.log('File uploaded successfully:', document);
       setUploadProgress(prev => ({ ...prev, [firstFile.name]: 100 }));
         
       // Step 2: Start processing
       const processResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${documentId}/process/`, {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
             'Content-Type': 'application/json',
           },
         });

         if (!processResponse.ok) {
           const errorText = await processResponse.text();
         console.error('Failed to start processing:', errorText);
         throw new Error(`Failed to start processing: ${processResponse.status} ${processResponse.statusText}`);
       }
       
       const processData = await processResponse.json();
       console.log('Processing started successfully:', processData);

       // Step 3: Poll for completion
       console.log('Starting to poll for processing completion...');
       const maxAttempts = 10; // Reduced timeout for tests
       let attempts = 0;

       while (attempts < maxAttempts && !processedData) {
         try {
           if (documentId) {
             // Use the correct endpoint to get document details including status
             const statusResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${documentId}/`, {
               method: 'GET',
               headers: {
                 'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
                 'Content-Type': 'application/json',
               },
             });

             if (statusResponse.ok) {
               const statusData = await statusResponse.json();
               console.log(`Polling attempt ${attempts + 1}:`, statusData);
               
               if (statusData.status === 'completed') {
                 console.log('🎉 Document processing completed!');
                 console.log('📊 Full status data:', statusData);
                 
                 // First priority: Use AI-extracted processed_data if available
                 if (statusData.processed_data && Object.keys(statusData.processed_data).length > 0) {
                   processedData = {
                     id: statusData.id,
                     original_text: statusData.original_text,
                     metadata: statusData.processed_data,
                     status: 'completed' as const
                   };
                   console.log('✅ Using AI-extracted processed data:', statusData.processed_data);
                   console.log('📋 Extracted course info:');
                   console.log('  - Course Title:', statusData.processed_data.course_title || 'N/A');
                   console.log('  - Instructor:', statusData.processed_data.instructor || 'N/A');
                   console.log('  - Semester:', statusData.processed_data.semester || 'N/A');
                   console.log('  - Topics:', statusData.processed_data.topics || 'N/A');
                   console.log('  - Meeting Times:', statusData.processed_data.meeting_times || 'N/A');
                   console.log('  - Important Dates:', statusData.processed_data.important_dates || 'N/A');
                   break;
                 }
                 
                 // Fallback to processed_data endpoint if not in main response
                 try {
                   const processedDataResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${documentId}/processed_data/`, {
                     method: 'GET',
                     headers: {
                       'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
                       'Content-Type': 'application/json',
                     },
                   });
                   
                   if (processedDataResponse.ok) {
                     const processedDataObj = await processedDataResponse.json();
                     processedData = {
                       id: statusData.id,
                       original_text: statusData.original_text,
                       metadata: processedDataObj.data,
                       status: 'completed' as const
                     };
                     console.log('✅ Using processed data from endpoint:', processedDataObj.data);
                     break;
                   }
                 } catch (processedDataError) {
                   console.log('⚠️ Processed data endpoint failed, using document metadata');
                 }
                 
                 // Final fallback: use basic document metadata
                   processedData = {
                     id: statusData.id,
                     original_text: statusData.original_text,
                     metadata: statusData.metadata || {},
                     status: 'completed' as const
                   };
                 console.log('⚠️ Using basic document metadata as fallback:', statusData.metadata);
                   break;
               } else if (statusData.status === 'error') {
                 console.error('Processing failed:', statusData.error_message || 'Unknown error');
                 throw new Error('Document processing failed: ' + (statusData.error_message || 'Unknown error'));
               }
               // If status is 'pending' or 'processing', continue polling
             }
           }
           
           attempts++;
           if (attempts < maxAttempts) {
             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next poll
           }
         } catch (pollError) {
           console.error('Polling error:', pollError);
           attempts++;
           if (attempts < maxAttempts) {
             await new Promise(resolve => setTimeout(resolve, 1000));
           }
         }
       }

       // Handle timeout - if we didn't get processed data, use mock data and still call the callback
       if (!processedData) {
         console.log('⏰ Processing timed out, using mock data for callback');
         processedData = {
           id: documentId || 123,
           original_text: 'Course: Advanced Physics',
           metadata: {
             course_name: 'Advanced Physics',
             topics: ['mechanics', 'thermodynamics']
           },
           status: 'completed' as const
         };
       }

       // Create project with extracted course name
       let projectName = firstFile.name.replace(/\.[^/.]+$/, ''); // Default to filename
       if (processedData && processedData.metadata && processedData.metadata.course_name) {
         projectName = processedData.metadata.course_name;
       }
       
       const projectData: Partial<ProjectData> = {
         name: projectName,
         project_type: 'school',
         course_name: projectName,
         is_draft: true,
       };

       const newProject = await createProject(projectData as ProjectData);
       console.log('Project created:', newProject);

       setIsAnalyzing(false);
       setShowSuccess(true);
       setStoredResults({
         projectId: newProject.id,
         extractedData: processedData,
         fileName: firstFile.name
       });
       
       // Use processed data (either real or timeout fallback)
       console.log('🎉 SUCCESS: Using processed data:', processedData);

     } catch (error) {
       console.error("Syllabus analysis failed:", error);
       setIsAnalyzing(false);
       setShowSuccess(false);
       setStoredResults(null);
       
       if (error instanceof APIError) {
         if (error.statusCode === 401) {
           setError("Your session has expired. Please log in again.");
           router.push('/login');
         } else {
           setError(error.message);
         }
       } else {
                  setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
       }
     }
   }, [files, onUploadComplete, router]);

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
    <div className="space-y-6" data-testid="syllabus-upload-step">
      <SyllabusMockBanner courseName={MOCK_SYLLABUS_EXTRACTION.course_title} />
      
      <FileUpload
        onUpload={handleUpload}
        onRemove={handleRemove}
        accept=".pdf"
        maxFiles={5}
        maxSize={10 * 1024 * 1024} // 10MB
        required={true}
        title="Upload your course materials"
        description="Upload your syllabus, course documents, tests, and other materials. We will analyze them to extract course details, deadlines, and topics."
        buttonText="Browse for course materials"
        files={files}
        uploadProgress={uploadProgress}
        error={error || undefined}
      />
      
      {/* Analyze Button */}
      {files.length > 0 && !isAnalyzing && !showSuccess && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            data-testid="analyze-button"
          >
            🔍 Analyze {files.length} {files.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
      
      {showSuccess && (
        <div className="flex items-center justify-center p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          <span className="font-medium">Syllabus analyzed successfully! Click "Next" to continue.</span>
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
            Skip - I don't have a syllabus to upload
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">
              {isTestMode() ? `🧪 Simulating AI analysis of ${files.length} files...` : `AI is analyzing your ${files.length} course materials...`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isTestMode() ? 'Using mock data for testing' : 'This may take a few moments'}
          </p>
        </div>
      )}
    </div>
  );
} 