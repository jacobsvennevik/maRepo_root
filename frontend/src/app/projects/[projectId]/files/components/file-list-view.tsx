"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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

interface FileListViewProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onSelectFile: (fileId: string) => void;
  onSelectAll: () => void;
  onToggleFavorite: (fileId: string) => void;
  onFileAction: (action: string, fileId: string) => void;
}

export function FileListView({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onToggleFavorite,
  onFileAction,
}: FileListViewProps) {
  const allSelected = files.length > 0 && selectedFiles.size === files.length;
  const someSelected = selectedFiles.size > 0 && selectedFiles.size < files.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date modified</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => onSelectFile(file.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${file.color}`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                      <Badge className={`${getFileTypeColor(file.type)} text-xs`}>
                        {file.type.toUpperCase()}
                      </Badge>
                      {file.tags && file.tags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {file.tags[0]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="capitalize">{file.visibility}</span>
                      {file.versionCount && file.versionCount > 1 && (
                        <>
                          <span>•</span>
                          <span>{file.versionCount} versions</span>
                        </>
                      )}
                      {file.sharedWith && file.sharedWith.length > 0 && (
                        <>
                          <span>•</span>
                          <span>Shared with {file.sharedWith.length}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{file.lastModified}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(file.id)}
                    className="p-1 h-8 w-8"
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        file.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                      }`} 
                    />
                  </Button>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
