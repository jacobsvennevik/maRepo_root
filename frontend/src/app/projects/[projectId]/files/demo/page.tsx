"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  mockFiles, 
  mockEmptyFiles, 
  mockFilesWithUploading, 
  mockFilesWithError, 
  mockFilesWithProcessing,
  mockStorageStats,
  FileStorage
} from "@/features/projects";

type DemoState = 'normal' | 'empty' | 'loading' | 'error' | 'uploading' | 'processing';

export default function FileStorageDemo() {
  const [demoState, setDemoState] = useState<DemoState>('normal');

  const getStateDescription = (state: DemoState): string => {
    switch (state) {
      case 'normal':
        return 'Normal state with files loaded';
      case 'empty':
        return 'Empty state when no files exist';
      case 'loading':
        return 'Loading state while fetching files';
      case 'error':
        return 'Error state when file loading fails';
      case 'uploading':
        return 'State with file being uploaded';
      case 'processing':
        return 'State with files being processed';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">File Storage Component Demo</h1>
          <p className="text-gray-600 mb-6">
            This demo shows the File Storage component in different states. Use the buttons below to switch between states.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={demoState === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('normal')}
            >
              Normal State
            </Button>
            <Button
              variant={demoState === 'empty' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('empty')}
            >
              Empty State
            </Button>
            <Button
              variant={demoState === 'loading' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('loading')}
            >
              Loading State
            </Button>
            <Button
              variant={demoState === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('error')}
            >
              Error State
            </Button>
            <Button
              variant={demoState === 'uploading' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('uploading')}
            >
              Uploading State
            </Button>
            <Button
              variant={demoState === 'processing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDemoState('processing')}
            >
              Processing State
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Current State:</strong> {getStateDescription(demoState)}
            </p>
          </div>
        </div>
      </div>

      {/* Component Demo */}
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>File Storage Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4 min-h-[600px]">
              <FileStorageDemoContent state={demoState} />
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• File upload with progress</li>
                <li>• List and grid view modes</li>
                <li>• Search and filtering</li>
                <li>• Sorting by name, size, date</li>
                <li>• Multi-select with bulk actions</li>
                <li>• Favorite files</li>
                <li>• File details side panel</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• File type detection</li>
                <li>• Size formatting</li>
                <li>• Upload date tracking</li>
                <li>• Version history</li>
                <li>• Sharing permissions</li>
                <li>• Tags and labels</li>
                <li>• Quick actions menu</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">UI/UX Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Responsive design</li>
                <li>• Accessibility support</li>
                <li>• Loading states</li>
                <li>• Error handling</li>
                <li>• Empty states</li>
                <li>• Storage usage sidebar</li>
                <li>• Consistent design tokens</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Design Tokens */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Design Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Colors</h4>
                <div className="space-y-1">
                  <Badge className="bg-ocean-500 text-white">Ocean</Badge>
                  <Badge className="bg-emerald-500 text-white">Emerald</Badge>
                  <Badge className="bg-slate-500 text-white">Slate</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Typography</h4>
                <div className="space-y-1 text-sm">
                  <div>Inter font family</div>
                  <div>Consistent sizing</div>
                  <div>Weight variations</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Spacing</h4>
                <div className="space-y-1 text-sm">
                  <div>Consistent padding</div>
                  <div>Grid gaps</div>
                  <div>Margin spacing</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Components</h4>
                <div className="space-y-1 text-sm">
                  <div>Button variants</div>
                  <div>Card components</div>
                  <div>Form elements</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FileStorageDemoContentProps {
  state: DemoState;
}

function FileStorageDemoContent({ state }: FileStorageDemoContentProps) {
  // This would be a simplified version of the FileStorage component
  // that accepts props to control its state for demo purposes
  
  switch (state) {
    case 'empty':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">Upload your first file to get started</p>
            <Button variant="ocean">Upload file</Button>
          </div>
        </div>
      );
    
    case 'loading':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading files...</p>
          </div>
        </div>
      );
    
    case 'error':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load files</h3>
            <p className="text-gray-600 mb-4">There was an error loading your files</p>
            <Button variant="ocean">Try again</Button>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">
            This is a demo placeholder. In the actual implementation, 
            the FileStorage component would render here with the appropriate state.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            State: {state}
          </p>
        </div>
      );
  }
}

