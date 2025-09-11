'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  BarChart3, 
  FileText, 
  CheckCircle, 
  Brain,
  Award,
  Sparkles,
  Edit3,
  ArrowRight,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProcessedTest {
  id: number;
  original_text: string;
  metadata: {
    source_file: string;
    test_type?: string;
    course?: string;
    total_points?: number;
    duration?: string;
    question_types?: {
      type: string;
      count: number;
      points: number;
    }[];
    topics_covered?: string[];
    difficulty_level?: string;
    estimated_study_time?: string;
    key_concepts?: string[];
    error?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface TestExtractionResultsStepProps {
  extractedTests: ProcessedTest[];
  fileNames: string[];
  onConfirm: () => void;
  onEdit?: () => void;
  isTestMode?: boolean;
}

export function TestExtractionResultsStep({ 
  extractedTests, 
  fileNames, 
  onConfirm, 
  onEdit,
  isTestMode = false 
}: TestExtractionResultsStepProps) {
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [showAllTopics, setShowAllTopics] = useState<Record<number, boolean>>({});
  const [showAllConcepts, setShowAllConcepts] = useState<Record<number, boolean>>({});

  const toggleTestExpansion = (testId: number) => {
    setExpandedTest(prev => prev === testId ? null : testId);
  };

  const toggleTopics = (testId: number) => {
    setShowAllTopics(prev => ({ ...prev, [testId]: !prev[testId] }));
  };

  const toggleConcepts = (testId: number) => {
    setShowAllConcepts(prev => ({ ...prev, [testId]: !prev[testId] }));
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTestTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'midterm exam': return <Award className="h-4 w-4 text-orange-500" />;
      case 'final exam': return <Award className="h-4 w-4 text-red-500" />;
      case 'quiz': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'practice test': return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  const completedTests = extractedTests.filter(test => test.status === 'completed');
  const errorTests = extractedTests.filter(test => test.status === 'error');
  const totalTopics = completedTests.reduce((sum, test) => sum + (test.metadata.topics_covered?.length || 0), 0);
  const totalQuestions = completedTests.reduce((sum, test) => 
    sum + (test.metadata.question_types?.reduce((qSum, qt) => qSum + qt.count, 0) || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-sm">🧪</span>
            <span className="text-yellow-800 text-sm font-medium">Test Mode - Test Analysis Results</span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            These results are from mock test analysis. Use these insights to plan your study strategy.
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Test Analysis Complete!</h2>
          <p className="text-sm text-gray-600 mt-1">
            We've analyzed {completedTests.length} test {completedTests.length === 1 ? 'file' : 'files'} and identified patterns for your study plan
          </p>
        </div>
      </div>

      {/* Error Summary */}
      {errorTests.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-sm">⚠️</span>
            <span className="text-red-800 text-sm font-medium">
              {errorTests.length} file{errorTests.length === 1 ? '' : 's'} could not be processed
            </span>
          </div>
          <p className="text-red-700 text-xs mt-1">
            These files may be corrupted or in an unsupported format. You can try uploading them again.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {completedTests.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{completedTests.length}</div>
                <div className="text-xs text-gray-600">Tests Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-xs text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalTopics}</div>
                <div className="text-xs text-gray-600">Topics Covered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(completedTests.reduce((sum, test) => {
                    const timeStr = test.metadata.estimated_study_time || '0';
                    const hours = parseInt(timeStr.split('-')[0]) || 0;
                    return sum + hours;
                  }, 0) / Math.max(completedTests.length, 1))}h
                </div>
                <div className="text-xs text-gray-600">Avg Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Test Results */}
      <div className="space-y-4">
        {completedTests.length > 0 && (
          <h3 className="text-lg font-semibold text-gray-900">
            Individual Test Results
          </h3>
        )}
        
        {completedTests.map((test) => (
          <Card key={test.id} className="border-gray-200 hover:border-purple-300 transition-colors">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleTestExpansion(test.id)}
            >
              <div className="flex items-center gap-3">
                {getTestTypeIcon(test.metadata.test_type)}
                <div>
                  <CardTitle className="text-base font-medium">
                    {test.metadata.test_type || 'Test'}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{test.metadata.source_file}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.metadata.difficulty_level && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDifficultyColor(test.metadata.difficulty_level)}`}
                  >
                    {test.metadata.difficulty_level}
                  </Badge>
                )}
                {test.metadata.total_points && (
                  <Badge variant="outline" className="text-xs">
                    {test.metadata.total_points} pts
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            {expandedTest === test.id && (
              <CardContent className="space-y-4">
                {/* Test Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Test Details
                    </h4>
                    {test.metadata.course && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Course:</span>
                        <span className="text-sm font-medium">{test.metadata.course}</span>
                      </div>
                    )}
                    {test.metadata.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.metadata.duration}
                        </span>
                      </div>
                    )}
                    {test.metadata.estimated_study_time && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Study Time:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {test.metadata.estimated_study_time}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Question Types */}
                  {test.metadata.question_types && test.metadata.question_types.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Question Types
                      </h4>
                      <div className="space-y-2">
                        {test.metadata.question_types.map((qt, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">{qt.type}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {qt.count} Q
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {qt.points} pts
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Topics Covered */}
                {test.metadata.topics_covered && test.metadata.topics_covered.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Topics Covered ({test.metadata.topics_covered.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {test.metadata.topics_covered
                        .slice(0, showAllTopics[test.id] ? undefined : 6)
                        .map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    {test.metadata.topics_covered.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTopics(test.id)}
                        className="text-xs"
                      >
                        {showAllTopics[test.id] 
                          ? 'Show less' 
                          : `Show ${test.metadata.topics_covered.length - 6} more topics`
                        }
                      </Button>
                    )}
                  </div>
                )}

                {/* Key Concepts */}
                {test.metadata.key_concepts && test.metadata.key_concepts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Key Concepts ({test.metadata.key_concepts.length})
                    </h4>
                    <div className="space-y-2">
                      {test.metadata.key_concepts
                        .slice(0, showAllConcepts[test.id] ? undefined : 4)
                        .map((concept, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                          <span className="text-sm font-medium">{concept}</span>
                        </div>
                      ))}
                    </div>
                    {test.metadata.key_concepts.length > 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleConcepts(test.id)}
                        className="text-xs"
                      >
                        {showAllConcepts[test.id] 
                          ? 'Show less' 
                          : `Show ${test.metadata.key_concepts.length - 4} more concepts`
                        }
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {onEdit && (
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Analysis
          </Button>
        )}
        <Button 
          onClick={onConfirm}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <CheckCircle className="h-4 w-4" />
          Use This Analysis
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          This analysis will help us create personalized study materials and practice questions based on your test patterns.
        </p>
      </div>
    </div>
  );
}
