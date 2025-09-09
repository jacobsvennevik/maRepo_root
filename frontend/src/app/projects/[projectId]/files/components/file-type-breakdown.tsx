"use client";

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { FileItem } from '@/lib/file-utils';

interface FileTypeBreakdownProps {
  files: FileItem[];
}

export function FileTypeBreakdown({ files }: FileTypeBreakdownProps) {
  // Calculate breakdown
  const breakdown = files.reduce((acc, file) => {
    let category = 'other';
    if (['pdf', 'docx', 'pptx', 'txt', 'md'].includes(file.type)) {
      category = 'documents';
    } else if (['png', 'jpg', 'jpeg'].includes(file.type)) {
      category = 'images';
    } else if (['mp4'].includes(file.type)) {
      category = 'videos';
    } else if (['mp3', 'wav'].includes(file.type)) {
      category = 'audio';
    } else if (['zip'].includes(file.type)) {
      category = 'archives';
    }
    
    if (!acc[category]) {
      acc[category] = { count: 0, size: 0 };
    }
    acc[category].count++;
    acc[category].size += file.size;
    
    return acc;
  }, {} as Record<string, { count: number; size: number }>);

  const totalFiles = files.length;
  const categories = [
    { key: 'documents', label: 'Documents', color: 'bg-blue-500', count: breakdown.documents?.count || 0 },
    { key: 'images', label: 'Images', color: 'bg-cyan-500', count: breakdown.images?.count || 0 },
    { key: 'videos', label: 'Videos', color: 'bg-purple-500', count: breakdown.videos?.count || 0 },
    { key: 'audio', label: 'Audio', color: 'bg-green-500', count: breakdown.audio?.count || 0 },
    { key: 'archives', label: 'ZIP', color: 'bg-orange-500', count: breakdown.archives?.count || 0 },
  ];

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
        {categories.map((category) => {
          const percentage = totalFiles > 0 ? (category.count / totalFiles) * 100 : 0;
          return (
            <div
              key={category.key}
              className={`${category.color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {categories.map((category) => (
          <div key={category.key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${category.color}`} />
            <span className="text-sm text-gray-600">{category.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
