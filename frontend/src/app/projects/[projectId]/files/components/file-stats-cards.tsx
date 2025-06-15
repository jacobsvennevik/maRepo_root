'use client';

import { Card, CardContent } from "@/components/ui/card";
import { File, Sparkles, Clock } from 'lucide-react';

interface FileStats {
  totalFiles: number;
  totalSize: number;
  aiGenerated: number;
  lastUpload: string;
}

interface FileStatsCardsProps {
  stats: FileStats;
  formatFileSize: (bytes: number) => string;
}

export function FileStatsCards({ stats, formatFileSize }: FileStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-sm border-blue-200/50 hover:shadow-xl transition-all duration-500"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg">
              <File className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">Total Files</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalFiles}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-green-50/80 to-green-100/60 backdrop-blur-sm border-green-200/50 hover:shadow-xl transition-all duration-500"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">AI Enhanced</p>
              <p className="text-2xl font-bold text-slate-900">{stats.aiGenerated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-sm border-purple-200/50 hover:shadow-xl transition-all duration-500"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-600">Last Upload</p>
              <p className="text-2xl font-bold text-slate-900">{stats.lastUpload}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 