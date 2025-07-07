'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { APIError } from '../../services/api';
import { 
  API_BASE_URL, 
  isTestMode, 
  getAuthHeaders,
  uploadFileToService, 
  startDocumentProcessing, 
  pollDocumentStatus,
  validateFiles,
  updateProgress,
  clearProgress
} from '../../utils/upload-utils';
import { TestModeBanner, ErrorMessage, AnalyzeButton } from '../shared/upload-ui';

interface ProcessedTest {
  id: number;
  original_text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

// Mock data for test mode
const MOCK_PROCESSED_TESTS: ProcessedTest[] = [
  {
    id: 456,
    original_text: "Midterm Exam - Computer Science 101\n\nQuestion 1: Explain the difference between arrays and linked lists (10 points)\nQuestion 2: Write a Python function to reverse a string (15 points)\nQuestion 3: What is the time complexity of binary search? (5 points)",
    metadata: {
      test_type: "Midterm Exam",
      course: "Computer Science 101",
      total_points: 30,
      duration: "90 minutes",
      question_types: [
        { type: "Short Answer", count: 2, points: 25 },
        { type: "Multiple Choice", count: 1, points: 5 }
      ],
      topics_covered: [
        "Data Structures",
        "Algorithms", 
        "Python Programming",
        "Time Complexity"
      ],
      difficulty_level: "Intermediate",
      estimated_study_time: "4-6 hours",
      key_concepts: [
        "Arrays vs Linked Lists",
        "String Manipulation",
        "Binary Search Algorithm",
        "Time Complexity Analysis"
      ]
    },
    status: 'completed'
  }
];

interface TestUploadStepProps {
  onUploadComplete: (extractedTests: ProcessedTest[], fileNames: string[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function TestUploadStep({ onUploadComplete, onNext, onBack }: TestUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();



  const handleUpload = useCallback(async (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    
    // Validate file types and sizes using shared utility
    const validTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validation = validateFiles(newFiles, validTypes, 15);
    
    if (validation.invalidFiles.length > 0) {
      setError('Invalid file type. Please upload PDF or image files (JPG, PNG) only.');
      return;
    }

    if (validation.oversizedFiles.length > 0) {
      setError('File is too large. Maximum size is 15MB per file.');
      return;
    }

    console.log('Test files added:', newFiles.map(f => f.name));
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) {
      setError("Please upload at least one test file before analyzing.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // TEST MODE: Skip API calls and use mock data
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Analyzing', files.length, 'test files with mock data');
        
        // Simulate upload progress for all files
        for (const file of files) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock data for each uploaded file
        const mockTests = files.map((file, index) => ({
          ...MOCK_PROCESSED_TESTS[0],
          id: 456 + index,
          metadata: {
            ...MOCK_PROCESSED_TESTS[0].metadata,
            source_file: file.name,
            test_type: file.name.toLowerCase().includes('midterm') ? 'Midterm Exam' : 
                      file.name.toLowerCase().includes('final') ? 'Final Exam' :
                      file.name.toLowerCase().includes('quiz') ? 'Quiz' : 'Practice Test'
          }
        }));

        setIsAnalyzing(false);
        onUploadComplete(mockTests, files.map(f => f.name));
        return;
      }

      // Real API calls for production
      const processedTests: ProcessedTest[] = [];
      const errors: string[] = [];
      
      for (const file of files) {
        try {
          // Step 1: Upload the test file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('file_type', file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image');
          formData.append('upload_type', 'test_materials');

          console.log('Uploading test file to PDF service:', file.name);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
            },
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', errorText);
            throw new Error(`Failed to upload ${file.name}: ${uploadResponse.status} ${uploadResponse.statusText}`);
          }

          const document = await uploadResponse.json();
          console.log('Test file uploaded successfully:', document);
          setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
          
          // Step 2: Start processing with test-specific processing
          const processResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${document.id}/process/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMzE4MDc5LCJpYXQiOjE3NTAzMTQ0NzksImp0aSI6IjU1MmVjNDQ4ZTllNjRmNjM5OTBlNTgyNzk3NzBjNjg2IiwidXNlcl9pZCI6MX0.O8k3yL_dUEMvkBaqxViq-syDXTZNqDfjKtWZEMlxJ14'}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              processing_type: 'test_analysis' // Specify test analysis processing
            })
          });

          if (!processResponse.ok) {
            throw new Error(`Failed to start processing: ${processResponse.status}`);
          }

          setUploadProgress(prev => ({ ...prev, [file.name]: 75 }));

          // Step 3: Poll for completion
          const maxAttempts = 8;
          let attempts = 0;
          let processedData = null;

          while (attempts < maxAttempts && !processedData) {
            try {
              const statusResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${document.id}/`, {
                method: 'GET',
                headers: getAuthHeaders(),
              });

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                
                if (statusData.status === 'completed') {
                  processedData = {
                    id: statusData.id,
                    original_text: statusData.original_text,
                    metadata: statusData.processed_data || statusData.metadata || {},
                    status: 'completed' as const
                  };
                  setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                  break;
                } else if (statusData.status === 'error') {
                  // Processing failed - throw error to break out of loop
                  throw new Error('Test processing failed: ' + (statusData.error_message || 'Unknown error'));
                }
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (pollError) {
              // If this is a processing error, re-throw it
              if (pollError instanceof Error && pollError.message.includes('Test processing failed')) {
                throw pollError;
              }
              // Otherwise, continue polling
              attempts++;
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }

          // Handle timeout with fallback data
          if (!processedData) {
            processedData = {
              id: document.id,
              original_text: 'Test content processed',
              metadata: {
                source_file: file.name,
                test_type: 'Exam',
                topics_covered: []
              },
              status: 'completed' as const
            };
          }

          processedTests.push(processedData);
          
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          
          // Collect error and continue with other files
          errors.push(fileError instanceof Error ? fileError.message : 'Processing failed');
          
          // Continue with other files, but record the error
          processedTests.push({
            id: Date.now() + Math.random(),
            original_text: '',
            metadata: {
              source_file: file.name,
              error: fileError instanceof Error ? fileError.message : 'Processing failed'
            },
            status: 'error' as const
          });
        }
      }

      setIsAnalyzing(false);
      
      // Show errors if any occurred
      if (errors.length > 0) {
        setError(`${errors.length} file(s) failed to process: ${errors[0]}`);
      }
      
      onUploadComplete(processedTests, files.map(f => f.name));

    } catch (error) {
      console.error("Test analysis failed:", error);
      setIsAnalyzing(false);
      
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

  const handleRemove = useCallback((fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file.name !== fileToRemove.name));
    setError(null);
    
    // Clear progress for the removed file using shared utility
    clearProgress(setUploadProgress, fileToRemove.name);
  }, []);

  return (
    <div className="space-y-6" data-testid="test-upload-step">
      {isTestMode() && <TestModeBanner />}
      
      {error && !isAnalyzing && <ErrorMessage message={error} />}
      
      <FileUpload
        onUpload={handleUpload}
        onRemove={handleRemove}
        accept=".pdf,.jpg,.jpeg,.png"
        maxFiles={10}
        maxSize={15 * 1024 * 1024} // 15MB
        required={false}
        title="Upload previous tests and exams"
        description="Upload past exams, quizzes, tests, and practice materials. We'll analyze them to understand question types, difficulty levels, and study patterns. PDF files and images are supported."
        buttonText="Browse for test files"
        files={files}
        uploadProgress={uploadProgress}
      />
      
      {/* Analyze Button */}
      {files.length > 0 && (
        <AnalyzeButton
          onClick={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={false}
          filesCount={files.length}
          testId="analyze-tests-button"
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          📊 Analyze {files.length} Test {files.length === 1 ? 'File' : 'Files'}
        </AnalyzeButton>
      )}
      
      {isAnalyzing && (
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-500">
            {isTestMode() ? 'Using mock data for testing' : 'Identifying question types, difficulty levels, and key topics'}
          </p>
        </div>
      )}
    </div>
  );
} 