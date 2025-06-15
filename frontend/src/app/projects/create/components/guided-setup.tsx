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

// Import modular step components
import { 
  ProjectNameStep,
  PurposeStep,
  CourseDetailsStep,
  TestTimelineStep,
  FileUploadStep,
  TimelineStep,
  GoalStep,
  StudyFrequencyStep,
  CollaborationStep
} from './steps';

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

interface GuidedSetupProps {
  onBack: () => void;
}

export function GuidedSetup({ onBack }: GuidedSetupProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [setup, setSetup] = useState<ProjectSetup>({
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
  const [showSummary, setShowSummary] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
  }, [loadFromStorage]);

  const currentStepData = SETUP_STEPS[currentStep];

  const handleNext = () => {
    // Find the next visible step
    let nextStep = currentStep + 1;
    while (nextStep < SETUP_STEPS.length && !shouldShowStep(SETUP_STEPS[nextStep].id)) {
      nextStep++;
    }
    
    if (nextStep < SETUP_STEPS.length) {
      setCurrentStep(nextStep);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    // Find the previous visible step
    let prevStep = currentStep - 1;
    while (prevStep >= 0 && !shouldShowStep(SETUP_STEPS[prevStep].id)) {
      prevStep--;
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    } else {
      onBack();
    }
  };

  const handleOptionSelect = (field: keyof ProjectSetup, value: string) => {
    setSetup(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleEvaluationTypeToggle = (evaluationType: string) => {
    setSetup(prev => ({
      ...prev,
      evaluationTypes: prev.evaluationTypes.includes(evaluationType)
        ? prev.evaluationTypes.filter(type => type !== evaluationType)
        : [...prev.evaluationTypes, evaluationType]
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddDate = () => {
    if (newDate.date && newDate.description) {
      setSetup(prev => ({
        ...prev,
        importantDates: [...prev.importantDates, { ...newDate }]
      }));
      setNewDate({ date: '', description: '', type: 'exam' });
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveDate = (index: number) => {
    setSetup(prev => ({
      ...prev,
      importantDates: prev.importantDates.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
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

  const handleFileUpload = useCallback(async (files: File[]) => {
    // For now, just add to the list. Upload will happen on submission.
    setSetup(prev => ({
      ...prev,
      uploadedFiles: [...(prev.uploadedFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleCourseFileUpload = useCallback(async (files: File[]) => {
    // For now, just add to the list. Upload will happen on submission.
    setSetup(prev => ({
      ...prev,
      courseFiles: [...(prev.courseFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
    setIsCourseDragOver(false);
  }, []);

  const handleCourseDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleCourseFileUpload(files);
  }, [handleCourseFileUpload]);

  const handleTestFileUpload = useCallback(async (files: File[]) => {
    // For now, just add to the list. Upload will happen on submission.
    setSetup(prev => ({
      ...prev,
      testFiles: [...(prev.testFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleRemoveFile = (index: number) => {
    setSetup(prev => ({
      ...prev,
      uploadedFiles: (prev.uploadedFiles || []).filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveCourseFile = (index: number) => {
    setSetup(prev => ({
      ...prev,
      courseFiles: (prev.courseFiles || []).filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveTestFile = (index: number) => {
    setSetup(prev => ({
      ...prev,
      testFiles: prev.testFiles.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  // AI callback handlers
  const handleApplyAITopics = (topics: string[]) => {
    // For now, we'll add topics to the assignment description
    const currentDesc = setup.assignmentDescription || '';
    const topicsText = topics.join(', ');
    const newDesc = currentDesc ? `${currentDesc}\n\nDetected topics: ${topicsText}` : `Detected topics: ${topicsText}`;
    setSetup(prev => ({ ...prev, assignmentDescription: newDesc }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAIDates = (dates: any[]) => {
    // Convert AI dates to the format expected by importantDates
    const convertedDates = dates.map(date => ({
      date: date.date,
      description: date.description,
      type: date.type
    }));
    setSetup(prev => ({
      ...prev,
      importantDates: [...prev.importantDates, ...convertedDates]
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAITestTypes = (types: string[]) => {
    // Convert AI test types to evaluation types
    const convertedTypes = types.map(type => {
      switch (type.toLowerCase()) {
        case 'multiple choice': return 'exams';
        case 'essay': return 'essays';
        case 'problem solving': return 'exams';
        case 'lab practical': return 'labs';
        case 'oral exam': return 'presentations';
        case 'take-home': return 'projects';
        default: return 'exams';
      }
    }).filter((type, index, self) => self.indexOf(type) === index); // Remove duplicates

    setSetup(prev => ({
      ...prev,
      evaluationTypes: [...prev.evaluationTypes, ...convertedTypes].filter((type, index, self) => self.indexOf(type) === index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAIRecommendations = (recommendations: any[]) => {
    // Apply smart recommendations to various fields
    recommendations.forEach(rec => {
      switch (rec.type) {
        case 'schedule':
          // Auto-set study frequency based on schedule recommendation
          if (!setup.studyFrequency) {
            setSetup(prev => ({ ...prev, studyFrequency: 'daily' }));
          }
          break;
        case 'material':
          // Add study materials note
          const currentDesc = setup.assignmentDescription || '';
          const materialNote = `\n\nStudy Materials: ${rec.description}`;
          setSetup(prev => ({ 
            ...prev, 
            assignmentDescription: currentDesc + materialNote 
          }));
          break;
        case 'strategy':
          // Add strategy note
          const currentGoal = setup.goal || '';
          const strategyNote = `\n\nTest Strategy: ${rec.description}`;
          setSetup(prev => ({ 
            ...prev, 
            goal: currentGoal + strategyNote 
          }));
          break;
        case 'timeline':
          // Auto-set timeframe if not set
          if (!setup.timeframe) {
            setSetup(prev => ({ ...prev, timeframe: '3-months' }));
          }
          break;
      }
    });
    setHasUnsavedChanges(true);
  };

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

  const getCurrentStepIndex = () => {
    let actualStep = 0;
    for (let i = 0; i <= currentStep; i++) {
      if (shouldShowStep(SETUP_STEPS[i].id)) {
        actualStep++;
      }
    }
    return actualStep;
  };

  const getTotalSteps = () => {
    return SETUP_STEPS.filter(step => shouldShowStep(step.id)).length;
  };

  const progress = (getCurrentStepIndex() / getTotalSteps()) * 100;

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
          <FileUploadStep
            uploadedFiles={setup.uploadedFiles}
            onFilesChange={handleFileUpload}
            onFileRemove={handleRemoveFile}
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

// Project Summary Component
function ProjectSummary({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // TODO: Replace with actual auth token
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload files and get their URLs
      const courseFileUrls = await Promise.all(
        setup.courseFiles.map(file => uploadFile(file, 'course-files', authToken))
      );
      const testFileUrls = await Promise.all(
        setup.testFiles.map(file => uploadFile(file, 'test-files', authToken))
      );

      // 2. Prepare project data
      const projectData: ProjectData = {
        name: setup.projectName,
        project_type: 'school', // This is the school setup
        course_name: setup.purpose, // Assuming purpose is course name for now
        goal_description: setup.goal,
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Add other fields from the 'setup' object as needed
      };

      // 3. Create project
      const newProject = await createProject(projectData, authToken);

      // 4. Clear autosave and redirect
      // clearStorage(); // You might need to pass clearStorage down to this component
      router.push(`/projects/${newProject.id}/success` as any);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPurposeLabel = (value: string) => {
    if (value === 'custom' && setup.customDescription) {
      return setup.customDescription;
    }
    return SCHOOL_PURPOSE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getTestLevelLabel = (value: string) => {
    return TEST_LEVEL_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getGradeLevelLabel = (value: string) => {
    return GRADE_LEVEL_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getTimeframeLabel = (value: string) => {
    return TIMEFRAME_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getFrequencyLabel = (value: string) => {
    return FREQUENCY_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getCollaborationLabel = (value: string) => {
    return COLLABORATION_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getEvaluationTypeLabel = (value: string) => {
    return EVALUATION_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getDateTypeLabel = (value: string) => {
    return DATE_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Setup
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">Project Summary</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">Review your project configuration before creating</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Project Name</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.projectName}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Purpose</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getPurposeLabel(setup.purpose)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Education Level</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getTestLevelLabel(setup.testLevel)}</p>
                {setup.gradeLevel && (
                  <p className="text-slate-600 text-sm sm:text-base">{getGradeLevelLabel(setup.gradeLevel)}</p>
                )}
              </div>
              {setup.purpose === 'school' && (setup.assignmentDescription || setup.courseFiles.length > 0) && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Course Information</h3>
                  {setup.assignmentDescription && (
                    <p className="text-slate-600 text-sm sm:text-base">{setup.assignmentDescription}</p>
                  )}
                  {setup.courseFiles.length > 0 && (
                    <p className="text-slate-600 text-sm sm:text-base">{setup.courseFiles.length} course documents uploaded</p>
                  )}
                </div>
              )}
              {setup.purpose === 'school' && setup.evaluationTypes.length > 0 && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Evaluation Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {setup.evaluationTypes.map(type => (
                      <Badge key={type} className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                        {getEvaluationTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {setup.purpose === 'school' && setup.importantDates.length > 0 && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Important Dates</h3>
                  <p className="text-slate-600 text-sm sm:text-base">{setup.importantDates.length} dates scheduled</p>
                </div>
              )}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Uploaded Files</h3>
                <p className="text-slate-600 text-sm sm:text-base">{(setup.uploadedFiles || []).length} files uploaded</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Timeline</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getTimeframeLabel(setup.timeframe)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Study Frequency</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getFrequencyLabel(setup.studyFrequency)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Collaboration</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getCollaborationLabel(setup.collaboration)}</p>
              </div>
            </div>
            
            {setup.goal && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Learning Goal</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.goal}</p>
              </div>
            )}

            {setup.purpose === 'school' && setup.courseFiles.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Course Documents</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(setup.courseFiles || []).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setup.purpose === 'school' && setup.importantDates.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Scheduled Dates</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {setup.importantDates
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((dateItem, index) => {
                      const dateType = DATE_TYPE_OPTIONS.find(opt => opt.value === dateItem.type);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <Badge className={`text-xs ${dateType?.color || 'bg-gray-100 text-gray-800'}`}>
                            {dateType?.label || 'Other'}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{dateItem.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(dateItem.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {(setup.uploadedFiles || []).length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Files</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(setup.uploadedFiles || []).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" onClick={onBack}>Edit</Button>
              <Button onClick={handleCreateProject} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Project...' : 'Create Project & Start Learning'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 