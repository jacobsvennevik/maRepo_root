'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './project-summary-animations.css';
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
import { ProjectSummaryColorful } from './project-summary-variants';
import { useProjectSetup } from '../hooks/useProjectSetup';
import { useStepNavigation } from '../hooks/useStepNavigation';

// Import modular step components
import { 
  ProjectNameStep,
  PurposeStep,
  EducationLevelStep,
  SyllabusUploadStep,
  ExtractionResultsStep,
  LearningPreferencesStep,
  CourseContentUploadStep,
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
  const [isCourseContentAnalysisComplete, setIsCourseContentAnalysisComplete] = useState(false);
  const [isTestAnalysisComplete, setIsTestAnalysisComplete] = useState(false);
  const [isSyllabusAnalysisComplete, setIsSyllabusAnalysisComplete] = useState(false);

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
    handleApplyAIDates,
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
    collaboration: '',
    courseType: '',
    learningStyle: '',
    assessmentType: '',
    studyPreference: '',
    learningDifficulties: ''
  });

  const {
    currentStep,
    handleNext: originalHandleNext,
    handleBack,
    setCurrentStep,
    getCurrentStepIndex,
    getTotalSteps,
    progress,
    currentStepData,
    isLastStep,
    isFirstStep,
  } = useStepNavigation(setup, onBack, setShowSummary, extractedData);

  // Custom handleNext that handles extraction results step specially
  const handleNext = async () => {
    if (currentStepData.id === 'extractionResults') {
      // For extraction results step, call the confirm handler first
      await handleExtractionResultsConfirm();
    } else {
      // For all other steps, use the original handleNext
      originalHandleNext();
    }
  };

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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clear localStorage when component unmounts to prevent accumulation
      clearStorage();
      console.log('🧹 Cleaned up guided-setup localStorage on unmount');
    };
  }, [clearStorage]);

  // Cleanup function for resetting all state
  const cleanupState = useCallback(() => {
    setSetup({
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
      collaboration: '',
      courseType: '',
      learningStyle: '',
      assessmentType: '',
      studyPreference: '',
      learningDifficulties: ''
    });
    setProjectId(null);
    setExtractedData(null);
    setSyllabusFileName('');
    setContentData(null);
    setContentFileNames([]);
    setIsCourseContentAnalysisComplete(false);
    setIsTestAnalysisComplete(false);
    setIsSyllabusAnalysisComplete(false);
    setHasUnsavedChanges(false);
    clearStorage();
    console.log('🧹 Cleaned up all guided-setup state');
  }, [clearStorage, setSetup, setHasUnsavedChanges]);

  // Enhanced handleBack with cleanup
  const handleBackWithCleanup = useCallback(() => {
    if (isFirstStep) {
      // If we're at the first step, cleanup and go back
      cleanupState();
      onBack();
    } else {
      // Otherwise just go back to previous step
      handleBack();
    }
  }, [isFirstStep, handleBack, onBack, cleanupState]);

  const handleAddDate = () => {
    if (addDateToSetup(newDate)) {
      setNewDate({ date: '', description: '', type: 'exam' });
    }
  };

  const handleSkip = () => {
    // Skip both syllabus upload and extraction results steps
    setExtractedData(null); // Clear any existing extracted data
    setSyllabusFileName(''); // Clear any existing filename
    setIsSyllabusAnalysisComplete(false);
    handleNext(); // Move to next step (will skip extraction results since data is null)
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
    const result = (() => {
      switch (stepId) {
        case 'projectName':
          return !!setup.projectName.trim();
        case 'purpose':
          return !!setup.purpose;
        case 'educationLevel':
          return !!setup.testLevel;
        case 'uploadSyllabus':
          return isSyllabusAnalysisComplete;
        case 'extractionResults':
          return !!extractedData;
        case 'courseContentUpload':
          return isCourseContentAnalysisComplete;
        case 'testUpload':
          return isTestAnalysisComplete;
        case 'learningPreferences':
          const hasLearningStyle = Array.isArray(setup.learningStyle) 
            ? setup.learningStyle.length > 0 
            : !!setup.learningStyle;
          const hasStudyPreference = Array.isArray(setup.studyPreference) 
            ? setup.studyPreference.length > 0 
            : !!setup.studyPreference;
          return hasLearningStyle && hasStudyPreference;
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
    })();
    
    console.log(`🔍 Step completion check - Step: ${stepId}, Complete: ${result}, isCourseContentAnalysisComplete: ${isCourseContentAnalysisComplete}, isTestAnalysisComplete: ${isTestAnalysisComplete}`);
    return result;
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
    setIsSyllabusAnalysisComplete(true);
    
    // Add the uploaded file to the frontend state for the project summary
    if (fileName) {
      // Create a mock File object for the uploaded file with a realistic size
      const mockContent = new ArrayBuffer(1024 * 1024); // 1MB mock content
      const uploadedFile = new File([mockContent], fileName, { type: 'application/pdf' });
      handleCourseFileUpload([uploadedFile]);
      console.log('✅ Added syllabus file to frontend state:', fileName);
    }
    
    if (newProjectId === 'test-mode') {
      console.log(`🧪 TEST MODE: Syllabus analyzed. Moving to extraction results to review.`);
    } else {
      console.log(`Syllabus uploaded for project ${newProjectId}. Moving to extraction results.`);
    }
    
    // Use setTimeout to ensure state has been updated before navigating
    setTimeout(() => {
      // Find the extraction results step index and navigate directly to it
      const extractionResultsIndex = SETUP_STEPS.findIndex(step => step.id === 'extractionResults');
      console.log(`Found extraction results step at index: ${extractionResultsIndex}`);
      console.log(`Current step before navigation: ${currentStep} (${currentStepData?.id})`);
      console.log(`ExtractedData available: ${!!transformed}`);
      
      if (extractionResultsIndex !== -1) {
        console.log(`Navigating directly to extraction results step (index ${extractionResultsIndex})`);
        setCurrentStep(extractionResultsIndex);
      } else {
        console.log('Extraction results step not found, using handleNext()');
        handleNext();
      }
    }, 0);
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
    
    // Auto-populate learning preferences from extracted data
    if (extractedData) {
      console.log('🤖 Auto-populating learning preferences from extracted data...');
      
      // Map extracted test types to assessment type
      const assessmentType = mapTestTypesToAssessmentType(extractedData.testTypes);
      if (assessmentType && !setup.assessmentType) {
        handleOptionSelect('assessmentType', assessmentType);
        console.log('✅ Auto-populated assessmentType:', assessmentType);
      }
      
      // Map course topics to course type
      const courseType = mapTopicsToCourseType(extractedData.topics);
      if (courseType && !setup.courseType) {
        handleOptionSelect('courseType', courseType);
        console.log('✅ Auto-populated courseType:', courseType);
      }
      
      // Add extracted dates to the important dates list
      if (extractedData.dates && extractedData.dates.length > 0) {
        console.log('📅 Adding extracted dates to important dates:', extractedData.dates);
        extractedData.dates.forEach(date => {
          addDateToSetup({
            date: date.date,
            description: date.description,
            type: date.type || 'exam'
          });
        });
        console.log('✅ Added extracted dates to frontend state');
      }
    }
    
    console.log('Extraction results confirmed. Moving to learning preferences.');
    originalHandleNext();
  };

  const handleExtractionResultsSave = (updatedData: ExtractedData) => {
    console.log('Saving extraction results:', updatedData);
    setExtractedData(updatedData);
  };

  // Helper function to map extracted test types to assessment type
  const mapTestTypesToAssessmentType = (testTypes: { type: string; confidence: number }[]) => {
    if (!testTypes || testTypes.length === 0) return null;
    
    const typeNames = testTypes.map(t => t.type.toLowerCase());
    
    // Check for cumulative final
    if (typeNames.some(type => type.includes('final') && type.includes('exam'))) {
      return 'cumulative-final';
    }
    
    // Check for regular quizzes
    if (typeNames.some(type => type.includes('quiz') || type.includes('test') || type.includes('midterm'))) {
      return 'regular-quizzes';
    }
    
    // Check for essays/projects
    if (typeNames.some(type => type.includes('essay') || type.includes('project') || type.includes('assignment') || type.includes('paper'))) {
      return 'essays-projects';
    }
    
    // If multiple types detected, suggest mixed
    if (testTypes.length >= 2) {
      return 'mixed-assessments';
    }
    
    return null;
  };

  // Helper function to map topics to course type
  const mapTopicsToCourseType = (topics: { label: string; confidence: number }[]) => {
    if (!topics || topics.length === 0) return null;
    
    const topicLabels = topics.map(t => t.label.toLowerCase()).join(' ');
    
    // STEM keywords
    const stemKeywords = ['math', 'science', 'physics', 'chemistry', 'biology', 'computer', 'programming', 'engineering', 'technology', 'algorithm', 'calculus', 'statistics'];
    
    // Humanities keywords
    const humanitiesKeywords = ['history', 'literature', 'philosophy', 'english', 'writing', 'humanities', 'social', 'political', 'psychology', 'sociology', 'anthropology'];
    
    // Language keywords
    const languageKeywords = ['language', 'spanish', 'french', 'german', 'chinese', 'japanese', 'linguistics', 'translation', 'grammar'];
    
    // Business keywords
    const businessKeywords = ['business', 'economics', 'finance', 'marketing', 'management', 'accounting', 'entrepreneurship'];
    
    // Arts keywords
    const artsKeywords = ['art', 'music', 'design', 'creative', 'visual', 'theater', 'drama', 'photography', 'film'];
    
    const stemCount = stemKeywords.filter(keyword => topicLabels.includes(keyword)).length;
    const humanitiesCount = humanitiesKeywords.filter(keyword => topicLabels.includes(keyword)).length;
    const languageCount = languageKeywords.filter(keyword => topicLabels.includes(keyword)).length;
    const businessCount = businessKeywords.filter(keyword => topicLabels.includes(keyword)).length;
    const artsCount = artsKeywords.filter(keyword => topicLabels.includes(keyword)).length;
    
    const maxCount = Math.max(stemCount, humanitiesCount, languageCount, businessCount, artsCount);
    
    if (maxCount === 0) return null;
    
    if (stemCount === maxCount) return 'stem';
    if (humanitiesCount === maxCount) return 'humanities';
    if (languageCount === maxCount) return 'language';
    if (businessCount === maxCount) return 'business';
    if (artsCount === maxCount) return 'arts';
    
    return null;
  };

  const handleTestUploadComplete = (extractedTests: any[], fileNames: string[]) => {
    // Handle test files upload completion
    console.log(`Test files uploaded:`, extractedTests);
    
    // Add the uploaded test files to the frontend state for the project summary
    if (fileNames && fileNames.length > 0) {
      const uploadedFiles = fileNames.map(fileName => {
        const mockContent = new ArrayBuffer(1024 * 1024); // 1MB mock content
        return new File([mockContent], fileName, { type: 'application/pdf' });
      });
      handleTestFileUpload(uploadedFiles);
      console.log('✅ Added test files to frontend state:', fileNames);
    }
    
    // Don't auto-advance - let user click Next button manually
  };

  const handleCourseContentUploadComplete = (backendData: any, fileNames: string[]) => {
    setContentData(backendData);
    setContentFileNames(fileNames);
    console.log('Course content uploaded successfully.');
    
    // Add the uploaded course content files to the frontend state for the project summary
    if (fileNames && fileNames.length > 0) {
      const uploadedFiles = fileNames.map(fileName => {
        const mockContent = new ArrayBuffer(1024 * 1024); // 1MB mock content
        return new File([mockContent], fileName, { type: 'application/pdf' });
      });
      handleCourseFileUpload(uploadedFiles);
      console.log('✅ Added course content files to frontend state:', fileNames);
    }
    
    // Don't auto-advance - let user click Next button manually
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
      case 'uploadSyllabus':
        return (
          <SyllabusUploadStep
            onUploadComplete={handleSyllabusUploadComplete}
            onSkip={handleSkip}
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
            onSave={handleExtractionResultsSave}
            onEdit={() => {
              // Go back to the upload step to re-upload or modify
              console.log('Going back to upload step for editing');
              setExtractedData(null);
              setSyllabusFileName('');
              // Use handleBack to go to previous step (upload step)
              handleBack();
            }}
            showNavigation={false}
          />
        );
      case 'learningPreferences':
        return (
          <LearningPreferencesStep
            learningStyle={setup.learningStyle}
            studyPreference={setup.studyPreference}
            learningDifficulties={setup.learningDifficulties}
            courseType={extractedData?.courseType || contentData?.courseType}
            assessmentTypes={extractedData?.assessmentTypes || contentData?.assessmentTypes}
            onLearningStyleChange={(value) => handleOptionSelect('learningStyle', value)}
            onStudyPreferenceChange={(value) => handleOptionSelect('studyPreference', value)}
            onLearningDifficultiesChange={(value) => handleOptionSelect('learningDifficulties', value)}
          />
        );
      case 'testUpload':
        return (
          <TestUploadStep
            onUploadComplete={handleTestUploadComplete}
            onNext={handleNext}
            onBack={handleBack}
            onAnalysisComplete={() => setIsTestAnalysisComplete(true)}
            extractedDates={extractedData?.dates || []}
            savedFiles={setup.testFiles || []}
            savedAnalysisData={undefined} // Test analysis data is not stored separately
            savedFileNames={[]}
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
            onNext={handleNext}
            onBack={handleBack}
            onAnalysisComplete={() => {
              console.log('🎯 CourseContentUploadStep onAnalysisComplete called - setting isCourseContentAnalysisComplete to true');
              setIsCourseContentAnalysisComplete(true);
            }}
            savedFiles={setup.courseFiles || []}
            savedAnalysisData={contentData}
            savedFileNames={contentFileNames}
          />
        );
      default:
        return null;
    }
  };

  if (showSummary) {
    console.log('📊 Project Summary State:', {
      courseFiles: setup.courseFiles?.length || 0,
      testFiles: setup.testFiles?.length || 0,
      uploadedFiles: setup.uploadedFiles?.length || 0,
      importantDates: setup.importantDates?.length || 0,
      totalFiles: (setup.courseFiles?.length || 0) + (setup.testFiles?.length || 0) + (setup.uploadedFiles?.length || 0)
    });
    return <ProjectSummaryColorful setup={setup} onBack={() => setShowSummary(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={handleBackWithCleanup} className="flex items-center">
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
              <Button variant="outline" onClick={handleBackWithCleanup} className="text-sm">
                {isFirstStep ? 'Back to Selection' : 'Previous'}
              </Button>
              <div className="flex gap-2">
                {['uploadSyllabus', 'courseContentUpload', 'testUpload'].includes(currentStepData.id) && !isStepComplete() && (
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