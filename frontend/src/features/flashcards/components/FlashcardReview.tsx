/**
 * Real-time flashcard review component with live progress updates.
 */
"use client";

import { useState, useEffect } from 'react';
import { useStudyProgress } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudyStatsDisplay } from '@/components/shared/study-stats-display';
import { DIFFICULTY_COLORS, RATING_BUTTON_COLORS, RATING_LABELS, UI_CONSTANTS } from '@/constants/design-tokens';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: number;
  next_review?: string;
  flashcard_set: {
    id: string;
    title: string;
    project: {
      id: string;
      name: string;
    };
  };
}

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
}

export function FlashcardReview({ flashcards, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0,
  });
  
  const { reviewFlashcard, stats, isConnected } = useStudyProgress();
  
  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  
  useEffect(() => {
    // Reset session stats when flashcards change
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [flashcards]);

  const handleRating = async (rating: number) => {
    if (!currentCard) return;
    
    try {
      // Send review to server via WebSocket
      reviewFlashcard(currentCard.id, rating);
      
      // Update session stats
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (rating >= 3 ? 1 : 0),
        incorrect: prev.incorrect + (rating < 3 ? 1 : 0),
      }));
      
      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Session complete
        onComplete?.();
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS[1];
  };

  const getRatingButtonColor = (rating: number) => {
    return RATING_BUTTON_COLORS[rating as keyof typeof RATING_BUTTON_COLORS] || RATING_BUTTON_COLORS[3];
  };

  if (!currentCard) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-600">No flashcards available</h3>
          <p className="text-gray-500 mt-2">Create some flashcards to start studying!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live progress tracking' : 'Offline mode'}
          </span>
        </div>
        <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
          Difficulty {currentCard.difficulty}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className={UI_CONSTANTS.PROGRESS_BAR_HEIGHT} />
      </div>

      {/* Session stats */}
      <div className="flex justify-center gap-4 text-sm">
        <span className="text-blue-600">✅ {sessionStats.correct} correct</span>
        <span className="text-red-600">❌ {sessionStats.incorrect} incorrect</span>
        <span className="text-gray-600">📊 {sessionStats.reviewed} reviewed</span>
      </div>

      {/* Flashcard */}
      <Card className={UI_CONSTANTS.CARD_MIN_HEIGHT}>
        <CardHeader>
          <CardTitle className="text-center">
            {currentCard.flashcard_set.project.name} - {currentCard.flashcard_set.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{currentCard.question}</p>
          </div>

          {/* Answer */}
          {showAnswer && (
            <div className="text-center border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Answer</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{currentCard.answer}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!showAnswer ? (
              <Button 
                onClick={() => setShowAnswer(true)}
                className="px-8 py-2"
              >
                Show Answer
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-4">How well did you know this?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      className={`w-12 h-12 rounded-full text-white font-bold ${getRatingButtonColor(rating)}`}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-center gap-8 text-xs text-gray-500 mt-2">
                  {Object.entries(RATING_LABELS).map(([rating, label]) => (
                    <span key={rating}>{rating} - {label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Global study stats */}
      {stats && (
        <StudyStatsDisplay stats={stats} />
      )}
    </div>
  );
}
