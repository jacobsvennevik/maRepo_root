'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  BookOpen,
  Zap,
  Brain
} from "lucide-react";
import { formatDate } from '../../services/formatters';

interface DetectedTopic {
  id: string;
  label: string;
  confidence: number;
}

interface DetectedDate {
  id: string;
  date: string;
  description: string;
  type: string;
}

interface DetectedTestType {
  id: string;
  type: string;
  confidence: number;
}

interface SmartRecommendation {
  id: string;
  type: 'schedule' | 'material' | 'strategy' | 'timeline';
  title: string;
  description: string;
  confidence: number;
  action: string;
}

interface AIPreviewProps {
  detectedTopics: DetectedTopic[];
  detectedDates: DetectedDate[];
  detectedTestTypes: DetectedTestType[];
  onApplyTopics: (topics: string[]) => void;
  onApplyDates: (dates: DetectedDate[]) => void;
  onApplyTestTypes: (testTypes: string[]) => void;
  onApplyRecommendations: (recommendations: SmartRecommendation[]) => void;
  onDismiss: () => void;
}

export function AIPreview({
  detectedTopics,
  detectedDates,
  detectedTestTypes,
  onApplyTopics,
  onApplyDates,
  onApplyTestTypes,
  onApplyRecommendations,
  onDismiss
}: AIPreviewProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTestTypes, setSelectedTestTypes] = useState<string[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);

  // Auto-select high-confidence items
  useEffect(() => {
    const highConfidenceTopics = detectedTopics
      .filter(topic => topic.confidence >= 90)
      .map(topic => topic.id);
    setSelectedTopics(highConfidenceTopics);

    const highConfidenceDates = detectedDates
      .filter(date => date.type === 'exam' || date.type === 'assignment')
      .map(date => date.id);
    setSelectedDates(highConfidenceDates);

    const highConfidenceTestTypes = detectedTestTypes
      .filter(type => type.confidence >= 85)
      .map(type => type.id);
    setSelectedTestTypes(highConfidenceTestTypes);
  }, [detectedTopics, detectedDates, detectedTestTypes]);

  // Generate smart recommendations
  useEffect(() => {
    const recommendations: SmartRecommendation[] = [];
    
    // Study schedule recommendations
    if (detectedDates.length > 0) {
      recommendations.push({
        id: 'schedule-1',
        type: 'schedule',
        title: 'Optimized Study Schedule',
        description: `Based on ${detectedDates.length} detected dates, we recommend a spaced repetition schedule with review sessions before each deadline.`,
        confidence: 92,
        action: 'Apply 3-week study schedule'
      });
    }

    // Material recommendations
    if (detectedTopics.length > 0) {
      recommendations.push({
        id: 'material-1',
        type: 'material',
        title: 'Focused Study Materials',
        description: `Create flashcards and practice tests for the ${detectedTopics.length} detected topics with highest confidence scores.`,
        confidence: 88,
        action: 'Generate study materials'
      });
    }

    // Strategy recommendations
    if (detectedTestTypes.length > 0) {
      recommendations.push({
        id: 'strategy-1',
        type: 'strategy',
        title: 'Test Preparation Strategy',
        description: `Based on detected test types, we recommend a mix of practice tests and concept review sessions.`,
        confidence: 85,
        action: 'Apply test strategy'
      });
    }

    setSmartRecommendations(recommendations);
  }, [detectedTopics, detectedDates, detectedTestTypes]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleDateToggle = (dateId: string) => {
    setSelectedDates(prev => 
      prev.includes(dateId) 
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    );
  };

  const handleTestTypeToggle = (testTypeId: string) => {
    setSelectedTestTypes(prev => 
      prev.includes(testTypeId) 
        ? prev.filter(id => id !== testTypeId)
        : [...prev, testTypeId]
    );
  };

  const handleRecommendationToggle = (recommendationId: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(recommendationId) 
        ? prev.filter(id => id !== recommendationId)
        : [...prev, recommendationId]
    );
  };

  const handleApplyAll = () => {
    const selectedTopicObjects = detectedTopics.filter(topic => selectedTopics.includes(topic.id));
    const selectedDateObjects = detectedDates.filter(date => selectedDates.includes(date.id));
    const selectedTestTypeObjects = detectedTestTypes.filter(testType => selectedTestTypes.includes(testType.id));
    const selectedRecommendationObjects = smartRecommendations.filter(rec => selectedRecommendations.includes(rec.id));

    onApplyTopics(selectedTopics);
    onApplyDates(selectedDateObjects);
    onApplyTestTypes(selectedTestTypes);
    onApplyRecommendations(selectedRecommendationObjects);
    onDismiss();
  };

  const handleOneClickSetup = () => {
    // Auto-select all high-confidence items
    const allTopicIds = detectedTopics.map(t => t.id);
    const allDateIds = detectedDates.map(d => d.id);
    const allTestTypeIds = detectedTestTypes.map(t => t.id);
    const allRecommendationIds = smartRecommendations.map(r => r.id);

    setSelectedTopics(allTopicIds);
    setSelectedDates(allDateIds);
    setSelectedTestTypes(allTestTypeIds);
    setSelectedRecommendations(allRecommendationIds);

    // Apply everything immediately
    setTimeout(() => {
      handleApplyAll();
    }, 500);
  };

  const totalDetections = detectedTopics.length + detectedDates.length + detectedTestTypes.length;
  const totalSelected = selectedTopics.length + selectedDates.length + selectedTestTypes.length + selectedRecommendations.length;

  if (totalDetections === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg text-blue-900">
            AI Analysis Complete! 🎉
          </CardTitle>
        </div>
        <p className="text-sm text-blue-700">
          We found {totalDetections} items and generated smart recommendations. High-confidence items are pre-selected:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detected Topics */}
        {detectedTopics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Detected Topics ({detectedTopics.length})</h4>
              <Badge variant="outline" className="text-xs">
                {selectedTopics.length} selected
              </Badge>
            </div>
            <div className="space-y-2">
              {detectedTopics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-200">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                  />
                  <label htmlFor={topic.id} className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">{topic.label}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {topic.confidence}% confidence
                    </Badge>
                    {topic.confidence >= 90 && (
                      <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800">
                        Auto-selected
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Dates */}
        {detectedDates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900">Detected Dates ({detectedDates.length})</h4>
              <Badge variant="outline" className="text-xs">
                {selectedDates.length} selected
              </Badge>
            </div>
            <div className="space-y-2">
              {detectedDates.map((date) => (
                <div key={date.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-green-200">
                  <Checkbox
                    id={date.id}
                    checked={selectedDates.includes(date.id)}
                    onCheckedChange={() => handleDateToggle(date.id)}
                  />
                  <label htmlFor={date.id} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{date.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {date.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{formatDate(date.date)}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Test Types */}
        {detectedTestTypes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <h4 className="font-medium text-orange-900">Detected Test Types ({detectedTestTypes.length})</h4>
              <Badge variant="outline" className="text-xs">
                {selectedTestTypes.length} selected
              </Badge>
            </div>
            <div className="space-y-2">
              {detectedTestTypes.map((testType) => (
                <div key={testType.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-orange-200">
                  <Checkbox
                    id={testType.id}
                    checked={selectedTestTypes.includes(testType.id)}
                    onCheckedChange={() => handleTestTypeToggle(testType.id)}
                  />
                  <label htmlFor={testType.id} className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">{testType.type}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {testType.confidence}% confidence
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Recommendations */}
        {smartRecommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <h4 className="font-medium text-purple-900">Smart Recommendations ({smartRecommendations.length})</h4>
              <Badge variant="outline" className="text-xs">
                {selectedRecommendations.length} selected
              </Badge>
            </div>
            <div className="space-y-2">
              {smartRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Checkbox
                    id={recommendation.id}
                    checked={selectedRecommendations.includes(recommendation.id)}
                    onCheckedChange={() => handleRecommendationToggle(recommendation.id)}
                  />
                  <label htmlFor={recommendation.id} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-purple-900">{recommendation.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-purple-700">{recommendation.description}</p>
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        {recommendation.action}
                      </Badge>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleOneClickSetup}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            One-Click Setup
          </Button>
          <Button 
            onClick={handleApplyAll}
            disabled={totalSelected === 0}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Apply Selected ({totalSelected})
          </Button>
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}