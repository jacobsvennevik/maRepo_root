import { Lightbulb, Play, Edit, Timer, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Test {
  id: string;
  title: string;
  subject: string;
  type: string;
  questions: number;
  timeEstimate: number;
  icon: string;
}

interface RecommendedTestCardProps {
  test: Test;
  onStart: (id: string) => void;
}

export function RecommendedTestCard({
  test,
  onStart,
}: RecommendedTestCardProps) {
  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-600 shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recommended for You
                </h2>
                <p className="text-slate-600">
                  Based on your learning progress
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{test.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {test.title}
                  </h3>
                  <p className="text-slate-600">
                    {test.subject} • {test.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  <Timer className="h-3 w-3 mr-1" />
                  {test.timeEstimate} min
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {test.questions} questions
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => onStart(test.id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recommended Quiz
              </Button>
              <Button
                variant="outline"
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>

          <div className="text-right space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs">Last Score</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
