"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, RotateCcw, Check, X, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useProjectFlashcards,
  DueCardsResponse,
} from "../hooks/use-project-flashcards";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  learning_state: string;
  interval: number;
  repetitions: number;
  ease_factor: number;
}

export default function StudySession() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { getDueCards, submitReview } = useProjectFlashcards(projectId);

  const [session, setSession] = useState<DueCardsResponse | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadStudySession();
  }, [projectId]);

  useEffect(() => {
    // Keyboard shortcuts for review ratings
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showAnswer) return;

      switch (event.key) {
        case "1":
          handleQualityRating(1);
          break;
        case "2":
          handleQualityRating(2);
          break;
        case "3":
          handleQualityRating(3);
          break;
        case "4":
          handleQualityRating(4);
          break;
        case "5":
          handleQualityRating(5);
          break;
        case " ":
          event.preventDefault();
          handleQualityRating(4); // Space = Good
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [showAnswer]);

  const loadStudySession = async () => {
    try {
      setIsLoading(true);
      const dueCardsData = await getDueCards(20);
      setSession(dueCardsData);
      setStartTime(Date.now());
    } catch (err: any) {
      console.error("Failed to load study session:", err);
      setError(err.message || "Failed to load study session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    if (!session || currentCardIndex >= session.session_cards.length) return;

    const currentCard = session.session_cards[currentCardIndex];
    const responseTime = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      // Submit review to backend
      await submitReview(currentCard.id, quality, responseTime);

      // Update session stats
      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
      }));

      // Move to next card
      if (currentCardIndex + 1 < session.session_cards.length) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
        setStartTime(Date.now());
      } else {
        // Session complete
        router.push(`/projects/${projectId}/flashcards?session_complete=true`);
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      // Could show error message to user
    }
  };

  const resetCard = async () => {
    if (!session || currentCardIndex >= session.session_cards.length) return;

    const currentCard = session.session_cards[currentCardIndex];

    try {
      // This would need a reset endpoint
      // await axiosInstance.post(`/api/generation/flashcards/${currentCard.id}/reset/`);
      console.log("Reset card functionality would go here");
    } catch (err: any) {
      console.error("Failed to reset card:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button asChild className="mt-4">
          <Link href={`/projects/${projectId}/flashcards`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Link>
        </Button>
      </div>
    );
  }

  if (!session || session.session_cards.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No cards due for review
        </h2>
        <p className="text-gray-600 mb-6">
          Great job! You're all caught up with your flashcards.
        </p>
        <Button asChild>
          <Link href={`/projects/${projectId}/flashcards`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Link>
        </Button>
      </div>
    );
  }

  const currentCard = session.session_cards[currentCardIndex];
  const progress =
    ((currentCardIndex + 1) / session.session_cards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost">
          <Link href={`/projects/${projectId}/flashcards`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Link>
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Study Session</h1>
          <p className="text-sm text-slate-600">
            Card {currentCardIndex + 1} of {session.session_cards.length}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>{sessionStats.reviewed} reviewed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{sessionStats.correct} correct</span>
          <span>{sessionStats.incorrect} incorrect</span>
        </div>
      </div>

      {/* Flashcard */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Question */}
            <div>
              <h2 className="text-xl font-medium text-slate-900 mb-4">
                Question
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            {/* Answer */}
            {showAnswer && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  Answer
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Show Answer
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleQualityRating(1)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Again (1)
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(3)}
                    variant="outline"
                    className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                  >
                    Hard (3)
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(4)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Good (4)
                  </Button>
                  <Button
                    onClick={() => handleQualityRating(5)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Easy (5)
                  </Button>
                </div>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            {showAnswer && (
              <div className="text-xs text-slate-500">
                <p>Keyboard shortcuts: 1-5 for ratings, Space for Good</p>
              </div>
            )}

            {/* Reset Card */}
            {showAnswer && (
              <Button
                onClick={resetCard}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Card
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {sessionStats.reviewed}
              </div>
              <div className="text-xs text-slate-600">Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sessionStats.correct}
              </div>
              <div className="text-xs text-slate-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {sessionStats.incorrect}
              </div>
              <div className="text-xs text-slate-600">Incorrect</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
