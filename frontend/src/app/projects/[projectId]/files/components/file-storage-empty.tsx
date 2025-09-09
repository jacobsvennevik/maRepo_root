"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen, Plus } from "lucide-react";

interface FileStorageEmptyProps {
  onUpload: () => void;
}

export function FileStorageEmpty({ onUpload }: FileStorageEmptyProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
                size="default"
                onClick={onUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload file
              </Button>
              <Button variant="outline" size="default">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No files yet
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your first file to get started. You can upload documents, images, videos, and more.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onUpload} variant="ocean">
                <Upload className="h-4 w-4 mr-2" />
                Upload file
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create folder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
