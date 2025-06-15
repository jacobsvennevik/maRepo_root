import { 
  File, 
  FileText, 
  Image, 
  FileArchive, 
  FileVideo 
} from 'lucide-react';

export function getFileIcon(type: string) {
  switch (type) {
    case 'pdf': return <FileText className="w-5 h-5" />;
    case 'docx': return <FileText className="w-5 h-5" />;
    case 'pptx': return <FileText className="w-5 h-5" />;
    case 'txt': return <FileText className="w-5 h-5" />;
    case 'png':
    case 'jpg':
    case 'jpeg': return <Image className="w-5 h-5" />;
    case 'csv': return <FileText className="w-5 h-5" />;
    case 'md': return <FileText className="w-5 h-5" />;
    case 'zip': return <FileArchive className="w-5 h-5" />;
    case 'mp4': return <FileVideo className="w-5 h-5" />;
    default: return <File className="w-5 h-5" />;
  }
}

export function getFileTypeColor(type: string) {
  switch (type) {
    case 'pdf': return 'bg-red-100 text-red-800 border-red-200';
    case 'docx':
    case 'pptx': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'txt': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'png':
    case 'jpg':
    case 'jpeg': return 'bg-green-100 text-green-800 border-green-200';
    case 'csv': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'md': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'zip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'mp4': return 'bg-pink-100 text-pink-800 border-pink-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 