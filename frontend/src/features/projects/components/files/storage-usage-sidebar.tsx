"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive,
  FileText,
  Image,
  Video,
  FileAudio,
  Archive,
  ArrowUp,
  Star
} from "lucide-react";
import { StorageStats, formatFileSize } from '@/lib/file-utils';

interface StorageUsageSidebarProps {
  stats: StorageStats;
}

export function StorageUsageSidebar({ stats }: StorageUsageSidebarProps) {
  const usedPercentage = (stats.totalUsed / stats.totalAvailable) * 100;
  const usedGB = stats.totalUsed / (1024 * 1024 * 1024);
  const availableGB = stats.totalAvailable / (1024 * 1024 * 1024);

  const breakdownItems = [
    {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      label: 'Documents',
      count: stats.breakdown.documents.count,
      size: formatFileSize(stats.breakdown.documents.size),
    },
    {
      icon: <Image className="h-4 w-4 text-green-500" />,
      label: 'Images',
      count: stats.breakdown.images.count,
      size: formatFileSize(stats.breakdown.images.size),
    },
    {
      icon: <Video className="h-4 w-4 text-purple-500" />,
      label: 'Videos',
      count: stats.breakdown.videos.count,
      size: formatFileSize(stats.breakdown.videos.size),
    },
    {
      icon: <FileAudio className="h-4 w-4 text-orange-500" />,
      label: 'Audio',
      count: stats.breakdown.audio.count,
      size: formatFileSize(stats.breakdown.audio.size),
    },
    {
      icon: <Archive className="h-4 w-4 text-yellow-500" />,
      label: 'ZIP',
      count: stats.breakdown.archives.count,
      size: formatFileSize(stats.breakdown.archives.size),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Storage usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Circular Progress */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-ocean-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${usedPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {usedGB.toFixed(1)} GB
                  </div>
                  <div className="text-xs text-gray-500">
                    of {availableGB} GB
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {breakdownItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {item.count} Files
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.size}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-br from-ocean-500 to-ocean-600 text-white">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HardDrive className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Get more space for your files</h3>
          <p className="text-sm text-ocean-100 mb-4">
            Upgrade your account to pro to get more storage
          </p>
          <Button 
            variant="outline" 
            className="bg-white text-ocean-600 hover:bg-ocean-50 border-white"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
