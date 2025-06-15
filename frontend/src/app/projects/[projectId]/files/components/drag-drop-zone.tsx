'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';

interface DragDropZoneProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onBrowseClick: () => void;
  className?: string;
  title?: string;
  description?: string;
  supportedFormats?: string;
}

export function DragDropZone({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowseClick,
  className = '',
  title = 'Drag & drop files here',
  description = 'Support for PDF, DOCX, PPTX, TXT, PNG, JPG, CSV, MD, ZIP, MP4',
  supportedFormats = 'PDF, DOCX, PPTX, TXT, PNG, JPG, CSV, MD, ZIP, MP4'
}: DragDropZoneProps) {
  return (
    <Card className={`bg-gradient-to-r from-slate-50/80 to-blue-50/60 backdrop-blur-sm border-blue-200/50 ${className}`}>
      <CardContent className="p-12">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50/50 scale-105' 
              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50/50'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isDragOver ? 'Drop your files here!' : title}
              </h3>
              <p className="text-slate-600 mb-4">
                {description}
              </p>
              <Button 
                variant="outline" 
                onClick={onBrowseClick}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Or browse files
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 