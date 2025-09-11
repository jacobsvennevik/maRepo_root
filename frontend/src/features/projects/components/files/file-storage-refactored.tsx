"use client";

import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileStorage } from '../../hooks/useFileStorage';
import { FileStorageHeader } from './file-storage-header';
import { FileStorageLoading } from './file-storage-loading';
import { FileStorageError } from './file-storage-error';
import { FileStorageEmpty } from './file-storage-empty';
import { RecentFileCard } from './recent-file-card';
import { FileTypeBreakdown } from './file-type-breakdown';
import { FileListView } from './file-list-view';
import { FileGridView } from './file-grid-view';
import { StorageUsageSidebar } from './storage-usage-sidebar';
import { FileDetailsPanel } from './file-details-panel';

export default function FileStorage() {
  const {
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
    handleFileSelect,
    handleToggleFavorite,
    handleSelectFile,
    handleSelectAll,
    handleFileAction,
    handleBulkAction,
    
    // Refs
    fileInputRef,
  } = useFileStorage();

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
      <FileStorageHeader
        viewMode={viewMode}
        sortBy={sortBy}
        filterBy={filterBy}
        searchQuery={searchQuery}
        uploading={uploading}
        onUploadClick={() => fileInputRef.current?.click()}
        onViewModeChange={setViewMode}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        onSearchChange={setSearchQuery}
      />

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Recently Modified Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently modified</h2>
              <Button variant="ghost" size="sm" className="text-ocean-600 hover:text-ocean-700">
                View all
                <span className="ml-1">→</span>
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
                      <span className="mr-1">⭐</span>
                      Favorite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('download')}
                    >
                      <span className="mr-1">⬇️</span>
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <span className="mr-1">🗑️</span>
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

