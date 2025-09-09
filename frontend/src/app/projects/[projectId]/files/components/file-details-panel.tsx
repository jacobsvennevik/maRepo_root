"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Star,
  Users,
  Lock,
  Globe
} from "lucide-react";
import { FileItem } from '@/lib/file-utils';
import { getFileIcon, getFileTypeColor, formatFileSize } from '@/lib/file-utils';

interface FileDetailsPanelProps {
  file: FileItem;
  onClose: () => void;
}

export function FileDetailsPanel({ file, onClose }: FileDetailsPanelProps) {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'shared':
        return <Users className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">File Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* File Preview */}
              <div className="text-center">
                <div className={`p-6 rounded-xl bg-gradient-to-r ${file.color} shadow-lg mb-4 inline-block`}>
                  {getFileIcon(file.type)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h3>
                <Badge className={`${getFileTypeColor(file.type)} text-sm`}>
                  {file.type.toUpperCase()}
                </Badge>
              </div>

              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uploaded</span>
                    <span className="text-sm font-medium">{file.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Modified</span>
                    <span className="text-sm font-medium">{file.lastModified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge 
                      variant={file.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {file.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Visibility & Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sharing & Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(file.visibility)}
                      <span className="text-sm text-gray-600">Visibility</span>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {file.visibility}
                    </Badge>
                  </div>
                  
                  {file.sharedWith && file.sharedWith.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">Shared with</span>
                      <div className="space-y-2">
                        {file.sharedWith.map((user, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {user.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">{user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {file.permissions && file.permissions.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 mb-2 block">Permissions</span>
                      <div className="flex flex-wrap gap-1">
                        {file.permissions.map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Version History */}
              {file.versionCount && file.versionCount > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-2">
                      {file.versionCount} versions available
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      View Version History
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
