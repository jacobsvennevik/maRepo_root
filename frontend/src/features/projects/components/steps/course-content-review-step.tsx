'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Sparkles } from 'lucide-react';

interface ProcessedDocument {
  id: number;
  original_text: string;
  metadata: any;
  status: 'completed' | 'pending' | 'processing' | 'error';
}

interface CourseContentReviewStepProps {
  extractedContent: ProcessedDocument[];
  fileNames: string[];
  onConfirm: () => void;
}

/*
 * CourseContentReviewStep
 * -----------------------
 * Presents a lightweight overview of the extracted course materials so the
 * student can confirm everything looks correct before proceeding.
 */
export function CourseContentReviewStep({ extractedContent, fileNames, onConfirm }: CourseContentReviewStepProps) {
  const [expandedDocId, setExpandedDocId] = useState<number | null>(null);

  const toggleDoc = (id: number) => {
    setExpandedDocId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6" data-testid="course-content-review-step">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Content Analysis Complete!</h2>
          <p className="text-sm text-gray-600 mt-1">
            We've processed {fileNames.length} {fileNames.length === 1 ? 'file' : 'files'}. Review the excerpts below.
          </p>
        </div>
      </div>

      {/* Documents overview */}
      <div className="space-y-4">
        {extractedContent.map(doc => (
          <Card key={doc.id} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => toggleDoc(doc.id)}>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-medium truncate max-w-xs sm:max-w-sm">
                  {doc.metadata?.source_file || `Document #${doc.id}`}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {doc.metadata?.page_count ? `${doc.metadata.page_count} pages` : 'excerpt'}
              </Badge>
            </CardHeader>
            {expandedDocId === doc.id && (
              <CardContent className="space-y-3">
                <pre className="bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {doc.original_text}
                </pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button onClick={onConfirm} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
          <CheckCircle className="h-4 w-4" />
          Looks Good - Continue
        </Button>
      </div>
    </div>
  );
} 