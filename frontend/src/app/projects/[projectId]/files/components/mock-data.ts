// Mock data for File Storage component demonstration
import { FileItem, StorageStats } from './file-storage';

// Mock files data
export const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Campaign Analysis - Q3.docx',
    type: 'docx',
    size: 2048576, // 2MB
    uploadedAt: '2 hours ago',
    lastModified: '2 hours ago',
    status: 'completed',
    isFavorite: true,
    tags: ['marketing', 'analysis', 'Q3'],
    visibility: 'shared',
    versionCount: 3,
    sharedWith: ['john.doe@company.com', 'jane.smith@company.com'],
    permissions: ['read', 'comment'],
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200'
  },
  {
    id: '2',
    name: 'Product Screenshot.png',
    type: 'png',
    size: 1048576, // 1MB
    uploadedAt: '1 day ago',
    lastModified: '1 day ago',
    status: 'completed',
    isFavorite: false,
    tags: ['product', 'screenshot'],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200'
  },
  {
    id: '3',
    name: 'Meeting Notes - Team Sync.txt',
    type: 'txt',
    size: 51200, // 50KB
    uploadedAt: '3 days ago',
    lastModified: '3 days ago',
    status: 'completed',
    isFavorite: false,
    tags: ['meeting', 'notes', 'team'],
    visibility: 'shared',
    versionCount: 2,
    sharedWith: ['team@company.com'],
    permissions: ['read', 'edit'],
    color: 'from-slate-400 to-gray-500',
    bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
    borderColor: 'border-slate-200'
  },
  {
    id: '4',
    name: 'Data Export - Users.csv',
    type: 'csv',
    size: 2097152, // 2MB
    uploadedAt: '1 week ago',
    lastModified: '1 week ago',
    status: 'completed',
    isFavorite: true,
    tags: ['data', 'export', 'users'],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: '5',
    name: 'Presentation - Q4 Planning.pptx',
    type: 'pptx',
    size: 15728640, // 15MB
    uploadedAt: '2 weeks ago',
    lastModified: '2 weeks ago',
    status: 'completed',
    isFavorite: false,
    tags: ['presentation', 'planning', 'Q4'],
    visibility: 'public',
    versionCount: 5,
    sharedWith: ['executives@company.com'],
    permissions: ['read'],
    color: 'from-orange-400 to-amber-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    borderColor: 'border-orange-200'
  },
  {
    id: '6',
    name: 'Tutorial Video.mp4',
    type: 'mp4',
    size: 52428800, // 50MB
    uploadedAt: '1 month ago',
    lastModified: '1 month ago',
    status: 'completed',
    isFavorite: true,
    tags: ['tutorial', 'video', 'training'],
    visibility: 'shared',
    versionCount: 2,
    sharedWith: ['training@company.com'],
    permissions: ['read'],
    color: 'from-indigo-400 to-blue-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    borderColor: 'border-indigo-200'
  },
  {
    id: '7',
    name: 'Archive - Old Projects.zip',
    type: 'zip',
    size: 104857600, // 100MB
    uploadedAt: '2 months ago',
    lastModified: '2 months ago',
    status: 'completed',
    isFavorite: false,
    tags: ['archive', 'projects'],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200'
  },
  {
    id: '8',
    name: 'Audio Recording - Interview.mp3',
    type: 'mp3',
    size: 25165824, // 24MB
    uploadedAt: '3 months ago',
    lastModified: '3 months ago',
    status: 'completed',
    isFavorite: false,
    tags: ['audio', 'interview', 'recording'],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    borderColor: 'border-purple-200'
  }
];

// Mock storage stats
export const mockStorageStats: StorageStats = {
  totalUsed: 104.6 * 1024 * 1024 * 1024, // 104.6 GB
  totalAvailable: 256 * 1024 * 1024 * 1024, // 256 GB
  breakdown: {
    documents: { count: 42, size: 112.8 * 1024 * 1024 }, // 112.8 MB
    images: { count: 75, size: 286.8 * 1024 * 1024 }, // 286.8 MB
    videos: { count: 32, size: 1639.2 * 1024 * 1024 }, // 1.6 GB
    audio: { count: 20, size: 23.6 * 1024 * 1024 }, // 23.6 MB
    archives: { count: 14, size: 213.3 * 1024 * 1024 }, // 213.3 MB
  }
};

// Mock files for different states
export const mockFilesWithUploading: FileItem[] = [
  ...mockFiles,
  {
    id: '9',
    name: 'Large Document.pdf',
    type: 'pdf',
    size: 52428800, // 50MB
    uploadedAt: 'Now',
    lastModified: 'Now',
    status: 'uploading',
    progress: 65,
    isFavorite: false,
    tags: [],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
    borderColor: 'border-red-200'
  }
];

export const mockFilesWithError: FileItem[] = [
  ...mockFiles,
  {
    id: '10',
    name: 'Corrupted File.docx',
    type: 'docx',
    size: 0,
    uploadedAt: '5 minutes ago',
    lastModified: '5 minutes ago',
    status: 'error',
    error: 'File processing failed - corrupted content',
    isFavorite: false,
    tags: [],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
    borderColor: 'border-red-200'
  }
];

// Empty files array for empty state
export const mockEmptyFiles: FileItem[] = [];

// Mock files with processing status
export const mockFilesWithProcessing: FileItem[] = [
  ...mockFiles.slice(0, 3),
  {
    id: '11',
    name: 'Processing Document.pdf',
    type: 'pdf',
    size: 10485760, // 10MB
    uploadedAt: '5 minutes ago',
    lastModified: '5 minutes ago',
    status: 'processing',
    isFavorite: false,
    tags: [],
    visibility: 'private',
    versionCount: 1,
    sharedWith: [],
    permissions: ['read'],
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200'
  }
];
