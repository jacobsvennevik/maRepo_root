'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT,
  simulateProcessingDelay,
  isTestMode,
  type ProcessedDocument 
} from '../../services/mock-data';
import { hybridUploadAndProcess, enhancedMockUpload } from '../../services/hybrid-test-utils';
import { TestModeBanner, ErrorMessage } from '../shared/upload-ui';
import { CourseContentMockBanner } from '../shared/mock-mode-banner';
import { HybridTestBanner } from '../shared/hybrid-test-banner';

interface CourseContentUploadStepProps {
  onUploadComplete: (data: ProcessedDocument[], fileNames: string[], files?: File[]) => void;
  onAnalysisComplete?: (data: ProcessedDocument[]) => void;
}

export function CourseContentUploadStep({
  onUploadComplete,
  onAnalysisComplete
}: CourseContentUploadStepProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedResults, setStoredResults] = useState<{
    data: ProcessedDocument[];
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
      console.log('🧪 HYBRID MODE: Processing', filesToAnalyze.length, 'course content files through real backend with mock data');

      // TEST MODE: Use enhanced mock with proper state updates
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Analyzing', filesToAnalyze.length, 'course content files with enhanced mock data');
        
        // Simulate upload progress for all files
        for (const file of filesToAnalyze) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        }
        
        // Use enhanced mock function that properly updates state
        const results = await enhancedMockUpload(
          filesToAnalyze,
          'course_content',
          (progress) => {
            console.log('🧪 ENHANCED MOCK: Progress:', progress);
          },
          (uploadedFiles, processedData) => {
            // 🔧 CRITICAL FIX: Update parent state with files and data
            console.log('🧪 ENHANCED MOCK: Updating parent state with files:', uploadedFiles.length, 'data:', processedData.length);
            
            // Call onUploadComplete with files to update parent state
            onUploadComplete(
              processedData.map(result => ({
                id: result.id,
                original_text: result.original_text,
                metadata: result.processed_data || result.metadata,
                status: result.status
              })),
              uploadedFiles.map(f => f.name),
              uploadedFiles // 🔧 Pass the actual files to update parent state
            );
          }
        );

        const fileName = firstFile.name;
        console.log('🧪 TEST MODE: Course content extraction completed for:', fileName);
        console.log('🧪 TEST MODE: Using enhanced mock course content data');

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
      console.log('🚀 PRODUCTION MODE: Processing course content files through real backend');
      
      const results = await hybridUploadAndProcess(
        filesToAnalyze,
        'course_content',
        (progress) => {
          console.log('🚀 PRODUCTION: Progress:', progress);
        },
        (uploadedFiles, processedData) => {
          // Update parent state with files and data
          onUploadComplete(
            processedData.map(result => ({
              id: result.id,
              original_text: result.original_text,
              metadata: result.processed_data || result.metadata,
              status: result.status
            })),
            uploadedFiles.map(f => f.name),
            uploadedFiles
          );
        }
      );

      const fileName = firstFile.name;
      console.log('🚀 PRODUCTION MODE: Course content extraction completed for:', fileName);

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
      console.error('Error analyzing course content files:', err);
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
    <div className="space-y-6" data-testid="course-content-upload-step">
      {isTestMode() ? (
        <HybridTestBanner 
          title="Course Content Analysis"
          description="Upload your course materials to see how the real AI processing pipeline works with reliable test data"
        />
      ) : (
        <CourseContentMockBanner />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 Course Content Upload
            {isTestMode() && <Badge variant="secondary">Test Mode</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onUpload={handleFileUpload}
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            maxSize={25 * 1024 * 1024} // 25MB
            multiple={true}
            disabled={isAnalyzing}
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
                {isTestMode() ? '🧪 Simulating AI analysis...' : '🤖 Analyzing course content...'}
              </p>
            </div>
          )}

          {showSuccess && (
            <div className="text-center py-4">
              <div className="text-green-600 text-2xl mb-2">✅</div>
              <p className="text-sm text-green-600 font-medium">
                Course content analysis completed successfully!
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
