/**
 * Enhanced Multi-Source Management Hook
 * 
 * Handles flashcards, files, and study materials selection
 * for wizard components. Extends the existing useFileManagement
 * pattern to support multiple source types.
 */

import { useState, useEffect, useCallback } from 'react';
import { axiosApi } from '@/lib/axios-api';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SourceItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  file_type?: string;
  flashcard_count?: number;
  type: 'flashcard' | 'file' | 'study_material';
}

export interface SelectedSources {
  flashcards: { ids: string[]; groundOnly: boolean };
  files: { ids: string[]; groundOnly: boolean };
  studyMaterials: { ids: string[]; groundOnly: boolean };
}

interface UseMultiSourceManagementOptions {
  projectId: string;
  supportedTypes?: Array<'flashcards' | 'files' | 'studyMaterials'>;
  onSourcesChange?: (sources: SelectedSources) => void;
  autoLoad?: boolean;
}

interface UseMultiSourceManagementReturn {
  // Source data
  flashcards: SourceItem[];
  files: SourceItem[];
  studyMaterials: SourceItem[];
  
  // Upload handling
  uploadedFiles: File[];
  
  // Loading states
  isLoadingFlashcards: boolean;
  isLoadingFiles: boolean;
  isLoadingStudyMaterials: boolean;
  
  // Selection state
  selectedSources: SelectedSources;
  
  // Search
  searchTerm: string;
  
  // Actions
  setSelectedSources: (sources: SelectedSources) => void;
  setSearchTerm: (term: string) => void;
  handleFileUpload: (files: File[]) => Promise<void>;
  removeUploadedFile: (index: number) => void;
  refreshSources: () => Promise<void>;
  clearSelection: () => void;
  
  // Computed values
  totalSelectedCount: number;
  hasMinimumSelection: boolean;
  isAnyLoading: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SELECTED_SOURCES: SelectedSources = {
  flashcards: { ids: [], groundOnly: false },
  files: { ids: [], groundOnly: false },
  studyMaterials: { ids: [], groundOnly: false },
};

// ============================================================================
// Hook Implementation
// ============================================================================

export const useMultiSourceManagement = ({
  projectId,
  supportedTypes = ['flashcards', 'files', 'studyMaterials'],
  onSourcesChange,
  autoLoad = true,
}: UseMultiSourceManagementOptions): UseMultiSourceManagementReturn => {
  
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [flashcards, setFlashcards] = useState<SourceItem[]>([]);
  const [files, setFiles] = useState<SourceItem[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<SourceItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingStudyMaterials, setIsLoadingStudyMaterials] = useState(false);
  
  const [selectedSources, setSelectedSourcesState] = useState<SelectedSources>(DEFAULT_SELECTED_SOURCES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ============================================================================
  // API Functions
  // ============================================================================
  
  const loadFlashcards = useCallback(async () => {
    if (!supportedTypes.includes('flashcards')) return;
    
    setIsLoadingFlashcards(true);
    try {
      const response = await axiosApi.get(`projects/${projectId}/flashcard-decks/`);
      const flashcardData = response.data.map((deck: any) => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        flashcard_count: deck.flashcard_count || 0,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        type: 'flashcard' as const,
      }));
      setFlashcards(flashcardData);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      setFlashcards([]);
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [projectId, supportedTypes]);
  
  const loadFiles = useCallback(async () => {
    if (!supportedTypes.includes('files')) return;
    
    setIsLoadingFiles(true);
    try {
      const response = await axiosApi.get(`projects/${projectId}/files/`);
      const fileData = response.data.map((file: any) => ({
        id: file.id,
        name: file.name,
        description: file.description,
        size: file.file_size,
        file_type: file.file_type,
        created_at: file.created_at || file.uploaded_at,
        type: 'file' as const,
      }));
      setFiles(fileData);
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectId, supportedTypes]);
  
  const loadStudyMaterials = useCallback(async () => {
    if (!supportedTypes.includes('studyMaterials')) return;
    
    setIsLoadingStudyMaterials(true);
    try {
      const response = await axiosApi.get(`projects/${projectId}/study-materials/`);
      const materialData = response.data.map((material: any) => ({
        id: material.id,
        title: material.title,
        name: material.name,
        description: material.description,
        created_at: material.created_at,
        updated_at: material.updated_at,
        type: 'study_material' as const,
      }));
      setStudyMaterials(materialData);
    } catch (error) {
      console.error('Failed to load study materials:', error);
      setStudyMaterials([]);
    } finally {
      setIsLoadingStudyMaterials(false);
    }
  }, [projectId, supportedTypes]);
  
  // ============================================================================
  // File Upload Handling
  // ============================================================================
  
  const handleFileUpload = useCallback(async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosApi.post(`projects/${projectId}/upload_file/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (response.status === 200 || response.status === 201) {
          console.log('✅ File uploaded successfully:', file.name);
        }
      }
      
      // Refresh files after upload
      setTimeout(() => {
        loadFiles();
      }, 1000);
      
    } catch (error) {
      console.error('❌ File upload failed:', error);
    }
  }, [projectId, loadFiles]);
  
  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // ============================================================================
  // Selection Management
  // ============================================================================
  
  const setSelectedSources = useCallback((sources: SelectedSources) => {
    setSelectedSourcesState(sources);
    onSourcesChange?.(sources);
  }, [onSourcesChange]);
  
  const clearSelection = useCallback(() => {
    setSelectedSources(DEFAULT_SELECTED_SOURCES);
    setUploadedFiles([]);
    setSearchTerm('');
  }, [setSelectedSources]);
  
  // ============================================================================
  // Data Loading
  // ============================================================================
  
  const refreshSources = useCallback(async () => {
    await Promise.all([
      loadFlashcards(),
      loadFiles(),
      loadStudyMaterials(),
    ]);
  }, [loadFlashcards, loadFiles, loadStudyMaterials]);
  
  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && projectId) {
      refreshSources();
    }
  }, [autoLoad, projectId, refreshSources]);
  
  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const totalSelectedCount = 
    selectedSources.flashcards.ids.length +
    selectedSources.files.ids.length +
    selectedSources.studyMaterials.ids.length +
    uploadedFiles.length;
  
  const hasMinimumSelection = totalSelectedCount >= 1;
  
  const isAnyLoading = isLoadingFlashcards || isLoadingFiles || isLoadingStudyMaterials;
  
  // ============================================================================
  // Return Interface
  // ============================================================================
  
  return {
    // Source data
    flashcards,
    files,
    studyMaterials,
    uploadedFiles,
    
    // Loading states
    isLoadingFlashcards,
    isLoadingFiles,
    isLoadingStudyMaterials,
    
    // Selection state
    selectedSources,
    searchTerm,
    
    // Actions
    setSelectedSources,
    setSearchTerm,
    handleFileUpload,
    removeUploadedFile,
    refreshSources,
    clearSelection,
    
    // Computed values
    totalSelectedCount,
    hasMinimumSelection,
    isAnyLoading,
  };
};

export default useMultiSourceManagement;
