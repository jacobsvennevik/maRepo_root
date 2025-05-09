import { BookOpen, Tag, Brain } from 'lucide-react';
import React from 'react';

export function ProjectBanner({ title, sourceDocuments, topicsCovered, totalFlashcards }: {
  title: string;
  sourceDocuments: number;
  topicsCovered: number;
  totalFlashcards: number;
}) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg shadow-lg p-3 text-white backdrop-blur-sm">
      <h1 className="text-xl font-bold mb-2">{title}</h1>
      <div className="space-y-1">
        <div className="flex items-center space-x-1 text-sm">
          <BookOpen size={16} className="text-emerald-100" />
          <span className="text-emerald-50 font-medium">{sourceDocuments} Source Documents</span>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <Tag size={16} className="text-emerald-100" />
          <span className="text-emerald-50 font-medium">{topicsCovered} Topics</span>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <Brain size={16} className="text-emerald-100" />
          <span className="text-emerald-50 font-medium">{totalFlashcards} Flashcards</span>
        </div>
      </div>
    </div>
  );
} 