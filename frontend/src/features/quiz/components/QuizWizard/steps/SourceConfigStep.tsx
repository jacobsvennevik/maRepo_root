/**
 * SourceConfigStep
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { 
  Brain,
  Upload,
  ListChecks,
  Loader2,
  Search,
  X,
  File,
  CheckCircle2,
} from 'lucide-react';
import { 
  getFileIcon,
  formatFileSize,
  formatTimeAgo,
} from '../../../utils';

interface SourceConfigStepProps {
  method: 'auto' | 'files' | 'manual';
  uploadedFiles: File[];
  selectedExistingFileIds: (string | number)[];
  existingSearch: string;
  isLoadingFiles: boolean;
  projectFiles: any[];
  onFileUpload: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onToggleExistingFile: (fileId: string | number) => void;
  onSearchChange: (search: string) => void;
}

export const SourceConfigStep: React.FC<SourceConfigStepProps> = ({
  method,
  uploadedFiles,
  selectedExistingFileIds,
  existingSearch,
  isLoadingFiles,
  projectFiles,
  onFileUpload,
  onRemoveFile,
  onToggleExistingFile,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Source Configuration</h2>
        <p className="text-sm text-slate-600">
          {method === 'files' ? 'Select files to generate questions from' : 
           method === 'auto' ? 'AI will analyze your project content automatically' :
           'Configure manual quiz creation'}
        </p>
      </div>

      {method === 'files' && (
        <div className="space-y-4">
          <div>
            <Label>Upload New Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.docx,.txt"
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
          </div>

          {uploadedFiles.length > 0 && (
            <div>
              <Label>Uploaded Files</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <File className={`h-3 w-3 ${getFileIcon(file.name)}`} />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Project Files</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search files..."
                value={existingSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isLoadingFiles ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading files...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {projectFiles
                  .filter((file: any) => 
                    file.name.toLowerCase().includes(existingSearch.toLowerCase())
                  )
                  .map((file: any) => (
                    <div 
                      key={file.id} 
                      className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                        selectedExistingFileIds.includes(file.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onToggleExistingFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        <File className={`h-3 w-3 ${getFileIcon(file.name, file.file_type)}`} />
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <div className="text-xs text-gray-500">
                            {file.file_type?.toUpperCase()} • {formatFileSize(file.file_size || 0)} • {formatTimeAgo(file.uploaded_at || '')}
                          </div>
                        </div>
                      </div>
                      {selectedExistingFileIds.includes(file.id) && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {method === 'auto' && (
        <div className="text-center space-y-4">
          <div className="p-6 border rounded-lg bg-blue-50">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">AI Auto-Generation</h3>
            <p className="text-sm text-blue-700">
              AI will analyze your project content and create relevant quiz questions automatically.
              This includes all uploaded files, notes, and project materials.
            </p>
          </div>
        </div>
      )}

      {method === 'manual' && (
        <div className="text-center space-y-4">
          <div className="p-6 border rounded-lg bg-emerald-50">
            <ListChecks className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-900">Manual Setup</h3>
            <p className="text-sm text-emerald-700">
              You'll be able to manually create and configure quiz questions after the basic setup is complete.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceConfigStep;


