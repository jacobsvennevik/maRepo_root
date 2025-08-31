'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { AnalyzeButton } from '@/app/projects/create/components/steps/shared/analyze-button';

export default function TestUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpload = (updatedFiles: File[]) => {
    console.log('🔄 Test handleUpload called with files:', updatedFiles.map(f => f.name));
    setFiles(updatedFiles);
  };

  const handleAnalyze = async () => {
    console.log('🔍 Test handleAnalyze called');
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowSuccess(true);
      console.log('✅ Analysis complete');
    }, 2000);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Test Page</h1>
      
      <div className="space-y-6">
        <FileUpload
          onUpload={handleUpload}
          accept=".pdf"
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          title="Upload your course materials"
          description="Upload your syllabus, course documents, tests, and other materials."
          buttonText="Browse for course materials"
          files={files}
        />
        
        {/* Debug info */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Files count: {files.length}</p>
          <p>Is analyzing: {isAnalyzing.toString()}</p>
          <p>Show success: {showSuccess.toString()}</p>
          <p>Files: {files.map(f => f.name).join(', ')}</p>
        </div>

        {/* Analyze button */}
        {files.length > 0 && !isAnalyzing && !showSuccess && (
          <div className="flex justify-center">
            <AnalyzeButton
              onClick={handleAnalyze}
              isAnalyzing={isAnalyzing}
              disabled={isAnalyzing}
              filesCount={files.length}
            />
          </div>
        )}

        {/* Success message */}
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Analysis completed successfully!
          </div>
        )}

        {/* Loading spinner */}
        {isAnalyzing && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Analyzing files...</p>
          </div>
        )}
      </div>
    </div>
  );
} 