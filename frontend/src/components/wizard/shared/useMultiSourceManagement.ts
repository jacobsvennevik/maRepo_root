/**
 * Enhanced Multi-Source Management Hook
 * 
 * Handles flashcards, files, and study materials selection
 * for wizard components. Extends the existing useFileManagement
 * pattern to support multiple source types.
 */

import { useState, useEffect, useCallback } from 'react';
import axiosInstance, { axiosApi } from '@/lib/axios';
import { normalizeProjectId } from '@/lib/projectId';
import { getProjectScoped } from '@/lib/projectApi';
import { isTestMode } from '@/features/projects/services/upload-utils';

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

const DEFAULT_SUPPORTED_TYPES: Array<'flashcards' | 'files' | 'studyMaterials'> = ['flashcards', 'files', 'studyMaterials']

// ============================================================================
// Hook Implementation
// ============================================================================

export const useMultiSourceManagement = ({
  projectId,
  supportedTypes = DEFAULT_SUPPORTED_TYPES,
  onSourcesChange,
  autoLoad = true,
}: UseMultiSourceManagementOptions): UseMultiSourceManagementReturn => {
  const [flashcards, setFlashcards] = useState<SourceItem[]>([]);
  const [files, setFiles] = useState<SourceItem[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<SourceItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingStudyMaterials, setIsLoadingStudyMaterials] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedSources, setSelectedSourcesState] = useState<SelectedSources>(DEFAULT_SELECTED_SOURCES);
  const [searchTerm, setSearchTerm] = useState('');

  const loadFlashcards = useCallback(async () => {
    if (!supportedTypes.includes('flashcards')) return;
    if (isLoadingFlashcards) return;
    setIsLoadingFlashcards(true);
    try {
      const response: any = await getProjectScoped(`flashcard-sets/`, projectId);
      const raw = response?.data ?? response ?? []
      const flashcardData = (Array.isArray(raw) ? raw : raw?.results || []).map((deck: any) => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        flashcard_count: deck.flashcard_count || 0,
        created_at: deck.created_at,
        updated_at: deck.updated_at,
        type: 'flashcard' as const,
      }));
      setFlashcards(flashcardData);
    } catch (error: any) {
      console.error('Failed to load flashcards:', error);
      if (isTestMode() && (error?.code === 'ERR_NETWORK' || !error?.response)) {
        setFlashcards([]);
      } else {
        setFlashcards([]);
      }
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [projectId, supportedTypes, isLoadingFlashcards]);
  
  const loadFiles = useCallback(async () => {
    if (!supportedTypes.includes('files')) return;
    if (isLoadingFiles) return;
    setIsLoadingFiles(true);
    try {
      // Project detail includes uploaded_files
      const res = await (axiosApi as any).get(`projects/${projectId}/`);
      const project = res?.data || {};
      const uploaded = Array.isArray(project.uploaded_files) ? project.uploaded_files : [];
      const fileData = uploaded.map((file: any) => ({
        id: file.id,
        name: file.original_name || (file.file ? String(file.file).split('/').pop() : ''),
        description: '',
        size: file.file_size,
        file_type: file.content_type,
        created_at: file.uploaded_at,
        type: 'file' as const,
      }));
      setFiles(fileData);
    } catch (error: any) {
      console.error('Failed to load files:', error);
      if (isTestMode() && (error?.code === 'ERR_NETWORK' || !error?.response)) {
        setFiles([]);
      } else {
        setFiles([]);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectId, supportedTypes, isLoadingFiles]);
  
  const loadStudyMaterials = useCallback(async () => {
    if (!supportedTypes.includes('studyMaterials')) return;
    if (isLoadingStudyMaterials) return;
    setIsLoadingStudyMaterials(true);
    try {
      // Study materials live under non-API prefix
      const pid = normalizeProjectId(projectId);
      const res = await (axiosInstance as any).get(`/study_materials/study_materials/`, {
        params: { project: pid }
      });
      const raw = res?.data ?? [];
      const list = Array.isArray(raw) ? raw : raw?.results || [];
      // Filter by project if backend ignores query param
      const filtered = list.filter((m: any) => !m.project || String(m.project) === String(pid));
      const materialData = filtered.map((material: any) => ({
        id: material.id,
        title: material.title,
        name: material.title,
        description: material.description,
        created_at: material.created_at,
        updated_at: material.updated_at,
        type: 'study_material' as const,
      }));
      setStudyMaterials(materialData);
    } catch (error: any) {
      console.error('Failed to load study materials:', error);
      if (isTestMode() && (error?.code === 'ERR_NETWORK' || !error?.response)) {
        setStudyMaterials([]);
      } else {
        setStudyMaterials([]);
      }
    } finally {
      setIsLoadingStudyMaterials(false);
    }
  }, [projectId, supportedTypes, isLoadingStudyMaterials]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await (axiosApi as any).post(`projects/${projectId}/upload_file/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.status === 200 || response.status === 201) {
          console.log('✅ File uploaded successfully:', file.name);
        }
      }
      setTimeout(() => { loadFiles(); }, 1000);
    } catch (error) {
      console.error('❌ File upload failed:', error);
    }
  }, [projectId, loadFiles]);

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const setSelectedSources = useCallback((sources: SelectedSources) => {
    setSelectedSourcesState(sources);
    onSourcesChange?.(sources);
  }, [onSourcesChange]);

  const clearSelection = useCallback(() => {
    setSelectedSources(DEFAULT_SELECTED_SOURCES);
    setUploadedFiles([]);
    setSearchTerm('');
  }, [setSelectedSources]);

  const refreshSources = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadFlashcards(),
        loadFiles(),
        loadStudyMaterials(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadFlashcards, loadFiles, loadStudyMaterials]);

  useEffect(() => {
    if (autoLoad && projectId) {
      refreshSources();
    }
  }, [autoLoad, projectId, refreshSources]);

  const totalSelectedCount = 
    selectedSources.flashcards.ids.length +
    selectedSources.files.ids.length +
    selectedSources.studyMaterials.ids.length +
    uploadedFiles.length;
  
  const hasMinimumSelection = totalSelectedCount >= 1;
  const isAnyLoading = isLoadingFlashcards || isLoadingFiles || isLoadingStudyMaterials;
  
  return {
    flashcards,
    files,
    studyMaterials,
    uploadedFiles,
    isLoadingFlashcards,
    isLoadingFiles,
    isLoadingStudyMaterials,
    selectedSources,
    searchTerm,
    setSelectedSources,
    setSearchTerm,
    handleFileUpload,
    removeUploadedFile,
    refreshSources,
    clearSelection,
    totalSelectedCount,
    hasMinimumSelection,
    isAnyLoading,
  };
};

export default useMultiSourceManagement;
