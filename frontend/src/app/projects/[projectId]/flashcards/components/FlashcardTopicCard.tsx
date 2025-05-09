import React from 'react';

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
  return (
    <div className="p-4 hover:bg-emerald-50/50 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-emerald-900">{title}</h3>
            {isAIGenerated && (
              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-ocean-100 to-ocean-200 text-ocean-800 rounded-full">
                AI Generated
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-emerald-600">
            <span>{cardCount} cards</span>
            <span>•</span>
            <span>Last reviewed {lastReviewed}</span>
            <span>•</span>
            <span>{sourceDoc}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === 'mastered'
              ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
              : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
          }`}>
            {status === 'mastered' ? 'Mastered' : 'Needs Review'}
          </span>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-sm"
              onClick={onReview}
            >
              Review Now
            </button>
            <button
              className="px-3 py-1 text-sm border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300"
              onClick={onGenerateMore}
            >
              Generate More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 