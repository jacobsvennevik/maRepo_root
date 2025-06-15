'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Link, Upload, X, Plus, BookOpen, Video, File } from "lucide-react";

interface LearningMaterialsStepProps {
  learningMaterials: File[];
  onFileUpload: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'other';
  description?: string;
}

export function LearningMaterialsStep({ 
  learningMaterials, 
  onFileUpload, 
  onFileRemove 
}: LearningMaterialsStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    type: 'article' as const,
    description: ''
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileUpload(files);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'book':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  const handleAddResourceLink = () => {
    if (newLink.title && newLink.url) {
      setResourceLinks(prev => [...prev, { ...newLink, id: Date.now().toString() }]);
      setNewLink({ title: '', url: '', type: 'article', description: '' });
      setShowAddLink(false);
    }
  };

  const handleRemoveResourceLink = (id: string) => {
    setResourceLinks(prev => prev.filter(link => link.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Learning Materials</h3>
        <p className="text-slate-600 text-sm">Upload files and add resource links for your learning project</p>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Upload Files</h4>
        
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">
              Drag and drop files here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </p>
            <p className="text-xs text-slate-500">
              Supports PDF, DOC, DOCX, TXT, MP4, AVI, MOV and other common formats
            </p>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        {learningMaterials.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-slate-900">Uploaded Files ({learningMaterials.length})</h5>
            <div className="space-y-2">
              {learningMaterials.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="font-medium text-sm text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onFileRemove(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resource Links Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-900">Resource Links</h4>
          {!showAddLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddLink(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          )}
        </div>

        {/* Add Resource Link Form */}
        {showAddLink && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="book">Book</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL
                </label>
                <Input
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this resource..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddResourceLink}
                  disabled={!newLink.title || !newLink.url}
                  size="sm"
                >
                  Add Resource
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddLink(false);
                    setNewLink({ title: '', url: '', type: 'article', description: '' });
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Links List */}
        {resourceLinks.length > 0 && (
          <div className="space-y-2">
            {resourceLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getResourceIcon(link.type)}
                  <div>
                    <p className="font-medium text-sm text-slate-900">{link.title}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-xs text-slate-500 mt-1">{link.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveResourceLink(link.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {(learningMaterials.length > 0 || resourceLinks.length > 0) && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            Total materials: {learningMaterials.length} files, {resourceLinks.length} resource links
          </p>
        </div>
      )}
    </div>
  );
} 