'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Eye, BookOpen, CheckCircle, Waves } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Action section component that provides quick access to learning activities.
 * This component displays three main action cards for reviewing concepts,
 * taking assessments, and studying notes.
 */
export function OceanActionSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border-blue-300/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to explore deeper waters?</h3>
          <p className="text-slate-600">Continue your learning adventure or chart a new course</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Review Concepts</h4>
            <p className="text-sm text-slate-600">Continue your learning journey</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Take Assessment</h4>
            <p className="text-sm text-slate-600">Test your knowledge</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
              <Waves className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Study Notes</h4>
            <p className="text-sm text-slate-600">Review your materials</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// No PropTypes needed for this component as it doesn't accept any props 