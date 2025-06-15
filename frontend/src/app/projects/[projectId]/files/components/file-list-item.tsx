'use client';

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Edit3,
  Share2,
  Brain,
  BookOpen,
  Trash2,
  Sparkles
} from 'lucide-react';
import { type FileItem } from './file-card';

interface FileListItemProps {
  file: FileItem;
  getFileIcon: (type: string) => React.ReactNode;
  getFileTypeColor: (type: string) => string;
  formatFileSize: (bytes: number) => string;
  onGenerateFlashcards: (id: string) => void;
  onGenerateNotes: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

export function FileListItem({ 
  file, 
  getFileIcon, 
  getFileTypeColor, 
  formatFileSize,
  onGenerateFlashcards,
  onGenerateNotes,
  onShare,
  onDelete,
  onRename
}: FileListItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${file.color}`}>
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-medium text-gray-900">{file.name}</h3>
              <Badge className={`${getFileTypeColor(file.type)} text-xs`}>
                {file.type.toUpperCase()}
              </Badge>
              {file.isAIGenerated && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{file.uploadedAt}</span>
              <span>•</span>
              <span className="capitalize">{file.visibility}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {file.status === 'uploading' && file.progress !== undefined && (
            <div className="flex items-center gap-2">
              <Progress value={file.progress} className="w-20 h-2" />
              <span className="text-xs text-gray-500">{file.progress}%</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onRename(file.id)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(file.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateFlashcards(file.id)}>
                <Brain className="h-4 w-4 mr-2" />
                Generate Flashcards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateNotes(file.id)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Generate Notes
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(file.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 