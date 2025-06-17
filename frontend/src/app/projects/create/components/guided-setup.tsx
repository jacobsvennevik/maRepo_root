'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  CourseDetailsStep,
  TestTimelineStep,
  SyllabusUploadStep,
  ExtractionResultsStep,
  TestUploadStep,
  TimelineStep,
  GoalStep,
  StudyFrequencyStep,
  CollaborationStep
} from './steps';
import { ExtractedData } from './steps/extraction-results-step';

// Import constants and types
import { 
  SETUP_STEPS,
  SCHOOL_PURPOSE_OPTIONS,
  TEST_LEVEL_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS,
  EVALUATION_TYPE_OPTIONS,
  DATE_TYPE_OPTIONS
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
      case 'courseDetails':
        return setup.purpose === 'school' ? (
          !!setup.testLevel && 
          (!!setup.assignmentDescription || (setup.courseFiles && setup.courseFiles.length > 0) || (setup.evaluationTypes && setup.evaluationTypes.length > 0))
        ) : true;
      case 'testTimeline':
        return setup.purpose === 'school' ? (
          (setup.testFiles && setup.testFiles.length > 0) && (setup.importantDates && setup.importantDates.length > 0)
        ) : true;
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

  const shouldShowStep = (stepId: string) => {
    if (stepId === 'courseDetails' || stepId === 'testTimeline') {
      return setup.purpose === 'school';
    }
    return true;
  };

  const handleExtractionComplete = (projectId: string) => {
    // Redirect to the new project's page or a summary page
    router.push(`/projects/${projectId}` as any);
  };

  // Transform backend data to ExtractedData format
  const transformBackendData = (backendData: any): ExtractedData => {
    // Handle both real backend data and mock test data
    const metadata = backendData.metadata || backendData;
    
    return {
      courseName: metadata?.course_name || metadata?.title,
      instructor: metadata?.instructor,
      semester: metadata?.semester,
      credits: metadata?.credits,
      topics: (metadata?.topics || []).map((topic: any, index: number) => ({
        id: `topic-${index}`,
        label: topic.name || topic.label || topic,
        confidence: topic.confidence || 85
      })),
      dates: (metadata?.assignments || metadata?.important_dates || metadata?.exam_dates || [])
        .map((item: any, index: number) => ({
          id: `date-${index}`,
          date: item.due_date || item.date,
          description: item.description || item.name || item.title,
          type: item.type || 'assignment',
          weight: item.weight
        }))
        .concat(
          (metadata?.exam_dates || []).map((exam: any, index: number) => ({
            id: `exam-${index}`,
            date: exam.date,
            description: exam.name || exam.title,
            type: 'exam',
            weight: exam.weight
          }))
        ),
      testTypes: (metadata?.test_types || []).map((type: any, index: number) => ({
        id: `test-${index}`,
        type: type.name || type.type || type,
        confidence: type.confidence || 80
      })),
      grading: (metadata?.grading || []).map((grade: any) => ({
        category: grade.category || grade.name,
        weight: grade.weight || grade.percentage
      }))
    };
  };

  const handleSyllabusUploadComplete = (newProjectId: string, backendData: any, fileName?: string) => {
    // Store the project ID and transform the extracted data
    setProjectId(newProjectId);
    const transformed = transformBackendData(backendData);
    setExtractedData(transformed);
    setSyllabusFileName(fileName || backendData.file || 'syllabus.pdf');
    
    if (newProjectId === 'test-mode') {
      console.log(`🧪 TEST MODE: Syllabus analyzed. Moving to extraction results to review.`);
    } else {
      console.log(`Syllabus uploaded for project ${newProjectId}. Moving to extraction results.`);
    }
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

  const renderStepContent = () => {
    const stepId = currentStepData.id;
    
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
      case 'courseDetails':
        return (
          <CourseDetailsStep
            testLevel={setup.testLevel}
            gradeLevel={setup.gradeLevel}
            assignmentDescription={setup.assignmentDescription}
            courseFiles={setup.courseFiles}
            evaluationTypes={setup.evaluationTypes}
            onTestLevelChange={(level) => handleOptionSelect('testLevel', level)}
            onGradeLevelChange={(grade) => handleOptionSelect('gradeLevel', grade)}
            onAssignmentDescriptionChange={(desc) => handleOptionSelect('assignmentDescription', desc)}
            onCourseFilesChange={handleCourseFileUpload}
            onCourseFileRemove={handleRemoveCourseFile}
            onEvaluationTypeToggle={handleEvaluationTypeToggle}
            onApplyAITopics={handleApplyAITopics}
            onApplyAIDates={handleApplyAIDates}
            onApplyAITestTypes={handleApplyAITestTypes}
            onApplyAIRecommendations={handleApplyAIRecommendations}
            testLevelOptions={TEST_LEVEL_OPTIONS}
            gradeLevelOptions={GRADE_LEVEL_OPTIONS}
            evaluationTypeOptions={EVALUATION_TYPE_OPTIONS}
          />
        );
      case 'testTimeline':
        return (
          <TestTimelineStep
            testFiles={setup.testFiles}
            importantDates={setup.importantDates}
            onTestFilesChange={handleTestFileUpload}
            onTestFileRemove={handleRemoveTestFile}
            onAddDate={handleAddDate}
            onRemoveDate={handleRemoveDate}
            onApplyAITopics={handleApplyAITopics}
            onApplyAIDates={handleApplyAIDates}
            onApplyAITestTypes={handleApplyAITestTypes}
            onApplyAIRecommendations={handleApplyAIRecommendations}
            dateTypeOptions={DATE_TYPE_OPTIONS}
          />
        );
      case 'uploadFiles':
        return (
          <SyllabusUploadStep
            onUploadComplete={handleSyllabusUploadComplete}
          />
        );
      case 'extractionResults':
        return extractedData ? (
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
        ) : null;
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
                {currentStep === 0 ? 'Back to Selection' : 'Previous'}
              </Button>
              <div className="flex gap-2">
                {currentStepData.id !== 'courseDetails' && (
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
                  {currentStep === SETUP_STEPS.length - 1 ? 'Review & Create' : 'Next'}
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