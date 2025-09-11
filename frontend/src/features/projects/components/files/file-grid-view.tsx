"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Star,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Clock
} from "lucide-react";
import { FileItem } from '@/lib/file-utils';
import { getFileIcon, getFileTypeColor, formatFileSize } from '@/lib/file-utils';

interface FileGridViewProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onFileAction: (action: string, fileId: string) => void;
}

export function FileGridView({
  files,
  selectedFiles,
  onSelectFile,
  onToggleFavorite,
  onFileAction,
}: FileGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card 
          key={file.id} 
          className={`${file.bgColor} ${file.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group relative`}
        >
          <CardContent className="p-4">
            {/* Selection checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedFiles.has(file.id)}
                onCheckedChange={() => onSelectFile(file.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Favorite button */}
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(file.id);
                }}
                className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star 
                  className={`h-4 w-4 ${
                    file.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`} 
                />
              </Button>
            </div>

            {/* File icon and info */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${file.color} shadow-lg mb-3`}>
                {getFileIcon(file.type)}
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-ocean-600 transition-colors line-clamp-2 mb-2">
                {file.name}
              </h3>
              <Badge className={`${getFileTypeColor(file.type)} text-xs mb-2`}>
                {file.type.toUpperCase()}
              </Badge>
            </div>

            {/* File details */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Size</span>
                <span className="font-medium">{formatFileSize(file.size)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Modified</span>
                <span>{file.lastModified}</span>
              </div>

              <div className="flex justify-between">
                <span>Visibility</span>
                <span className="capitalize">{file.visibility}</span>
              </div>

              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {file.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{file.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {file.versionCount && file.versionCount > 1 && (
                <div className="text-xs text-gray-500">
                  {file.versionCount} versions
                </div>
              )}

              {file.sharedWith && file.sharedWith.length > 0 && (
                <div className="text-xs text-gray-500">
                  Shared with {file.sharedWith.length}
                </div>
              )}
            </div>

            {/* Actions dropdown */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onFileAction('preview', file.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Open/Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileAction('download', file.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileAction('share', file.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share/Get link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileAction('rename', file.id)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileAction('move', file.id)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileAction('versions', file.id)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onFileAction('delete', file.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
