'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Eye, Waves, BookOpen, Activity } from 'lucide-react';
import PropTypes from 'prop-types';

interface JourneyItem {
  id: number;
  milestone: string;
  time: string;
  type: string;
  status: string;
}

interface LearningJourneyProps {
  waveOffset: number;
  floatingCards: boolean;
}

/**
 * Component that displays the user's learning journey with animated timeline items.
 * @param {object} props
 * @param {number} props.waveOffset - Current wave animation offset
 * @param {boolean} props.floatingCards - Whether cards should float/animate
 */
export function LearningJourney({ waveOffset, floatingCards }: LearningJourneyProps) {
  const learningJourney: JourneyItem[] = [
    { id: 1, milestone: "Completed Ocean Biology Quiz", time: "2 hours ago", type: "quiz", status: "completed" },
    { id: 2, milestone: "Discovered 5 new concepts", time: "4 hours ago", type: "discovery", status: "explored" },
    { id: 3, milestone: "Updated navigation charts", time: "1 day ago", type: "notes", status: "updated" },
    { id: 4, milestone: "Set sail for new chapter", time: "2 days ago", type: "chapter", status: "started" }
  ];

  const getJourneyIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'discovery': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'notes': return <Waves className="h-4 w-4 text-purple-500" />;
      case 'chapter': return <BookOpen className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm border-blue-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-600" />
          Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {learningJourney.map((journey, index) => (
            <div 
              key={journey.id} 
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50/50 transition-colors duration-300 cursor-pointer group border border-transparent hover:border-blue-200"
              style={{
                animationDelay: `${index * 0.1}s`,
                transform: floatingCards ? `translateX(${Math.sin(waveOffset * 0.05 + index) * 3}px)` : 'translateX(0)'
              }}
            >
              <div className="flex-shrink-0">
                {getJourneyIcon(journey.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                  {journey.milestone}
                </p>
                <p className="text-xs text-slate-500">{journey.time}</p>
              </div>
              <div className="flex-shrink-0">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  journey.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  journey.status === 'explored' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  journey.status === 'updated' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                  'bg-orange-100 text-orange-800 border-orange-200'
                }`}>
                  {journey.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

LearningJourney.propTypes = {
  waveOffset: PropTypes.number.isRequired,
  floatingCards: PropTypes.bool.isRequired,
}; 