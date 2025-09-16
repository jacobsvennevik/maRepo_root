import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Link, X, Youtube, Github, ExternalLink } from "lucide-react";
import { LearningMaterial } from '../../types';
import { LINK_TYPES } from '../../constants';
// import { createDragHandlers, formatFileSize } from '../../../create/utils/file-helpers';

interface LearningMaterialsStepProps {
  learningMaterials: LearningMaterial[];
  onMaterialsChange: (materials: LearningMaterial[]) => void;
  onMaterialRemove: (id: string) => void;
}

export function LearningMaterialsStep({
  learningMaterials,
  onMaterialsChange,
  onMaterialRemove
}: LearningMaterialsStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', type: 'other' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use shared drag and drop handlers with custom transformation
  // const { handleDragOver, handleDragLeave, handleDrop } = createDragHandlers(
  //   (droppedFiles) => {
  //     const newMaterials = droppedFiles.map(file => ({
  //       id: `file-${Date.now()}-${Math.random()}`,
  //       type: 'file' as const,
  //       name: file.name,
  //       file,
  //       size: file.size
  //     }));
  //     onMaterialsChange([...learningMaterials, ...newMaterials]);
  //   },
  //   setIsDragOver
  // );

  // Temporary placeholder handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // TODO: Implement file handling
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newMaterials = selectedFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      type: 'file' as const,
      name: file.name,
      file,
      size: file.size
    }));
    onMaterialsChange([...learningMaterials, ...newMaterials]);
  }, [learningMaterials, onMaterialsChange]);

  const handleAddLink = () => {
    if (newLink.name && newLink.url) {
      const material: LearningMaterial = {
        id: `link-${Date.now()}-${Math.random()}`,
        type: 'link',
        name: newLink.name,
        url: newLink.url
      };
      onMaterialsChange([...learningMaterials, material]);
      setNewLink({ name: '', url: '', type: 'other' });
      setShowLinkForm(false);
    }
  };

  const getLinkIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return Youtube;
    if (url.includes('github.com')) return Github;
    return ExternalLink;
  };

  const getLinkColor = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'text-red-600';
    if (url.includes('github.com')) return 'text-gray-800';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Files</h3>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50/50 scale-105' 
              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isDragOver ? 'Drop your files here!' : 'Upload your learning materials'}
              </h3>
              <p className="text-slate-600 mb-4">
                Upload documents, notes, textbooks, and other learning resources.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported formats: PDF, DOCX, PPTX, TXT, PNG, JPG, CSV, MD, ZIP, MP4
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Or browse files
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.csv,.md,.zip,.mp4"
        />
      </div>

      {/* Add Links Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Add Links</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="flex items-center space-x-2"
          >
            <Link className="h-4 w-4" />
            <span>{showLinkForm ? 'Cancel' : 'Add Link'}</span>
          </Button>
        </div>

        {showLinkForm && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="linkName" className="text-sm font-medium">Name</Label>
                <Input
                  id="linkName"
                  placeholder="e.g., React Tutorial"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="linkUrl" className="text-sm font-medium">URL</Label>
                <Input
                  id="linkUrl"
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddLink} size="sm">
                Add Link
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowLinkForm(false);
                  setNewLink({ name: '', url: '', type: 'other' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Materials Preview */}
      {learningMaterials.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Learning Materials ({learningMaterials.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {learningMaterials.map((material) => {
              const IconComponent = material.type === 'file' ? FileText : getLinkIcon(material.url || '');
              const iconColor = material.type === 'file' ? 'text-blue-500' : getLinkColor(material.url || '');
              
              return (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${iconColor}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{material.name}</p>
                      {material.type === 'file' && material.size && (
                        <p className="text-xs text-gray-500">{material.size ? `${(material.size / 1024).toFixed(1)} KB` : 'Unknown size'}</p>
                      )}
                      {material.type === 'link' && material.url && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{material.url}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMaterialRemove(material.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 