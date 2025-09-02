'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, Upload, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosApi } from "@/lib/axios-api";

interface ProjectFile {
  id: string;
  file: string;
  uploaded_at: string;
  content_hash: string;
  raw_text: string;
  file_size: number;
  original_name: string;
  content_type: string;
  processing_status: string;
}

interface Project {
  id: string;
  name: string;
  uploaded_files: ProjectFile[];
}

export default function ProjectFiles() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch project files
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Reads via proxy client to avoid CORS/redirects (uploads stay direct)
      const response = await axiosApi.get(`/projects/${projectId}/`);
      setProject(response.data);
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err.response?.data?.detail || 'Failed to load project files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0]; // Handle single file for now
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we can't get real upload progress from Django)
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

      // Refresh the project to get the new file
      await fetchProject();
      
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
  }, [projectId, fetchProject]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Get file extension and name
  const getFileInfo = (filePath: string) => {
    const fileName = filePath.split('/').pop() || 'Unknown file';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return { fileName, extension };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading project files...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProject} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const files = project?.uploaded_files || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-900">Files</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
              <p className="text-gray-600">
                {project?.name} • {files.length} file{files.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.csv,.md,.zip,.mp4"
            disabled={uploading}
          />
        </div>

        {/* Files List */}
        {files.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Files</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {files.map((file) => {
                  const { fileName, extension } = getFileInfo(file.original_name || file.file);
                  return (
                    <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 uppercase">
                            {extension}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{fileName}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {formatDate(file.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.file, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
              <p className="text-gray-600 mb-4">
                Upload your first file to get started with your project.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={fetchProject}
            disabled={loading}
            className="text-gray-600 hover:text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}