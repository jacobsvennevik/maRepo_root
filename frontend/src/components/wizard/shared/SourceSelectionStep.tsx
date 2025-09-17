/**
 * Shared Source Selection Step Component
 * 
 * Reusable component for selecting sources across different wizards
 * (quiz, flashcard, diagnostic creation). Supports multiple source types
 * including flashcards, files, and study materials.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain,
  Upload,
  ListChecks,
  Loader2,
  Search,
  X,
  File,
  CheckCircle2,
  BookOpen,
  FileText,
  AlertTriangle,
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SourceConfig {
  enabled: boolean;
  count: number;
  items?: any[];
  loading?: boolean;
}

export interface SourceSelectionConfig {
  flashcards?: SourceConfig;
  files?: SourceConfig;
  studyMaterials?: SourceConfig;
}

export interface SelectedSources {
  flashcards: { ids: string[]; groundOnly: boolean };
  files: { ids: string[]; groundOnly: boolean };
  studyMaterials: { ids: string[]; groundOnly: boolean };
}

interface SourceSelectionStepProps {
  sources: SourceSelectionConfig;
  selectedSources: SelectedSources;
  onSourcesChange: (sources: SelectedSources) => void;
  multiSelect?: boolean;
  showGroundOnlyOption?: boolean;
  minSources?: number;
  onFileUpload?: (files: File[]) => void;
  uploadedFiles?: File[];
  onRemoveUploadedFile?: (index: number) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

// ============================================================================
// Source Type Configurations
// ============================================================================

const SOURCE_TYPE_CONFIG = {
  flashcards: {
    icon: ListChecks,
    label: 'Flashcard Decks',
    description: 'Use existing flashcard decks as question sources',
    color: 'bg-blue-100 text-blue-800',
    emptyMessage: 'No flashcard decks found in this project',
  },
  files: {
    icon: FileText,
    label: 'Study Files',
    description: 'Upload or select files to generate questions from',
    color: 'bg-green-100 text-green-800',
    emptyMessage: 'No files found in this project',
  },
  studyMaterials: {
    icon: BookOpen,
    label: 'Study Materials',
    description: 'Use study materials and notes as sources',
    color: 'bg-purple-100 text-purple-800',
    emptyMessage: 'No study materials found in this project',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return '📄';
    case 'docx':
    case 'doc': return '📘';
    case 'txt': return '📝';
    case 'md': return '📋';
    default: return '📄';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// ============================================================================
// Main Component
// ============================================================================

export const SourceSelectionStep: React.FC<SourceSelectionStepProps> = ({
  sources,
  selectedSources,
  onSourcesChange,
  multiSelect = true,
  showGroundOnlyOption = true,
  minSources = 1,
  onFileUpload,
  uploadedFiles = [],
  onRemoveUploadedFile,
  searchTerm = '',
  onSearchChange,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange?.(value);
  };

  // Filter items based on search term
  const filterItems = (items: any[] = []) => {
    if (!localSearchTerm.trim()) return items;
    const term = localSearchTerm.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(term) ||
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  };

  // Handle source selection
  const handleSourceToggle = (sourceType: keyof SelectedSources, itemId: string) => {
    const currentIds = selectedSources[sourceType].ids;
    let newIds: string[];

    if (multiSelect) {
      newIds = currentIds.includes(itemId)
        ? currentIds.filter(id => id !== itemId)
        : [...currentIds, itemId];
    } else {
      newIds = currentIds.includes(itemId) ? [] : [itemId];
    }

    onSourcesChange({
      ...selectedSources,
      [sourceType]: {
        ...selectedSources[sourceType],
        ids: newIds,
      },
    });
  };

  // Handle ground-only option toggle
  const handleGroundOnlyToggle = (sourceType: keyof SelectedSources, enabled: boolean) => {
    onSourcesChange({
      ...selectedSources,
      [sourceType]: {
        ...selectedSources[sourceType],
        groundOnly: enabled,
      },
    });
  };

  // Calculate total selected sources
  const totalSelected = Object.values(selectedSources).reduce(
    (sum, source) => sum + source.ids.length, 
    0
  ) + uploadedFiles.length;

  const isValidSelection = totalSelected >= minSources;

  // Render source section
  const renderSourceSection = (sourceType: keyof SelectedSources) => {
    const config = SOURCE_TYPE_CONFIG[sourceType];
    const sourceConfig = sources[sourceType];
    const selectedIds = selectedSources[sourceType].ids;
    const groundOnly = selectedSources[sourceType].groundOnly;

    if (!sourceConfig?.enabled) return null;

    const Icon = config.icon;
    const items = filterItems(sourceConfig.items);

    return (
      <div key={sourceType} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-slate-600" />
            <div>
              <h3 className="font-medium text-slate-900">{config.label}</h3>
              <p className="text-sm text-slate-500">{config.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className={config.color}>
            {sourceConfig.count} available
          </Badge>
        </div>

        {sourceConfig.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading {config.label.toLowerCase()}...</span>
          </div>
        ) : items.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{config.emptyMessage}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item: any) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => handleSourceToggle(sourceType, item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} readOnly />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">
                          {sourceType === 'files' && getFileIcon(item.name)}
                          {item.name || item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          {item.size && <span>{formatFileSize(item.size)}</span>}
                          {item.created_at && <span>{formatTimeAgo(item.created_at)}</span>}
                          {item.flashcard_count && <span>{item.flashcard_count} cards</span>}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ground-only option */}
        {showGroundOnlyOption && selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id={`ground-only-${sourceType}`}
              checked={groundOnly}
              onCheckedChange={(checked) => handleGroundOnlyToggle(sourceType, checked as boolean)}
            />
            <Label 
              htmlFor={`ground-only-${sourceType}`}
              className="text-sm text-slate-600 cursor-pointer"
            >
              Only generate questions from selected {config.label.toLowerCase()}
            </Label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Choose Sources</h2>
        <p className="text-sm text-slate-600">
          Select where questions should be generated from. You can choose multiple sources.
        </p>
      </div>

      {/* Search bar */}
      {(sources.flashcards?.enabled || sources.files?.enabled || sources.studyMaterials?.enabled) && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search sources..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* File upload section (if enabled) */}
      {sources.files?.enabled && onFileUpload && (
        <div className="space-y-3">
          <Label>Upload New Files</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
            <input 
              type="file" 
              multiple 
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => onFileUpload(Array.from(e.target.files || []))}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" className="mt-2">
                Browse Files
              </Button>
            </label>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                  </div>
                  {onRemoveUploadedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveUploadedFile(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Source sections */}
      <div className="space-y-6">
        {renderSourceSection('flashcards')}
        {renderSourceSection('files')}
        {renderSourceSection('studyMaterials')}
      </div>

      {/* Selection summary */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-slate-900">Selection Summary</h4>
            <p className="text-sm text-slate-500">
              {totalSelected} source{totalSelected !== 1 ? 's' : ''} selected
              {minSources > 1 && ` (minimum ${minSources} required)`}
            </p>
          </div>
          {isValidSelection ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          )}
        </div>

        {!isValidSelection && totalSelected < minSources && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select at least {minSources} source{minSources !== 1 ? 's' : ''} to continue.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SourceSelectionStep;

