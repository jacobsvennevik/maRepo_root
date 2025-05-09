'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, File, FileText, Image, FileArchive, FileVideo } from 'lucide-react';

export default function ProjectFiles() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Files</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Files</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Upload File
        </button>
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Total Files</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Storage Used</h3>
          <p className="text-2xl font-bold text-green-600">156 MB</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Last Upload</h3>
          <p className="text-2xl font-bold text-purple-600">2 days ago</p>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Your Files</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Biology Notes.pdf</h3>
                  <p className="text-sm text-gray-500">2.4 MB • Last modified 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  PDF
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Image className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Cell Structure.png</h3>
                  <p className="text-sm text-gray-500">1.8 MB • Last modified 5 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Image
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileVideo className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Chemistry Lab.mp4</h3>
                  <p className="text-sm text-gray-500">45.2 MB • Last modified 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Video
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 