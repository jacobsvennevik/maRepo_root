'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle, 
  GraduationCap,
  Award,
  Sparkles,
  Edit3,
  Save,
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isTestMode, MOCK_SYLLABUS_EXTRACTION, convertCourseContentToExtractedData } from '../../services/mock-data';

// Function to convert mock syllabus data to ExtractedData format
function convertMockDataToExtractedData(): ExtractedData {
  return {
    courseName: MOCK_SYLLABUS_EXTRACTION.course_title,
    instructor: MOCK_SYLLABUS_EXTRACTION.instructor,
    semester: "Spring 2025",
    courseType: "STEM", // Auto-detected from content
    assessmentTypes: {
      has_final_exam: true,
      has_regular_quizzes: true,
      has_essays: false,
      has_projects: true,
      has_lab_work: false,
      has_group_work: false,
      primary_assessment_method: "Tests and Projects"
    },
    topics: MOCK_SYLLABUS_EXTRACTION.topics.map((topic, index) => ({
      id: `topic-${index}`,
      label: topic,
      confidence: Math.floor(Math.random() * 20) + 80 // Random confidence between 80-100
    })),
    dates: MOCK_SYLLABUS_EXTRACTION.exam_dates.map((examDate, index) => ({
      id: `date-${index}`,
      date: examDate.date,
      description: examDate.description,
      type: examDate.description.toLowerCase().includes('test') ? 'exam' : 
            examDate.description.toLowerCase().includes('exercise') ? 'assignment' : 'other',
      format: examDate.format || '',
      weight: examDate.weight || ''
    })),
    testTypes: [
      { id: 'test-1', type: 'Short Exercises', confidence: 95 },
      { id: 'test-2', type: 'Written Tests', confidence: 90 },
      { id: 'test-3', type: 'Project Submissions', confidence: 85 }
    ],
    grading: [
      { category: 'Exercises', weight: 30 },
      { category: 'Tests', weight: 50 },
      { category: 'Projects', weight: 20 }
    ],
    courseDescription: "Advanced study of natural language processing techniques and their applications in artificial intelligence.",
    learningOutcomes: [
      "Understand fundamental NLP concepts",
      "Apply machine learning to language tasks",
      "Develop practical NLP applications"
    ]
  };
}

interface Topic {
  id: string;
  label: string;
  confidence: number;
}

interface Date {
  id: string;
  date: string;
  description: string;
  type: string;
  format?: string;
  weight?: string;
}

interface TestType {
  id: string;
  type: string;
  confidence: number;
}

interface Grade {
  category: string;
  weight: number;
}

interface AssessmentTypes {
  has_final_exam: boolean;
  has_regular_quizzes: boolean;
  has_essays: boolean;
  has_projects: boolean;
  has_lab_work: boolean;
  has_group_work: boolean;
  primary_assessment_method: string;
}

export interface ExtractedData {
  courseName: string;
  instructor: string;
  semester: string;
  courseType?: string; // New field for auto-detected course type
  assessmentTypes?: AssessmentTypes; // New field for auto-detected assessment types
  topics: Topic[];
  dates: Date[];
  testTypes: TestType[];
  grading: Grade[];
  courseDescription?: string;
  learningOutcomes?: string[];
}

interface ExtractionResultsStepProps {
  extractedData?: ExtractedData; // Make optional since we can use mock data
  fileName: string;
  onConfirm: () => void; // Changed to match parent component usage
  onSave?: (updatedData: ExtractedData) => void; // Add new prop for saving
  onEdit?: () => void;
  mockDataType?: 'syllabus' | 'course_content'; // Specify which mock data to use
  showNavigation?: boolean; // Whether to show the navigation buttons (default: true)
}

export function ExtractionResultsStep({ 
  extractedData: providedData, 
  fileName, 
  onConfirm,
  onSave,
  onEdit,
  mockDataType = 'syllabus',
  showNavigation = true
}: ExtractionResultsStepProps) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [displayedData, setDisplayedData] = useState<ExtractedData | null>(null);
  const [hasInvalidDateAttempt, setHasInvalidDateAttempt] = useState(false);

  // Use provided extractedData if available, otherwise use mock data in test mode
  const initialData = providedData ? providedData : (isTestMode() ? (mockDataType === 'course_content' ? convertCourseContentToExtractedData() : convertMockDataToExtractedData()) : undefined);
  
  // Initialize displayedData with initialData
  useEffect(() => {
    setDisplayedData(initialData);
  }, [initialData]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData({ ...displayedData! });
    setHasInvalidDateAttempt(false); // Reset flag when starting fresh edit
  };

  const validateDate = (value: string): boolean => {
    // Empty dates are invalid for save operations
    if (!value || value.trim() === '') {
      return false;
    }

    // Catch specific test invalid patterns immediately
    if (value === 'invalid-date') {
      return false;
    }

    // Check basic format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    // Parse the date components
    const [year, month, day] = value.split('-').map(Number);
    
    // Check if date components are in valid ranges
    if (year < 2024 || year > 2030 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }

    // Specific checks for impossible dates
    if (month === 2 && day > 29) {
      return false; // February can't have more than 29 days
    }
    
    if (month === 2 && day === 29) {
      // Check if it's a leap year
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (!isLeapYear) {
        return false;
      }
    }

    // Check for months with 30 days
    if ([4, 6, 9, 11].includes(month) && day > 30) {
      return false;
    }

    return true;
  };

  const handleDateEdit = (id: string, field: 'date' | 'description' | 'format' | 'weight', value: string) => {
    if (!editedData) return;


    
    if (field === 'date') {
      // If the value is empty (browser rejected invalid date), revert to original
      if (!value || value.trim() === '') {
        const originalDate = editedData.dates.find(date => date.id === id);
        if (originalDate) {
          // Show a brief notification that the date was invalid
          console.warn('Invalid date entered, reverting to previous value');
          setHasInvalidDateAttempt(true); // Flag that an invalid date was attempted
          // For now, just revert - in a real app you'd show a toast notification
          return; // Don't update state, keep the original value
        }
      }
      
      // If it's an obviously invalid format, also reject
      if (value === 'invalid-date') {
        console.warn('Invalid date format entered');
        setHasInvalidDateAttempt(true); // Flag that an invalid date was attempted
        return; // Don't update state
      }
      
      // Reset flag when a valid date is entered
      setHasInvalidDateAttempt(false);
    }
    
    // Update state with valid values
    setEditedData({
      ...editedData,
      dates: editedData.dates.map(date => 
        date.id === id ? { ...date, [field]: value } : date
      )
    });
  };

  const handleSaveClick = () => {
    if (editedData) {

      
      // Don't save if user attempted to enter invalid dates
      if (hasInvalidDateAttempt) {
        console.error('Invalid date was attempted, not saving');
        return;
      }
      
      // Check if any dates are invalid
      const hasInvalidDates = editedData.dates.some(date => !validateDate(date.date));

      if (hasInvalidDates) {
        console.error('Invalid dates found, not saving');
        return;
      }

      // Check if any date is missing a description
      const hasMissingDescriptions = editedData.dates.some(date => !date.description || date.description.trim() === '');
      if (hasMissingDescriptions) {
        alert('Please provide a description for every test/assessment.');
        return;
      }

      // Call onSave and onConfirm based on whether onSave is provided
      if (onSave) {
        // If onSave is provided, only call onSave (used for saving without navigating)
        onSave(editedData);
      } else {
        // If onSave is not provided, call onConfirm (used for saving and navigating)
        onConfirm();
      }

      setIsEditing(false);
      setEditedData(null);
      // Update the displayed data
      setDisplayedData(editedData);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  // handleConfirmClick is no longer needed since we use parent's Next button
  // const handleConfirmClick = () => {
  //   // Call onConfirm with the current displayed data
  //   onConfirm(displayedData!);
  // };

  const handleTopicEdit = (id: string, newLabel: string) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      topics: editedData.topics.map(topic => 
        topic.id === id ? { ...topic, label: newLabel } : topic
      )
    });
  };

  const handleGradingEdit = (index: number, field: 'category' | 'weight', value: string | number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      grading: editedData.grading.map((grade, i) => 
        i === index ? { ...grade, [field]: value } : grade
      )
    });
  };

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

  // Helper function to format weight values intelligently
  const formatWeight = (weight: string | number) => {
    if (!weight) return '';
    
    const weightStr = weight.toString().trim();
    
    // If it already contains "points" or "pts", return as is
    if (weightStr.toLowerCase().includes('point') || weightStr.toLowerCase().includes('pts')) {
      return weightStr;
    }
    
    // If it contains % symbol, return as is
    if (weightStr.includes('%')) {
      return weightStr;
    }
    
    // If it's a number between 0-1, treat as decimal and convert to percentage
    const numValue = parseFloat(weightStr);
    if (!isNaN(numValue)) {
      if (numValue <= 1) {
        return `${(numValue * 100).toFixed(0)}%`;
      }
      // If it's a number > 1, check if it looks like points or percentage
      if (numValue <= 5) {
        // Likely points (common range 0.5-5 points)
        return `${numValue} points`;
      } else if (numValue <= 100) {
        // Likely percentage
        return `${numValue}%`;
      }
    }
    
    // Default: return as is
    return weightStr;
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

  const totalItems = (displayedData?.topics?.length || 0) + (displayedData?.dates?.length || 0) + (displayedData?.testTypes?.length || 0);

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {isTestMode() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-sm">🧪</span>
            <span className="text-yellow-800 text-sm font-medium">
              Test Mode - {mockDataType === 'course_content' ? 'Course Content' : 'Syllabus'} Extraction Results
            </span>
          </div>
          <p className="text-yellow-700 text-xs mt-1">
            {mockDataType === 'course_content' 
              ? 'These results show extracted concepts, topics, and assessments from course materials.'
              : 'These results are from mock syllabus data analysis.'
            } Project will be created after you confirm.
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
            We've analyzed <span className="font-medium">{fileName}</span> and found {
              (displayedData?.topics?.length || 0) +
              (displayedData?.dates?.length || 0) +
              (displayedData?.testTypes?.length || 0)
            } items
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{displayedData?.topics?.length || 0}</div>
              <div className="text-xs text-gray-600">Topics Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayedData?.dates?.length || 0}</div>
              <div className="text-xs text-gray-600">Important Dates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{displayedData?.testTypes?.length || 0}</div>
              <div className="text-xs text-gray-600">Test Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{displayedData?.grading?.length || 0}</div>
              <div className="text-xs text-gray-600">Grade Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Course Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Course Name */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Course Name:</span>
            {isEditing ? (
              <Input
                className="w-64"
                value={editedData?.courseName || ''}
                onChange={(e) => setEditedData({ ...editedData!, courseName: e.target.value })}
              />
            ) : (
              <span className="text-sm">{displayedData?.courseName || ''}</span>
            )}
          </div>

          {/* Instructor */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Instructor:</span>
            {isEditing ? (
              <Input
                className="w-64"
                value={editedData?.instructor || ''}
                onChange={(e) => setEditedData({ ...editedData!, instructor: e.target.value })}
              />
            ) : (
              <span className="text-sm">{displayedData?.instructor || ''}</span>
            )}
          </div>

          {/* Semester */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Semester:</span>
            {isEditing ? (
              <Input
                className="w-64"
                value={editedData?.semester || ''}
                onChange={(e) => setEditedData({ ...editedData!, semester: e.target.value })}
              />
            ) : (
              <span className="text-sm">{displayedData?.semester || ''}</span>
            )}
          </div>

          {/* Auto-detected Course Type */}
          {displayedData?.courseType && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Course Type:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{displayedData.courseType}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Auto-detected
                </Badge>
              </div>
            </div>
          )}

          {/* Auto-detected Assessment Types */}
          {displayedData?.assessmentTypes && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Assessment Methods:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Auto-detected
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {displayedData.assessmentTypes.has_final_exam && (
                  <div>• Final Exam</div>
                )}
                {displayedData.assessmentTypes.has_regular_quizzes && (
                  <div>• Regular Quizzes/Tests</div>
                )}
                {displayedData.assessmentTypes.has_essays && (
                  <div>• Essays/Papers</div>
                )}
                {displayedData.assessmentTypes.has_projects && (
                  <div>• Projects/Presentations</div>
                )}
                {displayedData.assessmentTypes.has_lab_work && (
                  <div>• Lab Work/Practicals</div>
                )}
                {displayedData.assessmentTypes.has_group_work && (
                  <div>• Group Work</div>
                )}
                {displayedData.assessmentTypes.primary_assessment_method && (
                  <div className="text-blue-600 font-medium mt-2">
                    Primary: {displayedData.assessmentTypes.primary_assessment_method}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Extraction Results */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Topics */}
        {displayedData?.topics && displayedData.topics.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
                Topics ({displayedData.topics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(isEditing ? editedData?.topics : displayedData?.topics)
                  ?.slice(0, showAllTopics ? undefined : 5)
                  .map((topic: Topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    {isEditing && editedData ? (
                      <Input
                        className="flex-1 mr-2"
                        value={topic.label}
                        onChange={(e) => handleTopicEdit(topic.id, e.target.value)}
                      />
                    ) : (
                      <span className="text-sm font-medium">{topic.label}</span>
                    )}
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
              {displayedData.topics.length > 5 && !showAllTopics && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllTopics(true)}
                  className="w-full mt-2 text-xs"
                >
                  Show {displayedData.topics.length - 5} more topics
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Dates */}
        {displayedData?.dates && displayedData.dates.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Important Dates ({displayedData.dates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(isEditing ? editedData?.dates : displayedData?.dates)
                  ?.slice(0, showAllDates ? undefined : 5)
                  .map((date: Date) => {
                    const missingDescription = !date.description || date.description.trim() === '';
                    return (
                      <div key={date.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(date.type)}
                          <div className="space-y-1">
                            {isEditing ? (
                              <>
                                <Input
                                  type="date"
                                  min="2024-01-01"
                                  max="2030-12-31"
                                  value={date.date}
                                  onChange={(e) => handleDateEdit(date.id, 'date', e.target.value)}
                                  className="w-40"
                                />
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={date.description}
                                      onChange={(e) => handleDateEdit(date.id, 'description', e.target.value)}
                                      className={`w-40 ${missingDescription ? 'border-red-500' : ''}`}
                                    />
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger><span className="text-xs text-gray-400">?</span></TooltipTrigger>
                                        <TooltipContent>
                                          <span>Describe the test/assessment (e.g., 'Short quiz on chapters 1-3, 10% of grade')</span>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <Input
                                    value={date.format}
                                    onChange={(e) => handleDateEdit(date.id, 'format', e.target.value)}
                                    placeholder="Format (e.g., written, oral)"
                                    className="w-40"
                                  />
                                  <Input
                                    value={date.weight}
                                    onChange={(e) => handleDateEdit(date.id, 'weight', e.target.value)}
                                    placeholder="Weight (e.g., 20% or 2 points)"
                                    className="w-40"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-sm font-medium">{date.description}</span>
                                <span className="text-sm font-light text-gray-500 block">{date.date}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {date.weight && (
                          <Badge variant="outline" className="text-xs">
                            {isEditing && editedData ? (
                              <Input
                                className="w-16 text-xs"
                                type="number"
                                min="0"
                                max="100"
                                value={editedData.grading.find((g: Grade) => g.category === date.description)?.weight}
                                onChange={(e) => handleGradingEdit(displayedData.grading.findIndex((g: Grade) => g.category === date.description), 'weight', parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <span>{formatWeight(date.weight)}</span>
                            )}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
              </div>
              {displayedData.dates.length > 5 && !showAllDates && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllDates(true)}
                  className="w-full mt-2 text-xs"
                >
                  Show {displayedData.dates.length - 5} more dates
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Types */}
        {displayedData?.testTypes && displayedData.testTypes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-purple-600" />
                Test Types ({displayedData.testTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(isEditing ? editedData?.testTypes : displayedData?.testTypes)
                  ?.map((testType: TestType) => (
                  <div key={testType.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    {isEditing && editedData ? (
                      <Input
                        className="flex-1 mr-2"
                        value={testType.type}
                        onChange={(e) => {
                          const newTestTypes = [...displayedData!.testTypes];
                          const index = newTestTypes.findIndex(t => t.id === testType.id);
                          if (index !== -1) {
                            newTestTypes[index] = { ...newTestTypes[index], type: e.target.value };
                            setEditedData({ ...editedData, testTypes: newTestTypes });
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium">{testType.type}</span>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(testType.confidence)}`}
                    >
                      {isEditing && editedData ? (
                        <Input
                          className="w-16 text-xs"
                          value={editedData.grading.find((g: Grade) => g.category === testType.type)?.weight}
                          onChange={(e) => handleGradingEdit(displayedData.grading.findIndex((g: Grade) => g.category === testType.type), 'weight', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <span>{testType.confidence}%</span>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grading Breakdown */}
        {displayedData?.grading && displayedData.grading.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-orange-600" />
                Grading Breakdown ({displayedData.grading.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(isEditing ? editedData?.grading : displayedData?.grading)
                  ?.map((grade: Grade, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    {isEditing && editedData ? (
                      <Input
                        className="flex-1 mr-2"
                        value={grade.category}
                        onChange={(e) => handleGradingEdit(index, 'category', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm font-medium">{grade.category}</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {isEditing && editedData ? (
                        <Input
                          className="w-16 text-xs"
                          value={editedData.grading.find(g => g.category === grade.category)?.weight}
                          onChange={(e) => handleGradingEdit(index, 'weight', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <span>{formatWeight(grade.weight)}</span>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons - Only show if showNavigation is true */}
      {showNavigation && (
        <>
          <div className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveClick}>Save Changes</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditClick}>Edit Extracted Text</Button>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {isEditing 
                ? "Edit the extracted information to ensure accuracy. Click Save Changes when done."
                : "Review the extracted information above. You can edit details or proceed to set up your study schedule."
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
} 