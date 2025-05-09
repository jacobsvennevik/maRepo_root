import { AlertCircle } from 'lucide-react';
import React from 'react';

export function FlashcardReviewPrompt({ pendingReviews }: { pendingReviews: number }) {
  if (pendingReviews <= 0) return null;
  return (
    <div className="bg-gradient-to-r from-yellow-50/90 to-amber-50/90 border border-yellow-200 rounded-lg p-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle size={20} className="text-yellow-600" />
          <p className="text-yellow-800">
            🧠 You have {pendingReviews} topic sets to review today to retain memory.
          </p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-sm">
          Start Reviewing
        </button>
      </div>
    </div>
  );
} 