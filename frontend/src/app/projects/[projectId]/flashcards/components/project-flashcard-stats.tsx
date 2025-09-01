import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { FlashcardStats } from "../hooks/use-project-flashcards";

interface ProjectFlashcardStatsProps {
  stats: FlashcardStats;
}

export function ProjectFlashcardStats({ stats }: ProjectFlashcardStatsProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50/80 backdrop-blur-sm border-blue-200/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Your Progress
            </h3>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>{stats.total_cards} Total Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span>{stats.total_sets} Sets</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{stats.mastered_cards}</div>
                <div className="text-xs">Mastered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.due_today}
            </div>
            <div className="text-xs text-slate-600">Due Today</div>
          </div>

          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.learning_cards}
            </div>
            <div className="text-xs text-slate-600">Learning</div>
          </div>

          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.average_accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600">Accuracy</div>
          </div>

          <div className="text-center p-3 bg-white/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.total_sets}
            </div>
            <div className="text-xs text-slate-600">Sets</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
