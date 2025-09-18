// File storage header component
import React from 'react';
import { Upload, Plus, Search, Filter, Grid3X3, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewMode, SortOption, FilterOption } from '../../hooks/useFileStorage';

interface FileStorageHeaderProps {
  viewMode: ViewMode;
  sortBy: SortOption;
  filterBy: FilterOption;
  searchQuery: string;
  uploading: boolean;
  onUploadClick: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
  onSearchChange: (query: string) => void;
}

export function FileStorageHeader({
  viewMode,
  sortBy,
  filterBy,
  searchQuery,
  uploading,
  onUploadClick,
  onViewModeChange,
  onSortChange,
  onFilterChange,
  onSearchChange,
}: FileStorageHeaderProps) {
  return (
    <>
      {/* Main Header */}
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
                onClick={onUploadClick}
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

      {/* Controls Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All files</h2>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value) => onFilterChange(value as FilterOption)}>
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
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
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
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

