
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
import { Button } from '@/components/ui/button';

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
    original_text: "Language Technology Quiz - Natural Language Interaction\n\nSection A: Prolog Fundamentals\nA1a) Classify \"knows(pedro, Maria)\" as atom, variable, complex term, or not a term.\nA1b) Classify \"Blond(maria)\" as atom, variable, complex term, or not a term.\n...",
    metadata: {
      test_title: "Quizes Lang Tech",
      course_title: "Natural Language Interaction",
      course_type: "STEM",
      assessment_method: "written exam",
      exam_date: "",
      overall_points: "",
      assessment_types: {
        has_final_exam: false,
        has_regular_quizzes: true,
        has_essays: true,
        has_projects: false,
        has_lab_work: false,
        has_group_work: false,
        primary_assessment_method: "Regular quizzes and short essays"
      },
      question_summary: {
        total_questions: 27,
        question_type_breakdown: {
          multiple_choice: 0,
          true_false: 0,
          matching: 0,
          short_answer: 14,
          essay: 13,
          calculation: 0,
          diagram: 0,
          other: 0
        },
        difficulty_breakdown: { easy: 6, medium: 17, hard: 4 },
        cognitive_focus: {
          memorization: 0,
          understanding: 9,
          application: 9,
          analysis: 6,
          evaluation: 0,
          creation: 3
        }
      },
      key_topics: ["Prolog", "Unification", "Recursive predicates", "Neural networks", "Machine learning"],
      topic_alignment: {
        topics_covered_from_course: ["Knowledge representation based on inference", "Syntactic analysis and parsing", "Neural networks, deep learning and Transformers", "Vector representation of knowledge and distributional semantics"],
        new_topics_in_test: ["Prolog", "Unification", "Recursive predicates"],
        coverage_percentage: 75
      },
      questions: [
        {
          number: "A1a",
          text: "Classify \"knows(pedro, Maria)\" as atom, variable, complex term, or not a term.",
          options: [],
          correct_answer: "",
          question_type: "short_answer",
          difficulty: "medium",
          cognitive_level: "understanding",
          points: "",
          topics: ["Prolog syntax", "Atoms", "Terms"],
          explanation: ""
        },
        {
          number: "A2a",
          text: "Represent the assertion \"Pedro loves Ana.\" in Prolog.",
          options: [],
          correct_answer: "",
          question_type: "short_answer",
          difficulty: "medium",
          cognitive_level: "application",
          points: "",
          topics: ["Prolog", "Facts", "Representation"],
          explanation: ""
        },
        {
          number: "B3",
          text: "Write a recursive predicate travelBetween/2 that determines whether it is possible to travel by train between two towns using directTrain facts.",
          options: [],
          correct_answer: "",
          question_type: "essay",
          difficulty: "hard",
          cognitive_level: "creation",
          points: "",
          topics: ["Prolog", "Recursion", "Graphs"],
          explanation: ""
        },
        {
          number: "C3",
          text: "What is the difference between supervised and unsupervised machine learning?",
          options: [],
          correct_answer: "",
          question_type: "essay",
          difficulty: "easy",
          cognitive_level: "analysis",
          points: "",
          topics: ["Machine learning", "Supervised learning", "Unsupervised learning"],
          explanation: ""
        },
        {
          number: "D1",
          text: "Describe the purpose of each step in the neural network training algorithm: forward pass, loss estimation, and backward pass.",
          options: [],
          correct_answer: "",
          question_type: "essay",
          difficulty: "medium",
          cognitive_level: "understanding",
          points: "",
          topics: ["Neural networks", "Training", "Backpropagation"],
          explanation: ""
        }
      ]
    },
    status: 'completed'
  }
];

interface ProcessedDate {
  id: string;
  date: string;
  description: string;
  type: string;
}

interface TestUploadStepProps {
  onUploadComplete: (extractedTests: ProcessedTest[], fileNames: string[]) => void;
  onAnalysisComplete: () => void;
  onNext?: () => void;
  onBack?: () => void;
  extractedDates?: ProcessedDate[]; // Exam dates from syllabus extraction
}

export function TestUploadStep({ onUploadComplete, onAnalysisComplete, onNext, onBack, extractedDates }: TestUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [storedResults, setStoredResults] = useState<{ data: ProcessedTest[], fileNames: string[] } | null>(null);
  const router = useRouter();

  // Call onUploadComplete immediately when analysis completes for the guided setup
  React.useEffect(() => {
    if (showSuccess && storedResults) {
      onUploadComplete(storedResults.data, storedResults.fileNames);
    }
  }, [showSuccess, storedResults, onUploadComplete]);

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
    setShowSuccess(false);
    setStoredResults(null);

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
        setShowSuccess(true);
        setStoredResults({
          data: mockTests,
          fileNames: files.map(f => f.name)
        });
        onAnalysisComplete();
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
        return;
      }
      
      setShowSuccess(true);
      setStoredResults({
        data: processedTests,
        fileNames: files.map(f => f.name)
      });

    } catch (error) {
      console.error("Test analysis failed:", error);
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
    onAnalysisComplete();
  }, [files, router, onAnalysisComplete]);

  const handleRemove = useCallback((index: number) => {
    const fileToRemove = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
    
    // Clear progress for the removed file using shared utility
    if (fileToRemove) {
      clearProgress(setUploadProgress, fileToRemove.name);
    }
  }, [files]);

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
      {files.length > 0 && !showSuccess && (
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
      
      {showSuccess && (
        <div className="flex items-center justify-center p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
          <span className="font-medium">Tests analyzed successfully! Click "Next" to continue.</span>
        </div>
      )}

      {/* Display extracted exam dates from syllabus */}
      {extractedDates && extractedDates.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Exam dates from your syllabus
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            These dates were automatically extracted from your syllabus. Use them to plan your test preparation:
          </p>
          <div className="space-y-2">
            {extractedDates.filter(date => date.type === 'exam' || date.description.toLowerCase().includes('exam') || date.description.toLowerCase().includes('test')).map((date) => (
              <div key={date.id} className="flex items-center justify-between p-2 bg-white border border-blue-100 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-blue-900">
                    {new Date(date.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="text-xs text-blue-700">{date.description}</span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {date.type}
                </span>
              </div>
            ))}
          </div>
        </div>
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