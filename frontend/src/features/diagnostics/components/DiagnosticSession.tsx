'use client';

import React, { useState, useEffect, useRef } from 'react';
import { axiosApi } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Target, Brain, AlertTriangle } from 'lucide-react';

interface DiagnosticQuestion {
  id: string;
  type: 'MCQ' | 'SHORT_ANSWER' | 'PRINCIPLE';
  text: string;
  choices?: string[];
  correct_choice_index?: number;
  acceptable_answers?: string[];
  explanation: string;
  concept_id: string;
  bloom_level: string;
}

interface DiagnosticSession {
  id: string;
  topic: string;
  delivery_mode: 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK';
  max_questions: number;
  time_limit_sec?: number;
  questions: DiagnosticQuestion[];
}

interface QuestionResponse {
  questionId: string;
  answer_text?: string;
  selected_choice_index?: number;
  confidence: number;
  latency_ms: number;
}

export default function DiagnosticSession({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const handleSubmitRef = useRef<() => void>();

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (session?.time_limit_sec) {
      setTimeRemaining(session.time_limit_sec);
    }
  }, [session]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Use the ref to call the latest version of handleSubmit
            handleSubmitRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Update the ref whenever handleSubmit changes
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const response = await axiosGeneration.get(`diagnostic-sessions/${sessionId}/`);
      setSession(response.data);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any, type: 'choice' | 'text') => {
    const existingResponseIndex = responses.findIndex(r => r.questionId === questionId);
    const latency = Date.now() - questionStartTime;

    if (existingResponseIndex >= 0) {
      const updatedResponses = [...responses];
      if (type === 'choice') {
        updatedResponses[existingResponseIndex] = {
          ...updatedResponses[existingResponseIndex],
          selected_choice_index: value,
          latency_ms: latency,
        };
      } else {
        updatedResponses[existingResponseIndex] = {
          ...updatedResponses[existingResponseIndex],
          answer_text: value,
          latency_ms: latency,
        };
      }
      setResponses(updatedResponses);
    } else {
      const newResponse: QuestionResponse = {
        questionId,
        confidence: 50,
        latency_ms: latency,
        ...(type === 'choice' ? { selected_choice_index: value } : { answer_text: value }),
      };
      setResponses([...responses, newResponse]);
    }
  };

  const handleConfidenceChange = (questionId: string, confidence: number[]) => {
    const existingResponseIndex = responses.findIndex(r => r.questionId === questionId);
    
    if (existingResponseIndex >= 0) {
      const updatedResponses = [...responses];
      updatedResponses[existingResponseIndex].confidence = confidence[0];
      setResponses(updatedResponses);
    } else {
      const newResponse: QuestionResponse = {
        questionId,
        confidence: confidence[0],
        latency_ms: Date.now() - questionStartTime,
      };
      setResponses([...responses, newResponse]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (session?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit all responses
      const payload = {
        session_id: sessionId,
        responses: responses.map(r => ({
          question_id: r.questionId,
          answer_text: r.answer_text,
          selected_choice_index: r.selected_choice_index,
          confidence: r.confidence,
          latency_ms: r.latency_ms,
        })),
      };
      const response = await axiosGeneration.post(`diagnostic-responses/`, payload);
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to submit responses:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  const getProgressPercentage = () => {
    if (!session) return 0;
    return ((currentQuestionIndex + 1) / session.questions.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
          <p className="mt-4 text-lg">Loading diagnostic session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load diagnostic session</AlertDescription>
      </Alert>
    );
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Diagnostic Complete!</CardTitle>
            <CardDescription>
              You've completed the diagnostic for "{session.topic}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(results.average_score * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {results.total_questions}
                </div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(results.median_confidence)}%
                </div>
                <div className="text-sm text-muted-foreground">Median Confidence</div>
              </div>
            </div>

            {session.delivery_mode === 'IMMEDIATE_FEEDBACK' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Review</h3>
                {session.questions.map((question, index) => {
                  const response = getCurrentResponse(question.id);
                  const isCorrect = response && (
                    question.type === 'MCQ' 
                      ? response.selected_choice_index === question.correct_choice_index
                      : response.answer_text && question.acceptable_answers?.some(
                          pattern => new RegExp(pattern, 'i').test(response.answer_text || '')
                        )
                  );

                  return (
                    <Card key={question.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{question.type}</Badge>
                              <Badge variant="outline">{question.bloom_level}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Question {index + 1}
                              </span>
                            </div>
                            <p className="font-medium">{question.text}</p>
                            
                            {question.type === 'MCQ' && question.choices && (
                              <div className="space-y-2">
                                {question.choices.map((choice, choiceIndex) => (
                                  <div
                                    key={choiceIndex}
                                    className={`p-2 rounded border ${
                                      choiceIndex === question.correct_choice_index
                                        ? 'border-green-500 bg-green-50'
                                        : choiceIndex === response?.selected_choice_index
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + choiceIndex)}.
                                    </span>{' '}
                                    {choice}
                                    {choiceIndex === question.correct_choice_index && (
                                      <CheckCircle className="inline h-4 w-4 text-green-600 ml-2" />
                                    )}
                                    {choiceIndex === response?.selected_choice_index && 
                                     choiceIndex !== question.correct_choice_index && (
                                      <XCircle className="inline h-4 w-4 text-red-600 ml-2" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {response?.answer_text && (
                              <div className="p-3 bg-muted rounded">
                                <div className="text-sm font-medium text-muted-foreground">
                                  Your answer:
                                </div>
                                <div className="mt-1">{response.answer_text}</div>
                              </div>
                            )}

                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="text-sm font-medium text-blue-800">Explanation:</div>
                              <div className="mt-1 text-blue-700">{question.explanation}</div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Your confidence: {response?.confidence}%</span>
                              <span>Response time: {Math.round((response?.latency_ms || 0) / 1000)}s</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="text-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentResponse = getCurrentResponse(currentQuestion.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{session.topic}</CardTitle>
              <CardDescription>
                Pre-lecture diagnostic • {session.max_questions} questions
              </CardDescription>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center space-x-2 text-lg font-mono">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className={timeRemaining < 60 ? 'text-red-600' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} of {session.questions.length}</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center space-x-3">
              <Badge variant="outline">{currentQuestion.type}</Badge>
              <Badge variant="outline">{currentQuestion.bloom_level}</Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-lg font-medium leading-relaxed">
              {currentQuestion.text}
            </div>

            {/* Question Content */}
            {currentQuestion.type === 'MCQ' && currentQuestion.choices && (
              <RadioGroup
                value={currentResponse?.selected_choice_index?.toString() || ''}
                onValueChange={(value) => 
                  handleAnswerChange(currentQuestion.id, parseInt(value), 'choice')
                }
                className="space-y-3"
              >
                {currentQuestion.choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <RadioGroupItem value={index.toString()} id={`choice-${index}`} />
                    <Label
                      htmlFor={`choice-${index}`}
                      className="flex-1 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {choice}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {(currentQuestion.type === 'SHORT_ANSWER' || currentQuestion.type === 'PRINCIPLE') && (
              <div className="space-y-3">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Type your answer here..."
                  value={currentResponse?.answer_text || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'text')}
                  className="min-h-[120px] resize-none"
                />
              </div>
            )}

            {/* Confidence Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>How confident are you in your answer?</Label>
                <span className="text-sm font-medium">
                  {currentResponse?.confidence || 50}%
                </span>
              </div>
              <Slider
                value={[currentResponse?.confidence || 50]}
                onValueChange={(value) => handleConfidenceChange(currentQuestion.id, value)}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {currentQuestionIndex === session.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || responses.length < session.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Diagnostic'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next Question
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {responses.length} of {session.questions.length} questions answered
      </div>
    </div>
  );
}
