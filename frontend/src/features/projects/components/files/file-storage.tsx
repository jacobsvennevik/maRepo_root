"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  MoreVertical,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Clock,
  FileText,
  Image,
  Video,
  Archive,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  Plus,
  ArrowUp,
  ArrowRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  FolderOpen,
  HardDrive
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosApi } from "@/lib/axios-api";

// Import sub-components
import { FileStorageLoading } from './file-storage-loading';
import { FileStorageError } from './file-storage-error';
import { FileStorageEmpty } from './file-storage-empty';
import { RecentFileCard } from './recent-file-card';
import { FileTypeBreakdown } from './file-type-breakdown';
import { FileListView } from './file-list-view';
import { FileGridView } from './file-grid-view';
import { StorageUsageSidebar } from './storage-usage-sidebar';
import { FileDetailsPanel } from './file-details-panel';

// File types and interfaces
interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'png' | 'jpg' | 'jpeg' | 'csv' | 'md' | 'zip' | 'mp4' | 'mp3' | 'wav';
  size: number;
  uploadedAt: string;
  lastModified: string;
  status: 'uploading' | 'completed' | 'error' | 'processing';
  progress?: number;
  error?: string;
  isFavorite?: boolean;
  tags?: string[];
  visibility: 'private' | 'shared' | 'public';
  versionCount?: number;
  sharedWith?: string[];
  permissions?: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StorageStats {
  totalUsed: number;
  totalAvailable: number;
  breakdown: {
    documents: { count: number; size: number };
    images: { count: number; size: number };
    videos: { count: number; size: number };
    audio: { count: number; size: number };
    archives: { count: number; size: number };
  };
}

type ViewMode = 'list' | 'grid';
type SortOption = 'name' | 'size' | 'date' | 'type';
type FilterOption = 'all' | 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'favorites';

// Utility functions
export const getFileIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'pptx':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'txt':
    case 'md':
      return <FileText className="h-5 w-5 text-slate-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-5 w-5 text-green-500" />;
    case 'csv':
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    case 'zip':
      return <Archive className="h-5 w-5 text-yellow-500" />;
    case 'mp4':
      return <FileVideo className="h-5 w-5 text-indigo-500" />;
    case 'mp3':
    case 'wav':
      return <FileAudio className="h-5 w-5 text-purple-500" />;
    default:
      return <FileText className="h-5 w-5 text-slate-500" />;
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
    case 'md':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'png':
    case 'jpg':
    case 'jpeg':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'csv':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'zip':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'mp4':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'mp3':
    case 'wav':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
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

// Main File Storage Component
export default function FileStorage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // State management
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Storage stats
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalUsed: 104.6 * 1024 * 1024 * 1024, // 104.6 GB
    totalAvailable: 256 * 1024 * 1024 * 1024, // 256 GB
    breakdown: {
      documents: { count: 42, size: 112.8 * 1024 * 1024 },
      images: { count: 75, size: 286.8 * 1024 * 1024 },
      videos: { count: 32, size: 1639.2 * 1024 * 1024 },
      audio: { count: 20, size: 23.6 * 1024 * 1024 },
      archives: { count: 14, size: 213.3 * 1024 * 1024 },
    }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files from backend
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosApi.get(`projects/${projectId}/`);
      const project = response.data;
      
      // Transform backend files to frontend format
      const transformedFiles: FileItem[] = project.uploaded_files.map((file: any, index: number) => ({
        id: file.id,
        name: file.original_name || file.file.split('/').pop(),
        type: file.file.split('.').pop().toLowerCase() as FileItem['type'],
        size: file.file_size || 0,
        uploadedAt: formatDate(file.uploaded_at),
        lastModified: formatDate(file.uploaded_at),
        status: file.processing_status === 'completed' ? 'completed' : 
                file.processing_status === 'failed' ? 'error' : 'processing',
        isFavorite: false, // TODO: Add favorite functionality
        tags: [], // TODO: Add tags functionality
        visibility: 'private' as const,
        versionCount: 1, // TODO: Add version tracking
        sharedWith: [], // TODO: Add sharing functionality
        permissions: ['read'], // TODO: Add permissions
        ...generateFileColors(index)
      }));
      
      setFiles(transformedFiles);
    } catch (err: any) {
      console.error('Failed to fetch files:', err);
      setError(err.response?.data?.detail || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await axiosApi.post(
        `/projects/${projectId}/upload_file/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Refresh files
      await fetchFiles();
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [projectId, fetchFiles]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // Filter and sort files
  useEffect(() => {
    let filtered = [...files];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(file => {
        switch (filterBy) {
          case 'documents':
            return ['pdf', 'docx', 'pptx', 'txt', 'md'].includes(file.type);
          case 'images':
            return ['png', 'jpg', 'jpeg'].includes(file.type);
          case 'videos':
            return ['mp4'].includes(file.type);
          case 'audio':
            return ['mp3', 'wav'].includes(file.type);
          case 'archives':
            return ['zip'].includes(file.type);
          case 'favorites':
            return file.isFavorite;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredFiles(filtered);
  }, [files, searchQuery, filterBy, sortBy]);

  // Load files on mount
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // File actions
  const handleToggleFavorite = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file
    ));
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleFileAction = (action: string, fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    switch (action) {
      case 'preview':
        setSelectedFile(file);
        setShowDetails(true);
        break;
      case 'download':
        // TODO: Implement download
        console.log('Download file:', file.name);
        break;
      case 'share':
        // TODO: Implement sharing
        console.log('Share file:', file.name);
        break;
      case 'rename':
        // TODO: Implement rename
        console.log('Rename file:', file.name);
        break;
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedFileIds = Array.from(selectedFiles);
    console.log(`Bulk ${action}:`, selectedFileIds);
    // TODO: Implement bulk actions
  };

  // Render loading state
  if (loading) {
    return <FileStorageLoading />;
  }

  // Render error state
  if (error) {
    return <FileStorageError error={error} onRetry={fetchFiles} />;
  }

  // Render empty state
  if (files.length === 0) {
    return <FileStorageEmpty onUpload={() => fileInputRef.current?.click()} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All files</h1>
              <p className="text-sm text-gray-500 mt-1">All of your files are displayed here</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ocean" 
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="font-semibold"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload file
              </Button>
              <Button variant="outline" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Recently Modified Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently modified</h2>
              <Button variant="ghost" size="sm" className="text-ocean-600 hover:text-ocean-700">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.slice(0, 3).map((file) => (
                <RecentFileCard key={file.id} file={file} />
              ))}
            </div>
          </div>

          {/* All Files Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All files</h2>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Filter */}
                <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All files</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="archives">Archives</SelectItem>
                    <SelectItem value="favorites">Favorites</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none border-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File Type Breakdown */}
            <div className="mb-6">
              <FileTypeBreakdown files={filteredFiles} />
            </div>

            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
              <div className="mb-4 p-3 bg-ocean-50 border border-ocean-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ocean-700">
                    {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('favorite')}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Favorite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('download')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Files Display */}
            {viewMode === 'list' ? (
              <FileListView 
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onSelectFile={handleSelectFile}
                onSelectAll={handleSelectAll}
                onToggleFavorite={handleToggleFavorite}
                onFileAction={handleFileAction}
              />
            ) : (
              <FileGridView 
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onSelectFile={handleSelectFile}
                onToggleFavorite={handleToggleFavorite}
                onFileAction={handleFileAction}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
          <StorageUsageSidebar stats={storageStats} />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.csv,.md,.zip,.mp4,.mp3,.wav"
      />

      {/* Floating Upload Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          variant="ocean"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full shadow-lg h-14 w-14 p-0"
        >
          <Upload className="h-6 w-6" />
        </Button>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* File Details Side Panel */}
      {showDetails && selectedFile && (
        <FileDetailsPanel 
          file={selectedFile}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}