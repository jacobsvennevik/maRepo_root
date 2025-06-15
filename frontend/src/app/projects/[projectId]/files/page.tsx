'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useCallback, useRef } from 'react';
import { 
  ChevronRight, 
  Search,
  Filter,
  Layout,
  Grid3X3,
  List,
  Upload
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutSelector, type LayoutOption } from "@/components/ui/layout-selector";
import {
  FileCard,
  FileGridItem,
  FileListItem,
  DragDropZone,
  FileStatsCards,
  FileHeader,
  getFileIcon,
  getFileTypeColor,
  formatFileSize,
  type FileItem
} from './components';

type LayoutMode = 'cards' | 'list' | 'grid';

export default function ProjectFiles() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout options for the selector
  const layoutOptions: LayoutOption[] = [
    {
      id: 'ocean',
      name: 'Ocean Layout',
      color: '#3b82f6',
      description: 'Floating animations & gradients'
    },
    {
      id: 'workspace',
      name: 'Workspace Layout',
      color: '#6b7280',
      description: 'Clean & professional'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Layout',
      color: '#8b5cf6',
      description: 'Modern dashboard style'
    }
  ];

  // Mock data for demonstration
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Biology Notes.pdf',
      type: 'pdf',
      size: 2.4 * 1024 * 1024, // 2.4 MB
      uploadedAt: '2 days ago',
      status: 'completed',
      isAIGenerated: true,
      tags: ['Biology', 'Notes', 'Chapter 1'],
      source: 'Manual Upload',
      visibility: 'shared',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50/80 backdrop-blur-sm',
      borderColor: 'border-blue-200/50'
    },
    {
      id: '2',
      name: 'Cell Structure.png',
      type: 'png',
      size: 1.8 * 1024 * 1024, // 1.8 MB
      uploadedAt: '5 days ago',
      status: 'completed',
      tags: ['Biology', 'Images', 'Cell Biology'],
      source: 'Manual Upload',
      visibility: 'private',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50/80 backdrop-blur-sm',
      borderColor: 'border-green-200/50'
    },
    {
      id: '3',
      name: 'Chemistry Lab.mp4',
      type: 'mp4',
      size: 45.2 * 1024 * 1024, // 45.2 MB
      uploadedAt: '1 day ago',
      status: 'completed',
      tags: ['Chemistry', 'Video', 'Lab'],
      source: 'Manual Upload',
      visibility: 'public',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50/80 backdrop-blur-sm',
      borderColor: 'border-purple-200/50'
    },
    {
      id: '4',
      name: 'Periodic Table Data.csv',
      type: 'csv',
      size: 0.5 * 1024 * 1024, // 0.5 MB
      uploadedAt: '3 days ago',
      status: 'completed',
      isAIGenerated: true,
      tags: ['Chemistry', 'Data', 'Periodic Table'],
      source: 'AI Generated',
      visibility: 'shared',
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50/80 backdrop-blur-sm',
      borderColor: 'border-orange-200/50'
    }
  ]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileUpload = useCallback((files: File[]) => {
    files.forEach((file, index) => {
      const fileItem: FileItem = {
        id: `upload-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop() as any,
        size: file.size,
        uploadedAt: 'Just now',
        status: 'uploading',
        progress: 0,
        source: 'Manual Upload',
        visibility: 'private',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50/80 backdrop-blur-sm',
        borderColor: 'border-blue-200/50'
      };

      setUploadingFiles(prev => [...prev, fileItem]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress: Math.min((f.progress || 0) + 10, 100) }
              : f
          )
        );
      }, 200);

      // Complete upload after 2 seconds
      setTimeout(() => {
        clearInterval(interval);
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        );
      }, 2000);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFileUpload(selectedFiles);
  }, [handleFileUpload]);

  const handleGenerateFlashcards = (fileId: string) => {
    console.log('Generating flashcards for file:', fileId);
    // TODO: Implement AI flashcard generation
  };

  const handleGenerateNotes = (fileId: string) => {
    console.log('Generating notes for file:', fileId);
    // TODO: Implement AI notes generation
  };

  const handleShareFile = (fileId: string) => {
    console.log('Sharing file:', fileId);
    // TODO: Implement file sharing
  };

  const handleDeleteFile = (fileId: string) => {
    console.log('Deleting file:', fileId);
    // TODO: Implement file deletion
  };

  const handleRenameFile = (fileId: string) => {
    console.log('Renaming file:', fileId);
    // TODO: Implement file renaming
  };

  const allFiles = [...files, ...uploadingFiles];
  const filteredFiles = allFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalFiles: allFiles.length,
    totalSize: allFiles.reduce((acc, file) => acc + file.size, 0),
    aiGenerated: allFiles.filter(f => f.isAIGenerated).length,
    lastUpload: allFiles.length > 0 ? allFiles[0].uploadedAt : 'Never'
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative space-y-8 p-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-900">Files</span>
        </div>

        {/* File Header */}
        <FileHeader
          title="File Manager"
          description="Upload, organize, and enhance your learning materials"
          stats={stats}
          formatFileSize={formatFileSize}
        />

        {/* File Stats Cards */}
        <FileStatsCards
          stats={{
            totalFiles: stats.totalFiles,
            totalSize: stats.totalSize,
            aiGenerated: stats.aiGenerated,
            lastUpload: stats.lastUpload
          }}
          formatFileSize={formatFileSize}
        />

        {/* Drag & Drop Zone */}
        <DragDropZone
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onBrowseClick={() => fileInputRef.current?.click()}
        />

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          {/* Layout Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">View:</span>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-md border-2 border-gray-200">
              <Button
                variant={layoutMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode('cards')}
                className="h-8 w-8 p-0 hover:bg-blue-50"
                title="Cards View"
              >
                <Layout className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode('grid')}
                className="h-8 w-8 p-0 hover:bg-blue-50"
                title="Grid View"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutMode('list')}
                className="h-8 w-8 p-0 hover:bg-blue-50"
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Files Display */}
        {layoutMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                getFileIcon={getFileIcon}
                getFileTypeColor={getFileTypeColor}
                formatFileSize={formatFileSize}
                onGenerateFlashcards={handleGenerateFlashcards}
                onGenerateNotes={handleGenerateNotes}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
                onRename={handleRenameFile}
              />
            ))}
          </div>
        )}

        {layoutMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <FileGridItem
                key={file.id}
                file={file}
                getFileIcon={getFileIcon}
                getFileTypeColor={getFileTypeColor}
                onShare={handleShareFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}

        {layoutMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    getFileIcon={getFileIcon}
                    getFileTypeColor={getFileTypeColor}
                    formatFileSize={formatFileSize}
                    onGenerateFlashcards={handleGenerateFlashcards}
                    onGenerateNotes={handleGenerateNotes}
                    onShare={handleShareFile}
                    onDelete={handleDeleteFile}
                    onRename={handleRenameFile}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Upload className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No files found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
            </p>
            {!searchTerm && (
              <Button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Layout Selector */}
      <LayoutSelector
        layouts={layoutOptions}
        currentLayout="ocean"
        onLayoutChange={(layoutId) => {
          console.log('Layout changed to:', layoutId);
          // For now, we only have the ocean layout implemented
          // You can add the other layouts back if needed
        }}
        position="bottom-right"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.csv,.md,.zip,.mp4"
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 