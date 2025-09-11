"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Star,
  Eye,
  Clock,
  Download,
  Share2,
  Edit3,
  Trash2
} from "lucide-react";
import { FileItem } from '@/lib/file-utils';
import { getFileIcon, getFileTypeColor, formatFileSize } from '@/lib/file-utils';

interface RecentFileCardProps {
  file: FileItem;
}

export function RecentFileCard({ file }: RecentFileCardProps) {
  return (
    <Card className={`${file.bgColor} ${file.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${file.color}`}>
              {getFileIcon(file.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-ocean-600 transition-colors line-clamp-1">
                {file.name}
              </h3>
              <Badge className={`${getFileTypeColor(file.type)} text-xs mt-1`}>
                {file.type.toUpperCase()}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => console.log('Preview', file.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Download', file.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Share', file.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Rename', file.id)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => console.log('Delete', file.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Size</span>
            <span className="font-medium">{formatFileSize(file.size)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{file.uploadedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="capitalize">{file.visibility}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
