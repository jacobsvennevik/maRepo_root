'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ProjectTests() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/projects" className="hover:text-blue-600">Projects</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-900">Tests</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Tests</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Create New Test
        </button>
      </div>

      {/* Test Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Completed Tests</h3>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Average Score</h3>
          <p className="text-2xl font-bold text-blue-600">85%</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Upcoming Tests</h3>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </div>
      </div>

      {/* Test List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Your Tests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Biology Midterm</h3>
                <p className="text-sm text-gray-500">50 questions • 60 minutes</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Chemistry Quiz #3</h3>
                <p className="text-sm text-gray-500">20 questions • 30 minutes</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Upcoming
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Physics Practice Test</h3>
                <p className="text-sm text-gray-500">40 questions • 45 minutes</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
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