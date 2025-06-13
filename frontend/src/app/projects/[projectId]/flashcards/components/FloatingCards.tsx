'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  AlertCircle, 
  Play, 
  Plus, 
  Sparkles,
  Clock,
  Target,
  Flame
} from 'lucide-react';

interface FlashcardStats {
  total: number;
  mastered: number;
  needsReview: number;
  streak: number;
}

interface TopicCard {
  id: string;
  title: string;
  cardCount: number;
  mastered: number;
  lastReviewed: string;
  status: 'mastered' | 'needs_review' | 'new';
  sourceDoc: string;
  isAIGenerated: boolean;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface FloatingCardsProps {
  waveOffset: number;
  floatingCards: boolean;
}

export function FloatingCards({ waveOffset, floatingCards }: FloatingCardsProps) {
  const [stats] = useState<FlashcardStats>({
    total: 24,
    mastered: 12,
    needsReview: 8,
    streak: 5
  });

  const [topics] = useState<TopicCard[]>([
    {
      id: '1',
      title: "Cell Structure",
      cardCount: 8,
      mastered: 6,
      lastReviewed: "2 days ago",
      status: "mastered",
      sourceDoc: "Chapter 1",
      isAIGenerated: true,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50/80 backdrop-blur-sm",
      borderColor: "border-blue-200/50"
    },
    {
      id: '2',
      title: "Periodic Table",
      cardCount: 6,
      mastered: 2,
      lastReviewed: "5 days ago",
      status: "needs_review",
      sourceDoc: "Chapter 2",
      isAIGenerated: false,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50/80 backdrop-blur-sm",
      borderColor: "border-purple-200/50"
    },
    {
      id: '3',
      title: "Chemical Bonds",
      cardCount: 4,
      mastered: 0,
      lastReviewed: "Never",
      status: "new",
      sourceDoc: "Chapter 3",
      isAIGenerated: true,
      color: "from-emerald-400 to-emerald-600",
      bgColor: "bg-emerald-50/80 backdrop-blur-sm",
      borderColor: "border-emerald-200/50"
    },
    {
      id: '4',
      title: "Molecular Biology",
      cardCount: 6,
      mastered: 4,
      lastReviewed: "1 day ago",
      status: "mastered",
      sourceDoc: "Chapter 4",
      isAIGenerated: false,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-50/80 backdrop-blur-sm",
      borderColor: "border-orange-200/50"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <Target className="h-4 w-4 text-green-600" />;
      case 'needs_review': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'new': return <Sparkles className="h-4 w-4 text-blue-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm border-blue-200/50 hover:shadow-xl transition-all duration-500"
          style={{
            animationDelay: '0s',
            transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.1) * 5}px)` : 'translateY(0)'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Total Cards</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
            <Progress 
              value={(stats.mastered / stats.total) * 100} 
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100/80 backdrop-blur-sm border-green-200/50 hover:shadow-xl transition-all duration-500"
          style={{
            animationDelay: '0.2s',
            transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.1 + 1) * 5}px)` : 'translateY(0)'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Mastered</p>
                <p className="text-2xl font-bold text-slate-900">{stats.mastered}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">On track!</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-yellow-50 to-yellow-100/80 backdrop-blur-sm border-yellow-200/50 hover:shadow-xl transition-all duration-500"
          style={{
            animationDelay: '0.4s',
            transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.1 + 2) * 5}px)` : 'translateY(0)'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Need Review</p>
                <p className="text-2xl font-bold text-slate-900">{stats.needsReview}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Time to refresh!</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100/80 backdrop-blur-sm border-orange-200/50 hover:shadow-xl transition-all duration-500"
          style={{
            animationDelay: '0.6s',
            transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.1 + 3) * 5}px)` : 'translateY(0)'
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Learning Streak</p>
                <p className="text-2xl font-bold text-slate-900">{stats.streak}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic, index) => (
          <Card 
            key={topic.id}
            className={`${topic.bgColor} ${topic.borderColor} border-2 hover:shadow-xl transition-all duration-500 cursor-pointer group`}
            style={{
              animationDelay: `${index * 0.1}s`,
              transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.05 + index) * 3}px)` : 'translateY(0)'
            }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${topic.color} shadow-md`}>
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  {topic.title}
                </CardTitle>
                <Badge className={`${getStatusColor(topic.status)} border`}>
                  {getStatusIcon(topic.status)}
                  <span className="ml-1">{topic.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{topic.cardCount} cards</span>
                <span className="text-slate-600">{topic.sourceDoc}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-900">{topic.mastered}/{topic.cardCount}</span>
                </div>
                <Progress 
                  value={(topic.mastered / topic.cardCount) * 100} 
                  className="h-2"
                  indicatorClassName={`bg-gradient-to-r ${topic.color}`}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>Last reviewed: {topic.lastReviewed}</span>
              </div>

              {topic.isAIGenerated && (
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-600">AI Generated</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Review
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 