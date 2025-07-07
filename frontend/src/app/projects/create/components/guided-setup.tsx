'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, HelpCircle, Check, Target, BookOpen, Users, CalendarDays, Upload, FileText, Edit3, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from '../hooks/useAutoSave';
import dynamic from 'next/dynamic';
import { createProject, uploadFile, ProjectData } from '../services/api';
import { ProjectSummary } from './project-summary';
import { useProjectSetup } from '../hooks/useProjectSetup';
import { useStepNavigation } from '../hooks/useStepNavigation';

// Import modular step components
import { 
  ProjectNameStep,
  PurposeStep,
  EducationLevelStep,
  SyllabusUploadStep,
  ExtractionResultsStep,
  CourseContentUploadStep,
  CourseContentReviewStep,
  TestUploadStep,
  TimelineStep,
  GoalStep,
  StudyFrequencyStep,
  CollaborationStep
} from './steps';
import { ExtractedData } from './steps/extraction-results-step';

// Import constants and types
import { SETUP_STEPS } from '../constants/steps';
import { 
  SCHOOL_PURPOSE_OPTIONS,
  TEST_LEVEL_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS
} from '../constants';
import { ProjectSetup } from '../types';
import { formatFileSize, formatDate } from '../utils';

const ReactCalendar = dynamic(() => import('react-calendar'), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Loading calendar...</div>
});

// Test mode - set to true to bypass API calls and use mock data
const TEST_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_MODE !== 'false';

interface GuidedSetupProps {
  onBack: () => void;
}

export function GuidedSetup({ onBack }: GuidedSetupProps) {
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string>('');
  const [contentData, setContentData] = useState<any | null>(null);
  const [contentFileNames, setContentFileNames] = useState<string[]>([]);

  const {
    setup,
    setSetup,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    handleOptionSelect,
    handleEvaluationTypeToggle,
    handleAddDate: addDateToSetup,
    handleRemoveDate,
    handleFileUpload,
    handleCourseFileUpload,
    handleTestFileUpload,
    handleRemoveFile,
    handleRemoveCourseFile,
    handleRemoveTestFile,
    handleApplyAITopics,
    handleApplyAIDates,
    handleApplyAITestTypes,
    handleApplyAIRecommendations,
  } = useProjectSetup({
    projectName: '',
    purpose: 'good-grades',
    testLevel: '',
    evaluationTypes: [],
    testFiles: [],
    importantDates: [],
    courseFiles: [],
    uploadedFiles: [],
    timeframe: '',
    goal: '',
    studyFrequency: '',
    collaboration: ''
  });

  const {
    currentStep,
    handleNext,
    handleBack,
    getCurrentStepIndex,
    getTotalSteps,
    progress,
    currentStepData,
    isLastStep,
    isFirstStep,
  } = useStepNavigation(setup, onBack, setShowSummary);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isCourseDragOver, setIsCourseDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const courseFileInputRef = useRef<HTMLInputElement>(null);
  const [newDate, setNewDate] = useState({ date: '', description: '', type: 'exam' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Replace with actual auth token
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';

  // Auto-save functionality
  const { loadFromStorage, clearStorage } = useAutoSave({
    data: setup,
    key: 'guided-setup',
    enabled: !showSummary
  });

  // Load saved progress on mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setSetup(prev => ({
        ...prev,
        ...savedData,
        uploadedFiles: savedData.uploadedFiles || [],
        courseFiles: savedData.courseFiles || [],
        testFiles: savedData.testFiles || [],
        evaluationTypes: savedData.evaluationTypes || [],
        importantDates: savedData.importantDates || []
      }));
      setHasUnsavedChanges(true);
    }
  }, [loadFromStorage, setSetup, setHasUnsavedChanges]);

  const handleAddDate = () => {
    if (addDateToSetup(newDate)) {
      setNewDate({ date: '', description: '', type: 'exam' });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleCardClick = (field: keyof ProjectSetup, value: string) => {
    handleOptionSelect(field, value);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleCourseDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsCourseDragOver(true);
  }, []);

  const handleCourseDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsCourseDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
    setIsDragOver(false);
  }, [handleFileUpload]);

  const handleCourseDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleCourseFileUpload(files);
    setIsCourseDragOver(false);
  }, [handleCourseFileUpload]);

  const handleSkipTimeline = () => {
    handleNext();
  };

  const isStepComplete = () => {
    const stepId = currentStepData.id;
    switch (stepId) {
      case 'projectName':
        return !!setup.projectName.trim();
      case 'purpose':
        return !!setup.purpose;
      case 'educationLevel':
        return !!setup.testLevel;
      case 'uploadFiles':
        return (setup.uploadedFiles || []).length > 0;
      case 'timeframe':
        return !!setup.timeframe;
      case 'goal':
        return !!setup.goal;
      case 'studyFrequency':
        return !!setup.studyFrequency;
      case 'collaboration':
        return !!setup.collaboration;
      default:
        return false;
    }
  };

  const handleExtractionComplete = (projectId: string) => {
    // Redirect to the new project's page or a summary page
    router.push(`/projects/${projectId}` as any);
  };

  // Transform backend data to ExtractedData format
  const transformBackendData = (backendData: any): ExtractedData => {
    console.log('🔄 transformBackendData called with COMPLETE BACKEND DATA:');
    console.log(JSON.stringify(backendData, null, 2));
    
    // Handle both real backend data and mock test data
    const metadata = backendData.metadata || backendData;
    
         // Function to transform topics from string to array with confidence scores
     const transformTopics = (topicsData: any) => {
       if (!topicsData) return [];
       
       // Handle array from syllabus processor (contains long strings with multiple topics)
       if (Array.isArray(topicsData)) {
         const allTopics: any[] = [];
         
         topicsData.forEach((topicString: any, arrayIndex: number) => {
           if (typeof topicString === 'string') {
             // Split on periods or semicolons, then clean up
             const individualTopics = topicString
               .split(/[.;]/)
               .map((topic: string, index: number) => ({
                 id: `topic-${arrayIndex}-${index}`,
                 label: topic.trim(),
                 confidence: 85 + Math.floor(Math.random() * 10) // Random confidence 85-95
               }))
               .filter((topic: any) => topic.label.length > 10); // Only keep substantial topics
             
             allTopics.push(...individualTopics);
           } else {
             // Handle objects
             allTopics.push({
               id: `topic-obj-${arrayIndex}`,
               label: topicString.name || topicString.label || topicString,
               confidence: topicString.confidence || 85
             });
           }
         });
         
         return allTopics;
       }
       
       // Handle single string
       if (typeof topicsData === 'string') {
         return topicsData.split(/[.;]/).map((topic: string, index: number) => ({
           id: `topic-${index}`,
           label: topic.trim(),
           confidence: 85 + Math.floor(Math.random() * 10) // Random confidence 85-95
         })).filter((topic: any) => topic.label.length > 10);
       }
       
       return [];
     };
    
         // Function to transform important dates from string to structured format
     const transformDates = (datesData: any) => {
       if (!datesData) return [];
       
       // Helper function to parse date strings like "February 20 - School term"
       const parseDateString = (dateStr: string) => {
         const trimmed = dateStr.trim();
         
         // Check if it contains a dash separator (date - description format)
         if (trimmed.includes(' - ')) {
           const [datePart, descPart] = trimmed.split(' - ');
           return {
             date: datePart.trim(),
             description: trimmed, // Full string as description
           };
         }
         
         // If no separator, try to detect if it's just a date or a description
         // Look for date patterns (month names, numbers with slashes, etc.)
         const datePatterns = [
           /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+/i,
           /\d{1,2}\/\d{1,2}\/\d{2,4}/,
           /\d{1,2}-\d{1,2}-\d{2,4}/,
           /\d{4}-\d{1,2}-\d{1,2}/
         ];
         
         const hasDatePattern = datePatterns.some(pattern => pattern.test(trimmed));
         
         if (hasDatePattern) {
           return {
             date: trimmed,
             description: trimmed,
           };
         } else {
           // No clear date pattern, treat as description only
           return {
             date: 'TBD',
             description: trimmed,
           };
         }
       };
       
       // Handle array from syllabus processor (contains semicolon-separated strings)
       if (Array.isArray(datesData)) {
         const allDates: any[] = [];
         
         datesData.forEach((dateItem: any, arrayIndex: number) => {
           if (typeof dateItem === 'string') {
             // Split semicolon-separated dates
             const individualDates = dateItem.split(';').map((dateStr: string, index: number) => {
               const parsed = parseDateString(dateStr);
               return {
                 id: `date-${arrayIndex}-${index}`,
                 date: parsed.date,
                 description: parsed.description,
                 type: 'assignment', // Default type
                 weight: undefined
               };
             }).filter((date: any) => date.description.length > 0);
             
             allDates.push(...individualDates);
           } else {
             // Handle objects
             allDates.push({
               id: `date-obj-${arrayIndex}`,
               date: dateItem.date || dateItem.description,
               description: dateItem.description || dateItem.name || dateItem.title,
               type: dateItem.type || 'assignment',
               weight: dateItem.weight
             });
           }
         });
         
         return allDates;
       }
       
       // Handle single string
       if (typeof datesData === 'string') {
         return datesData.split(';').map((dateStr: string, index: number) => {
           const parsed = parseDateString(dateStr);
           return {
             id: `date-${index}`,
             date: parsed.date,
             description: parsed.description,
             type: 'assignment', // Default type
             weight: undefined
           };
         }).filter((date: any) => date.description.length > 0);
       }
       
       return [];
     };
    
         // Function to transform evaluation forms to test types
     const transformTestTypes = (evaluationData: any) => {
       if (!evaluationData) return [];
       
       // Handle array from syllabus processor (contains comma-separated strings)
       if (Array.isArray(evaluationData)) {
         const allTests: any[] = [];
         
         evaluationData.forEach((testString: any, arrayIndex: number) => {
           if (typeof testString === 'string') {
             // Split comma-separated test types
             const individualTests = testString.split(',').map((test: string, index: number) => ({
               id: `test-${arrayIndex}-${index}`,
               type: test.trim(),
               confidence: 90 + Math.floor(Math.random() * 8) // Random confidence 90-98
             })).filter((test: any) => test.type.length > 0);
             
             allTests.push(...individualTests);
           } else {
             // Handle objects
             allTests.push({
               id: `test-obj-${arrayIndex}`,
               type: testString.name || testString.type || testString,
               confidence: testString.confidence || 80
             });
           }
         });
         
         return allTests;
       }
       
       // Handle single string
       if (typeof evaluationData === 'string') {
         return evaluationData.split(',').map((test: string, index: number) => ({
           id: `test-${index}`,
           type: test.trim(),
           confidence: 90 + Math.floor(Math.random() * 8) // Random confidence 90-98
         })).filter((test: any) => test.type.length > 0);
       }
       
       return [];
     };
    
    const result = {
      courseName: metadata?.course_title || metadata?.course_name || metadata?.title,
      instructor: metadata?.instructor,
      semester: metadata?.semester,
      credits: metadata?.credits,
      topics: transformTopics(metadata?.topics),
      dates: transformDates(metadata?.important_dates)
        .concat(transformDates(metadata?.assignments))
        .concat(transformDates(metadata?.exam_dates)),
      testTypes: transformTestTypes(metadata?.forms_of_evaluation || metadata?.test_types),
      grading: (metadata?.grading || []).map((grade: any) => ({
        category: grade.category || grade.name,
        weight: grade.weight || grade.percentage
      }))
    };
    
    console.log('✅ TRANSFORMATION COMPLETE. Final result:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  };

  const handleSyllabusUploadComplete = (newProjectId: string, backendData: any, fileName?: string) => {
    console.log('handleSyllabusUploadComplete called with:', { newProjectId, backendData, fileName });
    
    // Store the project ID and transform the extracted data
    setProjectId(newProjectId);
    const transformed = transformBackendData(backendData);
    console.log('Transformed data:', transformed);
    setExtractedData(transformed);
    setSyllabusFileName(fileName || backendData.file || 'syllabus.pdf');
    
    if (newProjectId === 'test-mode') {
      console.log(`🧪 TEST MODE: Syllabus analyzed. Moving to extraction results to review.`);
    } else {
      console.log(`Syllabus uploaded for project ${newProjectId}. Moving to extraction results.`);
    }
    
    console.log('About to call handleNext() to move to extraction results step');
    handleNext();
  };

  const handleExtractionResultsConfirm = async () => {
    // User confirmed the extraction results
    if (projectId === 'test-mode') {
      // In test mode, create the project now with the extracted data
      console.log('🧪 TEST MODE: Creating project with confirmed extraction data...');
      
      const projectName = extractedData?.courseName || 'Computer Science 101';
      const projectData: Partial<ProjectData> = {
        name: projectName,
        project_type: 'school',
        course_name: projectName,
        is_draft: true,
      };

      try {
        const newProject = await createProject(projectData as ProjectData);
        console.log('🧪 TEST MODE: Project created after confirmation:', newProject);
        setProjectId(newProject.id);
      } catch (error) {
        console.error('Failed to create project after extraction confirmation:', error);
        // Continue anyway for demo purposes in test mode
      }
    }
    
    console.log('Extraction results confirmed. Moving to test upload.');
    handleNext();
  };

  const handleTestUploadComplete = (uploadedFiles: File[]) => {
    // Handle test files upload completion
    console.log(`Test files uploaded:`, uploadedFiles);
    handleNext();
  };

  const handleCourseContentUploadComplete = (backendData: any, fileNames: string[]) => {
    setContentData(backendData);
    setContentFileNames(fileNames);
    handleNext(); // Move to review step
  };

  const handleCourseContentReviewConfirm = () => {
    console.log('Course content review confirmed. Moving to next step.');
    handleNext();
  };

  const renderStepContent = () => {
    const stepId = currentStepData.id;
    console.log(`Rendering step: ${stepId} (step ${currentStep} of ${SETUP_STEPS.length})`);
    
    switch (stepId) {
      case 'projectName':
        return (
          <ProjectNameStep
            projectName={setup.projectName}
            onProjectNameChange={(name) => handleOptionSelect('projectName', name)}
          />
        );
      case 'purpose':
        return (
          <PurposeStep
            value={setup.purpose}
            onSelect={(value) => handleOptionSelect('purpose', value)}
            options={SCHOOL_PURPOSE_OPTIONS}
            customValue={setup.customDescription || ''}
            onCustomChange={(value) => handleOptionSelect('customDescription', value)}
          />
        );
      case 'educationLevel':
        return (
          <EducationLevelStep
            value={setup.testLevel}
            onSelect={(level: string) => handleOptionSelect('testLevel', level)}
            options={TEST_LEVEL_OPTIONS}
          />
        );
      case 'uploadFiles':
        return (
          <SyllabusUploadStep
            onUploadComplete={handleSyllabusUploadComplete}
          />
        );
      case 'extractionResults':
        console.log('Rendering extraction results step. extractedData:', extractedData);
        if (!extractedData) {
          console.log('No extracted data available yet');
          return (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing extracted data...</p>
            </div>
          );
        }
        return (
          <ExtractionResultsStep
            extractedData={extractedData}
            fileName={syllabusFileName}
            onConfirm={handleExtractionResultsConfirm}
            onEdit={() => {
              // Optional: Add edit functionality later
              console.log('Edit functionality not implemented yet');
            }}
            isTestMode={projectId === 'test-mode'}
          />
        );
      case 'testUpload':
        return (
          <TestUploadStep
            projectId={projectId || ''}
            onUploadComplete={handleTestUploadComplete}
            onSkip={handleNext}
          />
        );
      case 'timeframe':
        return (
          <TimelineStep
            timeframe={setup.timeframe}
            onTimeframeChange={(timeframe) => handleOptionSelect('timeframe', timeframe)}
            timeframeOptions={TIMEFRAME_OPTIONS}
          />
        );
      case 'goal':
        return (
          <GoalStep
            goal={setup.goal}
            onGoalChange={(goal) => handleOptionSelect('goal', goal)}
          />
        );
      case 'studyFrequency':
        return (
          <StudyFrequencyStep
            studyFrequency={setup.studyFrequency}
            onStudyFrequencyChange={(frequency) => handleOptionSelect('studyFrequency', frequency)}
            frequencyOptions={FREQUENCY_OPTIONS}
          />
        );
      case 'collaboration':
        return (
          <CollaborationStep
            collaboration={setup.collaboration}
            onCollaborationChange={(collaboration) => handleOptionSelect('collaboration', collaboration)}
            collaborationOptions={COLLABORATION_OPTIONS}
          />
        );
      case 'courseContentUpload':
        return (
          <CourseContentUploadStep
            onUploadComplete={handleCourseContentUploadComplete}
          />
        );
      case 'courseContentReview':
        if (!contentData) {
          return (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing course content...</p>
            </div>
          );
        }
        return (
          <CourseContentReviewStep
            extractedContent={contentData}
            fileNames={contentFileNames}
            onConfirm={handleCourseContentReviewConfirm}
          />
        );
      default:
        return null;
    }
  };

  if (showSummary) {
    return <ProjectSummary setup={setup} onBack={() => setShowSummary(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2 sm:gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Auto-saved</span>
              </div>
            )}
            <div className="text-xs sm:text-sm text-gray-600">
              Step {getCurrentStepIndex()} of {getTotalSteps()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
            <span className="text-xs sm:text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <currentStepData.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">{currentStepData.title}</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">{currentStepData.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between pt-4 sm:pt-6">
              <Button variant="outline" onClick={handleBack} className="text-sm">
                {isFirstStep ? 'Back to Selection' : 'Previous'}
              </Button>
              <div className="flex gap-2">
                {currentStepData.id !== 'educationLevel' && currentStepData.id !== 'projectName' && (
                  <Button 
                    variant="outline" 
                    onClick={handleSkip}
                    className="text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    Skip
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm"
                >
                  {isLastStep ? 'Review & Create' : 'Next'}
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 