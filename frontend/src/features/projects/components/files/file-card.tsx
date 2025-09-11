"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit3,
  Share2,
  Brain,
  BookOpen,
  Trash2,
  Clock,
  Eye,
  Sparkles,
} from "lucide-react";

export interface FileItem {
  id: string;
  name: string;
  type:
    | "pdf"
    | "docx"
    | "pptx"
    | "txt"
    | "png"
    | "jpg"
    | "jpeg"
    | "csv"
    | "md"
    | "zip"
    | "mp4";
  size: number;
  uploadedAt: string;
  status: "uploading" | "completed" | "error";
  progress?: number;
  error?: string;
  isAIGenerated?: boolean;
  tags?: string[];
  source?: string;
  visibility: "private" | "shared" | "public";
  color: string;
  bgColor: string;
  borderColor: string;
}

interface FileCardProps {
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

export function FileCard({
  file,
  getFileIcon,
  getFileTypeColor,
  formatFileSize,
  onGenerateFlashcards,
  onGenerateNotes,
  onShare,
  onDelete,
  onRename,
}: FileCardProps) {
  return (
    <Card
      className={`${file.bgColor} ${file.borderColor} border-2 hover:shadow-xl transition-all duration-500 cursor-pointer group`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r ${file.color} shadow-lg`}
            >
              {getFileIcon(file.type)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Size</span>
            <span className="font-medium">{formatFileSize(file.size)}</span>
          </div>

          {file.status === "uploading" && file.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Uploading...</span>
                <span>{file.progress}%</span>
              </div>
              <Progress value={file.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{file.uploadedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="capitalize">{file.visibility}</span>
            </div>
          </div>

          {file.isAIGenerated && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Sparkles className="h-3 w-3" />
              <span>AI Enhanced</span>
            </div>
          )}

          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
        </div>
      </CardContent>
    </Card>
  );
}
