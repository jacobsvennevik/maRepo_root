'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  MindMapCard, 
  FeaturedMindMap, 
  NewMindMapCard, 
  QuickActions 
} from './components';
import { 
  getSubjectIcon, 
  getStatusColor, 
  mockMindMaps, 
  type MindMap 
} from './utils/mind-map-utils';

export default function ProjectMindMaps() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [mindMaps] = useState<MindMap[]>(mockMindMaps);

  const recentMindMap = mindMaps[0]; // Most recent mind map for hero banner

  // Event handlers
  const handleOpenMindMap = (id: string) => {
    console.log('Opening mind map:', id);
    // TODO: Navigate to mind map editor
  };

  const handleCreateNewMindMap = () => {
    console.log('Creating new mind map');
    // TODO: Navigate to mind map creation
  };

  const handleDuplicateMindMap = (id: string) => {
    console.log('Duplicating mind map:', id);
    // TODO: Duplicate mind map logic
  };

  const handleShareMindMap = (id: string) => {
    console.log('Sharing mind map:', id);
    // TODO: Share mind map logic
  };

  const handleDeleteMindMap = (id: string) => {
    console.log('Deleting mind map:', id);
    // TODO: Delete mind map logic
  };

  const handleImport = () => {
    console.log('Importing mind maps');
    // TODO: Import logic
  };

  const handleExport = () => {
    console.log('Exporting mind maps');
    // TODO: Export logic
  };

  const handleAISuggestions = () => {
    console.log('Getting AI suggestions');
    // TODO: AI suggestions logic
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Mind Maps</span>
      </div>

      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mind Maps</h1>
          <p className="text-slate-600 mt-1">Organize your thoughts and ideas visually</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Mind Maps</p>
            <p className="text-2xl font-bold text-blue-600">{mindMaps.length}</p>
          </div>
        </div>
      </div>

      {/* Featured Mind Map Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeaturedMindMap 
          mindMap={recentMindMap}
          getSubjectIcon={getSubjectIcon}
          onClick={() => handleOpenMindMap(recentMindMap.id)}
        />
        <NewMindMapCard onClick={handleCreateNewMindMap} />
      </div>

      {/* Quick Actions & Search */}
      <QuickActions 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onImport={handleImport}
        onExport={handleExport}
        onAISuggestions={handleAISuggestions}
      />

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {mindMaps.map((mindMap, index) => (
            <div key={mindMap.id} className="relative">
              {/* Timeline Indicator */}
              <div className="absolute left-6 top-6 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full shadow-md z-10"></div>
              {index < mindMaps.length - 1 && (
                <div className="absolute left-7 top-10 w-0.5 h-16 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}
              
              <div className="ml-16">
                <MindMapCard 
                  mindMap={mindMap}
                  getSubjectIcon={getSubjectIcon}
                  getStatusColor={getStatusColor}
                  onOpen={handleOpenMindMap}
                  onDuplicate={handleDuplicateMindMap}
                  onShare={handleShareMindMap}
                  onDelete={handleDeleteMindMap}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindMaps.map((mindMap) => (
            <MindMapCard 
              key={mindMap.id}
              mindMap={mindMap}
              getSubjectIcon={getSubjectIcon}
              getStatusColor={getStatusColor}
              onOpen={handleOpenMindMap}
              onDuplicate={handleDuplicateMindMap}
              onShare={handleShareMindMap}
              onDelete={handleDeleteMindMap}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {mindMaps.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white text-3xl">🧠</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to organize your thoughts?</h3>
          <p className="text-slate-600 mb-6">Create your first mind map to start visualizing your ideas</p>
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            onClick={handleCreateNewMindMap}
          >
            Create Your First Mind Map
          </button>
        </div>
      )}
    </div>
  );
} 