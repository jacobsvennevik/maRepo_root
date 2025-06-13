import { Target, BookOpen, Sparkles, Flame } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface OceanHeaderProps {
  totalTests: number;
  completedTests: number;
  averageScore: number;
}

export function OceanHeader({ totalTests, completedTests, averageScore }: OceanHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-200/30 shadow-xl">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Quiz Center</h1>
                <p className="text-slate-600">Navigate your learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span>{totalTests} Total Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>{averageScore}% Average Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>3-day Streak</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{completedTests}</div>
                <div className="text-xs">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 