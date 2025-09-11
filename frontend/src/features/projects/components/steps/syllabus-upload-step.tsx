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
} from '../../services/upload-utils';
import { TestModeBanner, ErrorMessage } from '../shared/upload-ui';
import { SyllabusMockBanner } from '../shared/mock-mode-banner';
import { StepAnalyzeButton, SuccessMessage, LoadingSpinner, SkipButton } from './shared';
import { Button } from '@/components/ui/button';
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
  hasUploadCompleted?: boolean; // Add flag to check if upload is already completed
  onResetUploadState?: () => void; // Add callback to reset upload state
}

export function SyllabusUploadStep({ setup, onUploadComplete, onNext, onBack, onSkip, hasUploadCompleted = false, onResetUploadState }: SyllabusUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [storedResults, setStoredResults] = useState<{ projectId: string, extractedData: ProcessedDocument, fileName?: string } | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const router = useRouter();

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    }
  }, [onSkip]);



  // Reset success state when component mounts (when user goes back to this step)
  React.useEffect(() => {
    if (showSuccess) {
      console.log('🔄 Resetting success state on component mount');
      setShowSuccess(false);
      setStoredResults(null);
    }
  }, []); // Empty dependency array means this runs only on mount

  // Call onUploadComplete immediately when analysis completes for the guided setup
  React.useEffect(() => {
    if (showSuccess && storedResults && !hasNavigated) {
      // Only call onUploadComplete if we haven't already completed an upload in this session
      if (!hasUploadCompleted) {
        onUploadComplete(storedResults.projectId, storedResults.extractedData, storedResults.fileName);
      }
      
      // Automatically navigate to the next step after a short delay
      const timeoutId = setTimeout(() => {
        if (onNext && !hasNavigated) {
          setHasNavigated(true);
          onNext();
        }
      }, 1500); // 1.5 second delay to show success message
      
      // Cleanup timeout on unmount or dependency change
      return () => clearTimeout(timeoutId);
    }
  }, [showSuccess, storedResults, onUploadComplete, onNext, hasNavigated, hasUploadCompleted]);


  const handleUpload = useCallback(async (updatedFiles: File[]) => {
    setFiles(updatedFiles);
    setError(null);
    setHasNavigated(false); // Reset navigation flag when files change
    setShowSuccess(false); // Reset success state when new files are uploaded
  }, []);

   const handleAnalyze = useCallback(async () => {
     if (files.length === 0) {
       setError("Please upload at least one file before analyzing.");
       return;
     }

     // Check file size and warn about large files
     const firstFile = files[0];
     const fileSizeMB = firstFile.size / 1024 / 1024;
     if (fileSizeMB > 10) {
       console.warn(`⚠️ Large file detected: ${firstFile.name} (${fileSizeMB.toFixed(2)} MB)`);
       console.warn('   Large files may take longer to process or timeout');
     }

     setError(null);
     setIsAnalyzing(true);
     setHasNavigated(false); // Reset navigation flag when starting analysis
     
     // Reset upload completion state when starting new analysis
     if (onResetUploadState) {
       onResetUploadState();
     }

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
         
         // Auto-navigation will be handled by the useEffect hook
         return;
       }

       // Real API calls for production
       // Upload and process the first file only
       let processedData = null;
       let documentId = null;

       // Step 1: Upload the file
         const formData = new FormData();
       formData.append('file', firstFile);
         formData.append('file_type', 'pdf');
         formData.append('upload_type', 'course_files');
         formData.append('title', firstFile.name);

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
       console.log('🚀 Starting PDF processing...');
       const processResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${documentId}/process/`, {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
             'Content-Type': 'application/json',
           },
         });

         if (!processResponse.ok) {
           const errorText = await processResponse.text();
           console.error('❌ Failed to start processing:', {
             status: processResponse.status,
             statusText: processResponse.statusText,
             error: errorText
           });
           throw new Error(`Failed to start processing: ${processResponse.status} ${processResponse.statusText} - ${errorText}`);
         }
       
       const processData = await processResponse.json();
       console.log('✅ Processing started successfully:', processData);
       
       // Verify we got a task ID
       if (!processData.task_id) {
         console.error('❌ No task ID returned from processing request:', processData);
         throw new Error('Processing request did not return a task ID. Backend processing service may be unavailable.');
       }
       
       console.log('📋 Task details:', {
         taskId: processData.task_id,
         documentId: processData.document_id,
         status: processData.status
       });

       // Step 3: Poll for completion
       const maxAttempts = 180; // 3 minutes timeout for real processing
       console.log('Starting to poll for processing completion...');
       console.log(`📊 Polling configuration: ${maxAttempts} attempts, 1 second intervals (${maxAttempts/60} minutes total)`);
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
               console.log(`Polling attempt ${attempts + 1}:`, {
                 id: statusData.id,
                 status: statusData.status,
                 document_type: statusData.document_type,
                 has_processed_data: !!(statusData.processed_data && Object.keys(statusData.processed_data).length > 0)
               });
               
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
             // Log progress every 30 seconds
             if (attempts % 30 === 0) {
               console.log(`⏳ Still polling... (${attempts}/${maxAttempts} attempts, ${Math.round(attempts/maxAttempts*100)}% of timeout)`);
             }
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

       // Handle timeout - throw error instead of using fallback data
       if (!processedData) {
         console.error('⏰ Processing timed out after 3 minutes');
         console.error('📊 Processing details:');
         console.error(`   - Document ID: ${documentId}`);
         console.error(`   - File: ${firstFile.name} (${(firstFile.size / 1024 / 1024).toFixed(2)} MB)`);
         console.error(`   - Polling attempts: ${attempts}/${maxAttempts}`);
         console.error('🔍 Possible causes:');
         console.error('   - Large or complex PDF file (>10MB)');
         console.error('   - Backend processing queue is busy');
         console.error('   - Network connectivity issues');
         console.error('   - AI service temporarily unavailable');
         console.error('   - Celery worker not running');
         console.error('   - Redis connection issues');
         
         throw new Error(`PDF processing timed out after 3 minutes. The file "${firstFile.name}" may be too large or complex, or the backend processing service is busy. Please try again later or contact support if the issue persists.`);
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
       
       // Call onUploadComplete with the results
       onUploadComplete(newProject.id, processedData, firstFile.name);
       
       // Auto-navigation will be handled by the useEffect hook
       
       // Use processed data (either real or timeout fallback)
       console.log('🎉 SUCCESS: Using processed data:', processedData);

     } catch (error) {
       console.error("Syllabus analysis failed:", error);
       setIsAnalyzing(false);
       setShowSuccess(false);
       setStoredResults(null);
       
       // Enhanced error handling with specific messages
       if (error instanceof APIError) {
         if (error.statusCode === 401) {
           setError("Your session has expired. Please log in again.");
           router.push('/login');
         } else if (error.statusCode === 413) {
           setError("File too large. Please upload a smaller PDF file (max 10MB).");
         } else if (error.statusCode === 503) {
           setError("Processing service is temporarily unavailable. Please try again in a few minutes.");
         } else {
           setError(`Processing failed: ${error.message}`);
         }
       } else if (error instanceof Error) {
         const errorMessage = error.message;
         
         // Handle specific timeout errors
         if (errorMessage.includes('timed out')) {
           setError(`Processing timeout: ${errorMessage}. Please try again with a smaller file or contact support.`);
         } else if (errorMessage.includes('Failed to upload')) {
           setError(`Upload failed: ${errorMessage}. Please check your internet connection and try again.`);
         } else if (errorMessage.includes('Failed to start processing')) {
           setError(`Processing service error: ${errorMessage}. Please try again later.`);
         } else if (errorMessage.includes('Document processing failed')) {
           setError(`PDF processing failed: ${errorMessage}. The file may be corrupted or in an unsupported format.`);
         } else {
           setError(`Analysis failed: ${errorMessage}. Please try again or contact support.`);
         }
       } else {
         setError("An unexpected error occurred during analysis. Please try again.");
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
      

      
      {/* Analyze and Skip Buttons */}
      {files.length > 0 && !isAnalyzing && !showSuccess && (
        <div className="flex justify-center gap-4" data-testid="analyze-button-container">
          <StepAnalyzeButton
            onClick={handleAnalyze}
            isAnalyzing={isAnalyzing}
            disabled={isAnalyzing}
            filesCount={files.length}
          />
        </div>
      )}

      {showSuccess && (
        <div className="space-y-4">
          <SuccessMessage message="Syllabus analyzed successfully! Redirecting to review results..." />
          <div className="flex justify-center">
            <div className="text-sm text-gray-600">
              Please wait while we prepare your analysis results...
            </div>
          </div>
        </div>
      )}
      {isAnalyzing && (
        <LoadingSpinner
          message={isTestMode() ? `🧪 Simulating AI analysis of ${files.length} files...` : `AI is analyzing your ${files.length} course materials...`}
          subMessage={isTestMode() ? 'Using mock data for testing' : 'This may take a few moments'}
        />
      )}
    </div>
  );
}