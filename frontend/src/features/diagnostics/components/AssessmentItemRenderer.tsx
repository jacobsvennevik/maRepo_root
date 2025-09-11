'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import type { AssessmentItem } from '@/features/diagnostics/types/assessment';

interface AssessmentItemRendererProps {
  item: AssessmentItem;
  isFlipped?: boolean;
  showHint?: boolean;
  onFlip?: () => void;
  onToggleHint?: () => void;
  onReview?: (review: any) => void;
  onReset?: () => void;
  reviewNotes?: string;
  onReviewNotesChange?: (notes: string) => void;
  isPaused?: boolean;
}

export function AssessmentItemRenderer({ 
  item, 
  isFlipped = false, 
  showHint = false, 
  onFlip, 
  onToggleHint, 
  onReview, 
  onReset,
  reviewNotes = '',
  onReviewNotesChange,
  isPaused = false
}: AssessmentItemRendererProps) {
  const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [responseTime, setResponseTime] = React.useState<number>(0);
  const [startTime] = React.useState<Date>(new Date());

  const handleChoiceSelect = (choiceIndex: number) => {
    if (selectedChoice !== null) return; // Already answered
    
    setSelectedChoice(choiceIndex);
    setShowAnswer(true);
    
    const endTime = new Date();
    const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
    setResponseTime(timeSpent);
    
    // Submit review after a short delay to show the answer
    setTimeout(() => {
      if (onReview) {
        onReview({
          selected_index: choiceIndex,
          response_time_ms: Math.round(timeSpent * 1000),
          is_correct: choiceIndex === item.correct_index
        });
      }
    }, 2000);
  };

  const getQualityButtonLabel = (quality: number) => {
    const labels = {
      0: 'Complete Blackout',
      1: 'Incorrect - Easy',
      2: 'Incorrect - Hesitant',
      3: 'Correct - Difficult',
      4: 'Correct - Hesitant',
      5: 'Perfect',
    };
    return labels[quality as keyof typeof labels];
  };

  const getQualityButtonVariant = (quality: number) => {
    if (quality >= 4) return 'default';
    if (quality >= 3) return 'secondary';
    if (quality >= 1) return 'outline';
    return 'destructive';
  };

  const handleFlashcardReview = (quality: number) => {
    if (onReview) {
      const endTime = new Date();
      const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      onReview({
        quality,
        response_time_seconds: timeSpent,
        notes: reviewNotes
      });
    }
  };

  const renderFlashcard = () => (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{item.algorithm.toUpperCase()}</Badge>
            <Badge variant="secondary">{item.learning_state}</Badge>
            {item.interval > 1 && (
              <Badge variant="outline">Interval: {item.interval}d</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
            >
              {showHint ? <EyeOff className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFlip}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Question Side */}
        {!isFlipped && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="text-lg font-medium text-muted-foreground">Question</div>
            <div className="text-2xl font-semibold leading-relaxed max-w-2xl">
              {item.question}
            </div>
            {showHint && item.hints && item.hints.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Hint</div>
                <div className="text-sm text-blue-700">{item.hints[0]}</div>
              </div>
            )}
          </div>
        )}

        {/* Answer Side */}
        {isFlipped && (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <div className="text-lg font-medium text-muted-foreground">Answer</div>
            <div className="text-2xl font-semibold leading-relaxed max-w-2xl">
              {item.answer}
            </div>
            
            {/* Review Notes Input */}
            {onReviewNotesChange && (
              <div className="w-full max-w-md">
                <Label htmlFor="review-notes">Add notes (optional)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add your thoughts about this card..."
                  value={reviewNotes}
                  onChange={(e) => onReviewNotesChange(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {/* Quality Rating Buttons */}
            {onReview && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  How well did you know this?
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((quality) => (
                    <Button
                      key={quality}
                      variant={getQualityButtonVariant(quality)}
                      size="sm"
                      onClick={() => handleFlashcardReview(quality)}
                      className="flex flex-col items-center justify-center h-16 px-2"
                    >
                      <div className="text-lg font-bold">{quality}</div>
                      <div className="text-xs text-center leading-tight">
                        {getQualityButtonLabel(quality).split(' ')[0]}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMCQ = () => (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">MCQ</Badge>
            <Badge variant="secondary">{item.difficulty}</Badge>
            <Badge variant="outline">{item.bloom_level}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {responseTime > 0 ? `${responseTime.toFixed(1)}s` : 'Timing...'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Question */}
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
          <div className="text-lg font-medium text-muted-foreground">Question</div>
          <div className="text-2xl font-semibold leading-relaxed max-w-2xl">
            {item.question}
          </div>
          
          {/* Choices */}
          <div className="w-full max-w-md space-y-3">
            {item.choices?.map((choice, index) => (
              <Button
                key={index}
                variant={
                  selectedChoice === index
                    ? (index === item.correct_index ? 'default' : 'destructive')
                    : 'outline'
                }
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleChoiceSelect(index)}
                disabled={selectedChoice !== null}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                  </div>
                  <span className="text-base">{choice}</span>
                  {selectedChoice === index && (
                    <div className="ml-auto">
                      {index === item.correct_index ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
          
          {/* Answer Explanation */}
          {showAnswer && item.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl">
              <div className="text-sm font-medium text-blue-800 mb-2">Explanation</div>
              <div className="text-sm text-blue-700">{item.explanation}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTrueFalse = () => (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">True/False</Badge>
            <Badge variant="secondary">{item.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
          <div className="text-lg font-medium text-muted-foreground">Question</div>
          <div className="text-2xl font-semibold leading-relaxed max-w-2xl">
            {item.question}
          </div>
          
          <div className="flex space-x-4">
            <Button
              variant={selectedChoice === 0 ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleChoiceSelect(0)}
              disabled={selectedChoice !== null}
              className="px-8 py-4"
            >
              True
            </Button>
            <Button
              variant={selectedChoice === 1 ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleChoiceSelect(1)}
              disabled={selectedChoice !== null}
              className="px-8 py-4"
            >
              False
            </Button>
          </div>
          
          {showAnswer && item.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl">
              <div className="text-sm font-medium text-blue-800 mb-2">Explanation</div>
              <div className="text-sm text-blue-700">{item.explanation}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderFillBlank = () => (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Fill in the Blank</Badge>
            <Badge variant="secondary">{item.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
          <div className="text-lg font-medium text-muted-foreground">Question</div>
          <div className="text-2xl font-semibold leading-relaxed max-w-2xl">
            {item.question}
          </div>
          
          <div className="w-full max-w-md">
            <Label htmlFor="fill-blank-answer">Your Answer</Label>
            <Textarea
              id="fill-blank-answer"
              placeholder="Type your answer here..."
              className="mt-2"
              disabled={showAnswer}
            />
          </div>
          
          {showAnswer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-2xl">
              <div className="text-sm font-medium text-blue-800 mb-2">Correct Answer</div>
              <div className="text-sm text-blue-700">{item.answer}</div>
              {item.explanation && (
                <>
                  <div className="text-sm font-medium text-blue-800 mb-2 mt-4">Explanation</div>
                  <div className="text-sm text-blue-700">{item.explanation}</div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render based on item type
  switch (item.item_type) {
    case 'FLASHCARD':
      return renderFlashcard();
    case 'MCQ':
      return renderMCQ();
    case 'TRUE_FALSE':
      return renderTrueFalse();
    case 'FILL_BLANK':
      return renderFillBlank();
    default:
      return (
        <Card className="min-h-[400px] flex flex-col">
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                Unsupported Assessment Type
              </div>
              <div className="text-sm text-muted-foreground">
                {item.item_type} is not yet supported
              </div>
            </div>
          </CardContent>
        </Card>
      );
  }
}

