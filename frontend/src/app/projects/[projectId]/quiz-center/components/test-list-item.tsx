import { CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
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

interface TestListItemProps {
  test: Test;
  onStart: (id: string) => void;
}

export function TestListItem({ test, onStart }: TestListItemProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{test.icon}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{test.title}</h3>
              <p className="text-sm text-slate-600">{test.subject} • {test.questions} questions • {test.timeEstimate} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(test.status)}>
              {getStatusIcon(test.status)}
            </Badge>
            <Button size="sm" onClick={() => onStart(test.id)}>
              <Play className="h-3 w-3 mr-1" />
              {test.status === 'completed' ? 'Retake' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 