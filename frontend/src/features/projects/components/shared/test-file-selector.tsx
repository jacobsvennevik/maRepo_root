'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, TestTube } from 'lucide-react';
import { getAvailableTestFiles, getTestFile } from '../../services/test-mode-utils';

interface TestFileSelectorProps {
  onFileSelect: (file: File) => void;
  fileType?: 'syllabus' | 'course_content' | 'test';
  title?: string;
  description?: string;
}

export function TestFileSelector({ 
  onFileSelect, 
  fileType,
  title = "Select Test File",
  description = "Choose a test file to upload and process through the real backend"
}: TestFileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const availableFiles = getAvailableTestFiles();
  const filteredFiles = fileType 
    ? availableFiles.filter(file => file.type === fileType)
    : availableFiles;

  const handleFileSelect = (filename: string) => {
    const file = getTestFile(filename);
    if (file) {
      setSelectedFile(filename);
      onFileSelect(file);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'syllabus':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'course_content':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'test':
        return <TestTube className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      syllabus: 'bg-blue-100 text-blue-800 border-blue-200',
      course_content: 'bg-green-100 text-green-800 border-green-200',
      test: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <Badge variant="outline" className={`text-xs ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TestTube className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
        <p className="text-sm text-yellow-700">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <div
              key={file.name}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedFile === file.name
                  ? 'border-yellow-400 bg-yellow-100'
                  : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
              }`}
              onClick={() => handleFileSelect(file.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(file.type)}
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-600">{file.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(file.type)}
                  {selectedFile === file.name && (
                    <Badge variant="default" className="bg-yellow-600 text-white text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedFile && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">
                Ready to process: {selectedFile}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              This file will be uploaded to the real backend and processed through the AI pipeline.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 