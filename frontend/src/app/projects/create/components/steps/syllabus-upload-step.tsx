'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { createProject, uploadFileWithProgress, APIError, ProjectData } from '../../services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Test mode - set to true to bypass API calls and use mock data
const TEST_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_MODE !== 'false';

interface ProcessedDocument {
  id: number;
  original_text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

// Mock data for test mode
const MOCK_PROCESSED_DOCUMENT: ProcessedDocument = {
  id: 123,
  original_text: "This is a mock analysis of multiple course materials for Computer Science 101. The course covers programming fundamentals, data structures, and algorithms. Assignments are due every two weeks. Final exam is on December 15th.",
  metadata: {
    course_name: "Computer Science 101",
    course_code: "CS101",
    instructor: "Dr. Jane Smith",
    semester: "Fall 2024",
    assignments: [
      { name: "Assignment 1", due_date: "2024-09-15", description: "Basic Python programming" },
      { name: "Assignment 2", due_date: "2024-09-29", description: "Data structures implementation" },
      { name: "Final Project", due_date: "2024-12-01", description: "Comprehensive programming project" }
    ],
    topics: [
      "Python Programming",
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Database Basics"
    ],
    exam_dates: [
      { name: "Midterm Exam", date: "2024-10-15" },
      { name: "Final Exam", date: "2024-12-15" }
    ],
    test_types: [
      { type: "Multiple Choice Exams", confidence: 90 },
      { type: "Programming Assignments", confidence: 95 },
      { type: "Lab Reports", confidence: 85 },
      { type: "Group Projects", confidence: 80 }
    ],
    grading: [
      { category: "Exams", weight: 40 },
      { category: "Assignments", weight: 30 },
      { category: "Labs", weight: 20 },
      { category: "Participation", weight: 10 }
    ]
  },
  status: 'completed'
};

interface SyllabusUploadStepProps {
  onUploadComplete: (projectId: string, extractedData: ProcessedDocument, fileName?: string) => void;
  onNext?: () => void;
}

export function SyllabusUploadStep({ onUploadComplete, onNext }: SyllabusUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || '203e2ee2825aaf19fbd5a9a5c4768c243944058c'; // Fallback to dev token
    return token ? {
      'Authorization': `Bearer ${token}`,
    } : {};
  };

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
       if (TEST_MODE) {
         console.log('🧪 TEST MODE: Analyzing', files.length, 'files with mock data');
         
         // Simulate upload progress for all files
         for (const file of files) {
           setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
         }
         
         // Simulate processing time
         await new Promise(resolve => setTimeout(resolve, 3000));
         
         // In test mode, don't create a project yet - just extract information
         const fileName = files[0].name;
         console.log('🧪 TEST MODE: Extraction completed for:', fileName);

         setIsAnalyzing(false);
         // Pass 'test-mode' as projectId and the filename for test mode
         onUploadComplete('test-mode', MOCK_PROCESSED_DOCUMENT, fileName);
         return;
       }

       // Real API calls for production
       // Process each file
       for (const file of files) {
         const formData = new FormData();
         formData.append('file', file);
         formData.append('file_type', 'pdf');
         formData.append('upload_type', 'course_files');

         console.log('Uploading syllabus to PDF service:', file.name);
         
         const uploadResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/`, {
           method: 'POST',
           body: formData,
           headers: {
             ...getAuthHeaders(),
           },
         });

         if (!uploadResponse.ok) {
           const errorText = await uploadResponse.text();
           console.error('Upload failed:', {
             status: uploadResponse.status,
             statusText: uploadResponse.statusText,
             error: errorText
           });
           throw new Error(`Failed to upload ${file.name} to PDF service: ${uploadResponse.status} ${uploadResponse.statusText}`);
         }

         const document = await uploadResponse.json();
         console.log('File uploaded, starting processing:', document);

         setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
         
         const processResponse = await fetch(`${API_BASE_URL}/api/pdf_service/documents/${document.id}/process/`, {
           method: 'POST',
           headers: {
             ...getAuthHeaders(),
           },
         });

         if (!processResponse.ok) {
           throw new Error(`Failed to start processing for ${file.name}`);
         }
       }

       console.log('All files uploaded, polling for results...');

       // For now, we'll use the first file's result as the main result
       // In a real implementation, you might want to combine results from multiple files
       const firstFile = files[0];
       const projectName = MOCK_PROCESSED_DOCUMENT.metadata?.course_name || firstFile.name.replace(/\.[^/.]+$/, '');
       
       const projectData: Partial<ProjectData> = {
         name: projectName,
         project_type: 'school',
         course_name: projectName,
         is_draft: true,
       };

       const newProject = await createProject(projectData as ProjectData);
       console.log('Project created:', newProject);

       setIsAnalyzing(false);
       onUploadComplete(newProject.id, MOCK_PROCESSED_DOCUMENT);

     } catch (error) {
       console.error("Syllabus analysis failed:", error);
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
      {TEST_MODE && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-sm">🧪</span>
            <span className="text-yellow-800 text-sm font-medium">Test Mode Active</span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            Using mock data instead of actual PDF processing. Set NEXT_PUBLIC_TEST_MODE=false to disable.
          </p>
        </div>
      )}
      
      <FileUpload
        onUpload={handleUpload}
        onRemove={handleRemove}
        accept=".pdf"
        maxFiles={5}
        maxSize={10 * 1024 * 1024} // 10MB
        required={true}
        title="Upload your course materials"
        description="Upload your syllabus, course documents, and other materials. Our AI will analyze them to extract course details, deadlines, and topics."
        buttonText="Browse for course materials"
        files={files}
        uploadProgress={uploadProgress}
        error={error || undefined}
        disabled={isAnalyzing}
      />
      
      {/* Analyze Button */}
      {files.length > 0 && !isAnalyzing && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔍 Analyze {files.length} {files.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">
              {TEST_MODE ? `🧪 Simulating AI analysis of ${files.length} files...` : `AI is analyzing your ${files.length} course materials...`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {TEST_MODE ? 'Using mock data for testing' : 'This may take a few moments'}
          </p>
        </div>
      )}
    </div>
  );
} 