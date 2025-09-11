'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  RotateCcw, 
  Play,
  Pause,
  RotateCw,
  SkipForward,
  BarChart3,
  Settings,
  Clock
} from 'lucide-react';
import { AssessmentItem, AssessmentSet } from '@/features/diagnostics/types/assessment';
import { AssessmentApi } from '@/lib/assessmentApi';
import { AssessmentItemRenderer } from './AssessmentItemRenderer';

interface AssessmentStudyProps {
  projectId: string;
  setId: string;
}

interface StudySession {
  id: string;
  startTime: Date;
  itemsReviewed: number;
  correctAnswers: number;
  totalTime: number;
  currentStreak: number;
}

export default function AssessmentStudy({ projectId, setId }: AssessmentStudyProps) {
  const [assessmentSet, setAssessmentSet] = useState<AssessmentSet | null>(null);
  const [currentItem, setCurrentItem] = useState<AssessmentItem | null>(null);
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      const set = await AssessmentApi.getAssessmentSet(setId);
      if (set) setAssessmentSet(set);
      const items = await AssessmentApi.getAssessmentItems(setId);
      setItems(items);
      if (items && items.length > 0) setCurrentItem(items[0]);
    })();
    initializeSession();
  }, [setId]);

  useEffect(() => {
    if (currentItem && !startTime) {
      setStartTime(new Date());
    }
  }, [currentItem]);

  const initializeSession = () => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      itemsReviewed: 0,
      correctAnswers: 0,
      totalTime: 0,
      currentStreak: 0,
    };
    setSession(newSession);
  };

  const handleItemReview = async (review: any) => {
    if (!currentItem || !session) return;

    const endTime = new Date();
    const timeSpent = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;
    setResponseTime(timeSpent);

    // Update session
    const updatedSession = {
      ...session,
      itemsReviewed: session.itemsReviewed + 1,
      correctAnswers: session.correctAnswers + (review.is_correct || review.quality >= 3 ? 1 : 0),
      currentStreak: review.is_correct || review.quality >= 3 ? session.currentStreak + 1 : 0,
    };
    setSession(updatedSession);

    // Submit review to backend
    try {
      await AssessmentApi.reviewAssessmentItem(currentItem.id, review);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }

    // Move to next item
    moveToNextItem();
  };

  const moveToNextItem = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < items.length) {
      setCurrentIndex(nextIndex);
      setCurrentItem(items[nextIndex]);
      setIsFlipped(false);
      setShowHint(false);
      setReviewNotes('');
      setStartTime(null);
    } else {
      // Session complete
      setShowReviewDialog(true);
    }
  };

  const handleSkip = () => {
    if (currentItem) {
      // Mark as skipped (quality 0 for flashcards, or just move on for other types)
      if (currentItem.item_type === 'FLASHCARD') {
        handleItemReview({ quality: 0, response_time_seconds: 0 });
      } else {
        moveToNextItem();
      }
    }
  };

  const handleReset = () => {
    if (currentItem) {
      // Reset item to new state
      try {
        AssessmentApi.resetAssessmentItem(currentItem.id);
      } catch (error) {
        console.error('Failed to reset item:', error);
      }
    }
  };

  if (!assessmentSet || !currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assessment items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Study Session</h2>
          <p className="text-muted-foreground">
            {assessmentSet.title} • {items.length} items • {assessmentSet.kind}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isPaused ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset Item
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{currentIndex + 1} of {items.length}</span>
        </div>
        <Progress value={((currentIndex + 1) / items.length) * 100} className="h-2" />
      </div>

      {/* Session Stats */}
      {session && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{session.itemsReviewed}</div>
              <p className="text-xs text-muted-foreground">Items Reviewed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{session.correctAnswers}</div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {session.itemsReviewed > 0 ? Math.round((session.correctAnswers / session.itemsReviewed) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{session.currentStreak}</div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Item */}
      <AssessmentItemRenderer
        item={currentItem}
        isFlipped={isFlipped}
        showHint={showHint}
        onFlip={() => setIsFlipped(!isFlipped)}
        onToggleHint={() => setShowHint(!showHint)}
        onReview={handleItemReview}
        onReset={handleReset}
        reviewNotes={reviewNotes}
        onReviewNotesChange={setReviewNotes}
        isPaused={isPaused}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={currentIndex >= items.length - 1}
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Item {currentIndex + 1} of {items.length}
        </div>
      </div>

      {/* Session Complete Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Study Session Complete!</DialogTitle>
            <DialogDescription>
              Great job! Here's how you performed in this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {session && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{session.itemsReviewed}</div>
                  <p className="text-sm text-muted-foreground">Items Reviewed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {session.itemsReviewed > 0 ? Math.round((session.correctAnswers / session.itemsReviewed) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            )}
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href={`/active-project/${projectId}/flashcards`}>
                  Back to Dashboard
                </a>
              </Button>
              <Button className="flex-1" onClick={() => window.location.reload()}>
                Study Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

