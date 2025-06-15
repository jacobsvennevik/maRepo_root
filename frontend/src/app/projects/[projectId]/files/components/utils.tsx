import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Archive, 
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio
} from 'lucide-react';

export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'png' | 'jpg' | 'jpeg' | 'csv' | 'md' | 'zip' | 'mp4';
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  error?: string;
  isAIGenerated?: boolean;
  tags?: string[];
  source?: string;
  visibility: 'private' | 'shared' | 'public';
  color: string;
  bgColor: string;
  borderColor: string;
}

export const getFileIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-500" />;
    case 'docx':
      return <FileText className="h-6 w-6 text-blue-500" />;
    case 'pptx':
      return <FileText className="h-6 w-6 text-orange-500" />;
    case 'txt':
      return <FileText className="h-6 w-6 text-slate-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-6 w-6 text-green-500" />;
    case 'csv':
      return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
    case 'md':
      return <FileCode className="h-6 w-6 text-purple-500" />;
    case 'zip':
      return <Archive className="h-6 w-6 text-yellow-500" />;
    case 'mp4':
      return <FileVideo className="h-6 w-6 text-indigo-500" />;
    default:
      return <FileText className="h-6 w-6 text-slate-500" />;
  }
};

export const getFileTypeColor = (type: string): string => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'docx':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'pptx':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'txt':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'csv':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'md':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'zip':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'mp4':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateFileColors = (index: number) => {
  const colors = [
    { color: 'from-red-400 to-pink-500', bgColor: 'bg-gradient-to-br from-red-50 to-pink-50', borderColor: 'border-red-200' },
    { color: 'from-blue-400 to-cyan-500', bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50', borderColor: 'border-blue-200' },
    { color: 'from-green-400 to-emerald-500', bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50', borderColor: 'border-green-200' },
    { color: 'from-purple-400 to-violet-500', bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50', borderColor: 'border-purple-200' },
    { color: 'from-orange-400 to-amber-500', bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50', borderColor: 'border-orange-200' },
    { color: 'from-indigo-400 to-blue-500', bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50', borderColor: 'border-indigo-200' },
    { color: 'from-pink-400 to-rose-500', bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50', borderColor: 'border-pink-200' },
    { color: 'from-teal-400 to-cyan-500', bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50', borderColor: 'border-teal-200' }
  ];
  return colors[index % colors.length];
};

export const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Research Paper - AI in Education.pdf',
    type: 'pdf',
    size: 2048576,
    uploadedAt: '2 hours ago',
    status: 'completed',
    isAIGenerated: true,
    tags: ['research', 'education', 'AI'],
    visibility: 'shared',
    ...generateFileColors(0)
  },
  {
    id: '2',
    name: 'Project Presentation.pptx',
    type: 'pptx',
    size: 15728640,
    uploadedAt: '1 day ago',
    status: 'completed',
    tags: ['presentation', 'project'],
    visibility: 'private',
    ...generateFileColors(1)
  },
  {
    id: '3',
    name: 'Data Analysis Report.docx',
    type: 'docx',
    size: 5242880,
    uploadedAt: '3 days ago',
    status: 'completed',
    isAIGenerated: true,
    tags: ['analysis', 'data', 'report'],
    visibility: 'public',
    ...generateFileColors(2)
  },
  {
    id: '4',
    name: 'Screenshot_2024.png',
    type: 'png',
    size: 1048576,
    uploadedAt: '1 week ago',
    status: 'completed',
    visibility: 'private',
    ...generateFileColors(3)
  },
  {
    id: '5',
    name: 'Meeting Notes.txt',
    type: 'txt',
    size: 51200,
    uploadedAt: '2 weeks ago',
    status: 'completed',
    tags: ['meeting', 'notes'],
    visibility: 'shared',
    ...generateFileColors(4)
  },
  {
    id: '6',
    name: 'Dataset.csv',
    type: 'csv',
    size: 2097152,
    uploadedAt: '1 month ago',
    status: 'completed',
    isAIGenerated: true,
    tags: ['dataset', 'csv'],
    visibility: 'public',
    ...generateFileColors(5)
  },
  {
    id: '7',
    name: 'Tutorial Video.mp4',
    type: 'mp4',
    size: 52428800,
    uploadedAt: '2 months ago',
    status: 'completed',
    tags: ['tutorial', 'video'],
    visibility: 'shared',
    ...generateFileColors(6)
  },
  {
    id: '8',
    name: 'Archive.zip',
    type: 'zip',
    size: 104857600,
    uploadedAt: '3 months ago',
    status: 'completed',
    visibility: 'private',
    ...generateFileColors(7)
  }
]; 