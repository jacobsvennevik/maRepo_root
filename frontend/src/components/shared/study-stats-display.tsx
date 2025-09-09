/**
 * Shared study statistics display component.
 * Eliminates duplication between FlashcardReview and ProjectDetailGraphQL.
 */
import { Card, CardContent } from '@/components/ui/card';

export interface StudyStats {
  total_cards: number;
  reviewed_today: number;
  due_cards: number;
  study_streak: number;
  completion_rate: number;
  cards_by_difficulty?: number[];
}

interface StudyStatsDisplayProps {
  stats: StudyStats;
  showProgressBar?: boolean;
  className?: string;
}

export function StudyStatsDisplay({ 
  stats, 
  showProgressBar = false, 
  className = "" 
}: StudyStatsDisplayProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Your Study Progress</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.total_cards}</div>
            <div className="text-gray-600">Total Cards</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.reviewed_today}</div>
            <div className="text-gray-600">Reviewed Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{stats.due_cards}</div>
            <div className="text-gray-600">Due Cards</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{stats.study_streak}</div>
            <div className="text-gray-600">Day Streak</div>
          </div>
        </div>
        
        {showProgressBar && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Completion Rate</span>
              <span>{Math.round(stats.completion_rate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completion_rate}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
