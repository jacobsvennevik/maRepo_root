'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, Sparkles, Clock } from 'lucide-react';

interface FileHeaderProps {
  title: string;
  description: string;
  stats: {
    totalFiles: number;
    aiGenerated: number;
    lastUpload: string;
    totalSize: number;
  };
  formatFileSize: (bytes: number) => string;
}

export function FileHeader({ 
  title, 
  description, 
  stats, 
  formatFileSize 
}: FileHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-blue-200/50 shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                <p className="text-slate-600">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-blue-600" />
                <span>{stats.totalFiles} Total Files</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>{stats.aiGenerated} AI Enhanced</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span>Last upload: {stats.lastUpload}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
                <div className="text-xs">Storage Used</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 