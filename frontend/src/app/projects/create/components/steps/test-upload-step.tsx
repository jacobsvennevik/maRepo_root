
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { hybridUploadAndProcess, enhancedMockUpload } from '../../utils/hybrid-test-utils';
import { MOCK_PROCESSED_TESTS } from '../../services/mock-data';
import { TestModeBanner, ErrorMessage } from '../shared/upload-ui';
import { HybridTestBanner } from '../shared/hybrid-test-banner';

interface ProcessedTest {
  id: number;
  original_text: string;
  metadata: {
    test_title: string;
    course_title: string;
    course_type: string;
    assessment_method: string;
    exam_date: string;
    overall_points: string;
    assessment_types: {
      has_final_exam: boolean;
      has_regular_quizzes: boolean;
      has_essays: boolean;
      has_projects: boolean;
      has_lab_work: boolean;
      has_group_work: boolean;
      primary_assessment_method: string;
    };
    question_summary: {
      total_questions: number;
      question_type_breakdown: {
        multiple_choice: number;
        true_false: number;
        matching: number;
        short_answer: number;
        essay: number;
        calculation: number;
        diagram: number;
        other: number;
      };
      difficulty_breakdown: {
        easy: number;
        medium: number;
        hard: number;
      };
      cognitive_focus: {
        memorization: number;
        understanding: number;
        application: number;
        analysis: number;
        evaluation: number;
        creation: number;
      };
    };
    key_topics: string[];
    topic_alignment: {
      topics_covered_from_course: string[];
      new_topics_in_test: string[];
      coverage_percentage: number;
    };
    questions: Array<{
      number: string;
      text: string;
      options: string[];
      correct_answer: string;
      question_type: string;
      difficulty: string;
      cognitive_level: string;
      points: string;
      topics: string[];
      explanation: string;
    }>;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface TestUploadStepProps {
  onUploadComplete: (data: ProcessedTest[], fileNames: string[], files?: File[]) => void;
  onAnalysisComplete?: (data: ProcessedTest[]) => void;
}

export function TestUploadStep({
  onUploadComplete,
  onAnalysisComplete
}: TestUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedResults, setStoredResults] = useState<{
    data: ProcessedTest[];
    fileNames: string[];
  } | null>(null);

  const handleFileUpload = useCallback(async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    setError(null);
    setShowSuccess(false);
    
    // Auto-analyze files when they're uploaded
    await handleAnalyze(uploadedFiles);
  }, []);

  const handleAnalyze = useCallback(async (filesToAnalyze: File[] = files) => {
    if (filesToAnalyze.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setShowSuccess(false);

    try {
      const firstFile = filesToAnalyze[0];
      console.log('🧪 HYBRID MODE: Processing', filesToAnalyze.length, 'test files through real backend with mock data');

      // TEST MODE: Use enhanced mock with proper state updates
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Analyzing', filesToAnalyze.length, 'test files with enhanced mock data');
        
        // Simulate upload progress for all files
        for (const file of filesToAnalyze) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        
        // Use enhanced mock function that properly updates state
        const results = await enhancedMockUpload(
          filesToAnalyze,
          'test_files',
          (progress) => {
            console.log('🧪 ENHANCED MOCK: Progress:', progress);
          },
          (uploadedFiles, processedData) => {
            // 🔧 CRITICAL FIX: Update parent state with files and data
            console.log('🧪 ENHANCED MOCK: Updating parent state with files:', uploadedFiles.length, 'data:', processedData.length);
            
            // Convert to ProcessedTest format
            const processedTests: ProcessedTest[] = processedData.map(result => ({
              id: result.id,
              original_text: result.original_text,
              metadata: result.processed_data || result.metadata,
              status: result.status
            }));
            
            // Call onUploadComplete with files to update parent state
            onUploadComplete(
              processedTests,
              uploadedFiles.map(f => f.name),
              uploadedFiles // 🔧 Pass the actual files to update parent state
            );
          }
        );

        const fileName = firstFile.name;
        console.log('🧪 TEST MODE: Test extraction completed for:', fileName);
        console.log('🧪 TEST MODE: Using enhanced mock test data');

        setIsAnalyzing(false);
        setShowSuccess(true);
        setStoredResults({
          data: results.map(result => ({
            id: result.id,
            original_text: result.original_text,
            metadata: result.processed_data || result.metadata,
            status: result.status
          })),
          fileNames: filesToAnalyze.map(f => f.name)
        });

        // Call analysis complete callback
        if (onAnalysisComplete) {
          onAnalysisComplete(results.map(result => ({
            id: result.id,
            original_text: result.original_text,
            metadata: result.processed_data || result.metadata,
            status: result.status
          })));
        }

        return;
      }

      // PRODUCTION MODE: Use real backend processing
      console.log('🚀 PRODUCTION MODE: Processing test files through real backend');
      
      const results = await hybridUploadAndProcess(
        filesToAnalyze,
        'test_files',
        (progress) => {
          console.log('🚀 PRODUCTION: Progress:', progress);
        },
        (uploadedFiles, processedData) => {
          // Convert to ProcessedTest format
          const processedTests: ProcessedTest[] = processedData.map(result => ({
            id: result.id,
            original_text: result.original_text,
            metadata: result.processed_data || result.metadata,
            status: result.status
          }));
          
          // Update parent state with files and data
          onUploadComplete(
            processedTests,
            uploadedFiles.map(f => f.name),
            uploadedFiles
          );
        }
      );

      const fileName = firstFile.name;
      console.log('🚀 PRODUCTION MODE: Test extraction completed for:', fileName);

      setIsAnalyzing(false);
      setShowSuccess(true);
      setStoredResults({
        data: results.map(result => ({
          id: result.id,
          original_text: result.original_text,
          metadata: result.processed_data || result.metadata,
          status: result.status
        })),
        fileNames: filesToAnalyze.map(f => f.name)
      });

      // Call analysis complete callback
      if (onAnalysisComplete) {
        onAnalysisComplete(results.map(result => ({
          id: result.id,
          original_text: result.original_text,
          metadata: result.processed_data || result.metadata,
          status: result.status
        })));
      }

    } catch (err) {
      console.error('Error analyzing test files:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze files');
      setIsAnalyzing(false);
    }
  }, [files, onUploadComplete, onAnalysisComplete]);

  const handleRemoveFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setShowSuccess(false);
    setStoredResults(null);
  }, []);

  // Auto-analyze when files change
  useEffect(() => {
    if (files.length > 0 && !isAnalyzing && !showSuccess) {
      handleAnalyze();
    }
  }, [files, isAnalyzing, showSuccess, handleAnalyze]);

  // Call onUploadComplete when stored results are available
  useEffect(() => {
    if (storedResults && files.length > 0) {
      onUploadComplete(
        storedResults.data,
        storedResults.fileNames,
        files // 🔧 Pass the actual files to update parent state
      );
    }
  }, [storedResults, files, onUploadComplete]);

  return (
    <div className="space-y-6" data-testid="test-upload-step">
      {isTestMode() ? (
        <HybridTestBanner 
          title="Test & Exam Analysis"
          description="Upload past tests and exams to see how the real AI processing pipeline works with reliable test data"
        />
      ) : (
        <TestModeBanner />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Test & Exam Upload
            {isTestMode() && <Badge variant="secondary">Test Mode</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onUpload={handleFileUpload}
            accept=".pdf,.doc,.docx"
            maxSize={25 * 1024 * 1024} // 25MB
            data-testid="file-input"
          />

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Files:</h4>
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.name] !== undefined && (
                      <Progress value={uploadProgress[file.name]} className="w-20" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(file.name)}
                      disabled={isAnalyzing}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                {isTestMode() ? '🧪 Simulating AI analysis...' : '🤖 Analyzing test content...'}
              </p>
            </div>
          )}

          {showSuccess && (
            <div className="text-center py-4">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <p className="text-sm text-green-600 font-medium">
                Test analysis completed successfully!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {storedResults?.fileNames.length} file(s) processed
              </p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}
        </CardContent>
      </Card>
    </div>
  );
} 