import React from 'react';
import { getDaysSinceLastReview } from '@/lib/date';

interface FlashcardTopicCardProps {
  title: string;
  cardCount: number;
  lastReviewed: string;
  status: 'mastered' | 'needs_review';
  sourceDoc: string;
  isAIGenerated?: boolean;
  onReview?: () => void;
  onGenerateMore?: () => void;
}

export function FlashcardTopicCard({
  title,
  cardCount,
  lastReviewed,
  status,
  sourceDoc,
  isAIGenerated,
  onReview,
  onGenerateMore,
}: FlashcardTopicCardProps) {
  const days = getDaysSinceLastReview(lastReviewed);
  // Cap the bar at 10 days for visualization
  const barPercent = Math.min(days, 10) * 10;
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-emerald-900">{title}</h3>
            {isAIGenerated && (
              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-ocean-100 to-ocean-200 text-ocean-800 rounded-full">
                AI Generated
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-base text-emerald-700">
            <span>{cardCount} cards</span>
            <span>•</span>
            <span>{sourceDoc}</span>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          status === 'mastered'
            ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
            : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
        }`}>
          {status === 'mastered' ? 'Mastered' : 'Needs Review'}
        </span>
      </div>
      {/* Days since last review bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700 font-medium">Days Since Last Review</span>
          <span className="text-lg font-bold text-emerald-700">{days} day{days !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-full h-4 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-4 bg-gradient-to-r from-yellow-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${barPercent}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          className="px-4 py-2 text-base bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-sm"
          onClick={onReview}
        >
          Review Now
        </button>
        <button
          className="px-4 py-2 text-base border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300"
          onClick={onGenerateMore}
        >
          Generate More
        </button>
      </div>
    </div>
  );
} 