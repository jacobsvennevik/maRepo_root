'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle, 
  GraduationCap,
  Award,
  Sparkles,
  Edit3,
  ArrowRight
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ExtractedData {
  courseName?: string;
  instructor?: string;
  semester?: string;
  credits?: number;
  topics: {
    id: string;
    label: string;
    confidence: number;
  }[];
  dates: {
    id: string;
    date: string;
    description: string;
    type: string;
    weight?: number;
  }[];
  testTypes: {
    id: string;
    type: string;
    confidence: number;
  }[];
  grading: {
    category: string;
    weight: number;
  }[];
  // Additional fields from real API response
  location?: string;
  meetingTimes?: string;
  officeHours?: string;
  materials?: string[];
  courseDescription?: string;
  contactInfo?: string;
  learningOutcomes?: string[];
  otherInfo?: string;
}

interface ExtractionResultsStepProps {
  extractedData: ExtractedData;
  fileName: string;
  onConfirm: () => void;
  onEdit?: () => void;
  isTestMode?: boolean;
}

export function ExtractionResultsStep({ 
  extractedData, 
  fileName, 
  onConfirm, 
  onEdit,
  isTestMode = false 
}: ExtractionResultsStepProps) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <Award className="h-4 w-4 text-red-500" />;
      case 'quiz': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'assignment': return <Edit3 className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatDate = (dateString: string) => {
    // Handle special cases
    if (!dateString || dateString === 'TBD' || dateString === 'Not specified') {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if date is invalid
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalItems = extractedData.topics.length + extractedData.dates.length + extractedData.testTypes.length;

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-sm">🧪</span>
            <span className="text-yellow-800 text-sm font-medium">Test Mode - Extraction Results</span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            These results are from mock data analysis. Project will be created after you confirm.
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Extraction Complete!</h2>
          <p className="text-sm text-gray-600 mt-1">
            We've analyzed <span className="font-medium">{fileName}</span> and found {totalItems} items
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{extractedData.topics.length}</div>
              <div className="text-xs text-gray-600">Topics Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{extractedData.dates.length}</div>
              <div className="text-xs text-gray-600">Important Dates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{extractedData.testTypes.length}</div>
              <div className="text-xs text-gray-600">Test Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{extractedData.grading.length}</div>
              <div className="text-xs text-gray-600">Grade Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Information */}
      {(extractedData.courseName || extractedData.instructor || extractedData.semester) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {extractedData.courseName && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Course Name:</span>
                <span className="text-sm text-gray-700">{extractedData.courseName}</span>
              </div>
            )}
            {extractedData.instructor && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Instructor:</span>
                <span className="text-sm text-gray-700">{extractedData.instructor}</span>
              </div>
            )}
            {extractedData.semester && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Semester:</span>
                <span className="text-sm text-gray-700">{extractedData.semester}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Extraction Results */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Topics */}
        {extractedData.topics.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
                Topics ({extractedData.topics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {extractedData.topics.slice(0, showAllTopics ? undefined : 5).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{topic.label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(topic.confidence)}`}
                          >
                            {topic.confidence}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Confidence Score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
              {extractedData.topics.length > 5 && !showAllTopics && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllTopics(true)}
                  className="w-full mt-2 text-xs"
                >
                  Show {extractedData.topics.length - 5} more topics
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Dates */}
        {extractedData.dates.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Important Dates ({extractedData.dates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {extractedData.dates.slice(0, showAllDates ? undefined : 5).map((date) => (
                  <div key={date.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(date.type)}
                      <div>
                        <div className="text-sm font-medium">{date.description}</div>
                        <div className="text-xs text-gray-500">{formatDate(date.date)}</div>
                      </div>
                    </div>
                    {date.weight && (
                      <Badge variant="outline" className="text-xs">
                        {date.weight}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {extractedData.dates.length > 5 && !showAllDates && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllDates(true)}
                  className="w-full mt-2 text-xs"
                >
                  Show {extractedData.dates.length - 5} more dates
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Test Types & Grading */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Types */}
        {extractedData.testTypes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-purple-600" />
                Assessment Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extractedData.testTypes.map((testType) => (
                  <div key={testType.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{testType.type}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(testType.confidence)}`}
                    >
                      {testType.confidence}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grading Breakdown */}
        {extractedData.grading.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-orange-600" />
                Grading Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extractedData.grading.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{grade.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {grade.weight}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
            Edit Details
          </Button>
        )}
        <Button 
          onClick={onConfirm}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        >
          <CheckCircle className="h-4 w-4" />
          Looks Good - Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Review the extracted information above. You can edit details later or proceed to set up your study schedule.
        </p>
      </div>
    </div>
  );
} 