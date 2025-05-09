import { Plus, Tag } from 'lucide-react';
import React from 'react';

export function FlashcardAISuggestions() {
  return (
    <div className="glass-card rounded-lg p-6 backdrop-blur-sm">
      <h2 className="text-lg font-medium mb-4 text-emerald-800">AI Flashcard Generation</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-sm">
          <Plus size={20} className="mr-2" />
          Generate All Flashcards
        </button>
        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-white/80 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300 backdrop-blur-sm">
          <Tag size={20} className="mr-2" />
          Generate by Topic
        </button>
      </div>
    </div>
  );
} 