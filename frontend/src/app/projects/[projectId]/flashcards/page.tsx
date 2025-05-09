'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';

export default function ProjectFlashcards() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Flashcards</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Create New Flashcard
        </button>
      </div>

      {/* Flashcard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Total Flashcards</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Mastered</h3>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Needs Review</h3>
          <p className="text-2xl font-bold text-yellow-600">8</p>
        </div>
      </div>

      {/* Flashcard List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Your Flashcards</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {/* Placeholder for flashcard list */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Biology: Cell Structure</h3>
                <p className="text-sm text-gray-500">Last reviewed 2 days ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Mastered
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Chemistry: Periodic Table</h3>
                <p className="text-sm text-gray-500">Last reviewed 5 days ago</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Needs Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 