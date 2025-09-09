// Custom hook for file storage state management
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { axiosApi } from '@/lib/axios-api';
import { FileItem, StorageStats, formatDate, generateFileColors } from '@/lib/file-utils';

export type ViewMode = 'list' | 'grid';
export type SortOption = 'name' | 'size' | 'date' | 'type';
export type FilterOption = 'all' | 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'favorites';

interface UseFileStorageReturn {
  // State
  files: FileItem[];
  filteredFiles: FileItem[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadError: string | null;
  viewMode: ViewMode;
  sortBy: SortOption;
  filterBy: FilterOption;
  searchQuery: string;
  selectedFiles: Set<string>;
  showDetails: boolean;
  selectedFile: FileItem | null;
  storageStats: StorageStats;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterBy: (filter: FilterOption) => void;
  setSearchQuery: (query: string) => void;
  setShowDetails: (show: boolean) => void;
  setSelectedFile: (file: FileItem | null) => void;
  
  // File operations
  fetchFiles: () => Promise<void>;
  handleFileUpload: (files: FileList) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleFavorite: (fileId: string) => void;
  handleSelectFile: (fileId: string) => void;
  handleSelectAll: () => void;
  handleFileAction: (action: string, fileId: string) => void;
  handleBulkAction: (action: string) => void;
  
  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function useFileStorage(): UseFileStorageReturn {
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
      const response = await axiosApi.get(`/projects/${projectId}/`);
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

  return {
    // State
    files,
    filteredFiles,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadError,
    viewMode,
    sortBy,
    filterBy,
    searchQuery,
    selectedFiles,
    showDetails,
    selectedFile,
    storageStats,
    
    // Actions
    setViewMode,
    setSortBy,
    setFilterBy,
    setSearchQuery,
    setShowDetails,
    setSelectedFile,
    
    // File operations
    fetchFiles,
    handleFileUpload,
    handleFileSelect,
    handleToggleFavorite,
    handleSelectFile,
    handleSelectAll,
    handleFileAction,
    handleBulkAction,
    
    // Refs
    fileInputRef,
  };
}

