import { CheckCircle, Clock, AlertCircle, Play, Edit, FileText, Timer, Star } from 'lucide-react';
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
  lastScore?: number;
  status: 'completed' | 'upcoming' | 'needs-review';
  icon: string;
}

interface TestCardProps {
  test: Test;
  onStart: (id: string) => void;
}

export function TestCard({ test, onStart }: TestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'needs-review': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'needs-review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl">{test.icon}</span>
            <Badge className={getStatusColor(test.status)}>
              {getStatusIcon(test.status)}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{test.title}</h3>
            <p className="text-sm text-slate-600 mb-2">{test.subject}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="h-3 w-3" />
              <span>{test.questions} questions</span>
              <span>•</span>
              <Timer className="h-3 w-3" />
              <span>{test.timeEstimate} min</span>
            </div>
          </div>

          {test.lastScore && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-slate-600">Last score: {test.lastScore}%</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onStart(test.id)}
            >
              <Play className="h-3 w-3 mr-1" />
              {test.status === 'completed' ? 'Retake' : 'Start'}
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 