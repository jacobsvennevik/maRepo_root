'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, FileText, Clock, Star } from 'lucide-react';

export default function ProjectNotes() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Notes</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Create New Note
        </button>
      </div>

      {/* Notes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Total Notes</h3>
          <p className="text-2xl font-bold text-blue-600">15</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Total Pages</h3>
          <p className="text-2xl font-bold text-green-600">48</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Last Updated</h3>
          <p className="text-2xl font-bold text-purple-600">1 day ago</p>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Your Notes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Biology: Cell Structure</h3>
                <p className="text-sm text-gray-500">8 pages • Last updated 2 days ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Chemistry: Periodic Table</h3>
                <p className="text-sm text-gray-500">12 pages • Last updated 5 days ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Physics: Mechanics</h3>
                <p className="text-sm text-gray-500">6 pages • Last updated 1 day ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 