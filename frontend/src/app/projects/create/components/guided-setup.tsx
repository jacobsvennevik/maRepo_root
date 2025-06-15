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

// Import Self Study components
import { SelfStudySetup } from './GuidedSetup/SelfStudySetup';

// Import constants and types
import { 
  SETUP_STEPS,
  PURPOSE_OPTIONS,
  TEST_LEVEL_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS,
  EVALUATION_TYPE_OPTIONS,
  DATE_TYPE_OPTIONS
} from '../constants';
import { ProjectSetup } from '../types';

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
    purpose: '',
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

  const handleFileUpload = useCallback((files: File[]) => {
    setSetup(prev => ({
      ...prev,
      uploadedFiles: [...(prev.uploadedFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleCourseFileUpload = useCallback((files: File[]) => {
    setSetup(prev => ({
      ...prev,
      courseFiles: [...(prev.courseFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleTestFileUpload = useCallback((files: File[]) => {
    setSetup(prev => ({
      ...prev,
      testFiles: [...(prev.testFiles || []), ...files]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleRemoveFile = (index: number) => {
    setSetup(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveCourseFile = (index: number) => {
    setSetup(prev => ({
      ...prev,
      courseFiles: prev.courseFiles.filter((_, i) => i !== index)
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

  const handleApplyAITopics = (topics: string[]) => {
    // This would be implemented with actual AI analysis
    console.log('Applying AI topics:', topics);
  };

  const handleApplyAIDates = (dates: any[]) => {
    setSetup(prev => ({
      ...prev,
      importantDates: [...prev.importantDates, ...dates]
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAITestTypes = (types: string[]) => {
    setSetup(prev => ({
      ...prev,
      evaluationTypes: [...prev.evaluationTypes, ...types]
    }));
    setHasUnsavedChanges(true);
  };

  const handleApplyAIRecommendations = (recommendations: any[]) => {
    // Apply AI recommendations to setup
    setSetup(prev => ({
      ...prev,
      ...recommendations
    }));
    setHasUnsavedChanges(true);
  };

  const handleSkipTimeline = () => {
    handleOptionSelect('timeframe', 'flexible');
    handleNext();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isStepComplete = () => {
    const stepId = currentStepData.id;
    switch (stepId) {
      case 'projectName':
        return !!setup.projectName.trim();
      case 'purpose':
        return !!setup.purpose;
      case 'courseDetails':
        return !!setup.testLevel && setup.evaluationTypes.length > 0;
      case 'testTimeline':
        return true; // Optional step
      case 'uploadFiles':
        return true; // Optional step
      case 'timeframe':
        return !!setup.timeframe;
      case 'goal':
        return !!setup.goal.trim();
      case 'studyFrequency':
        return !!setup.studyFrequency;
      case 'collaboration':
        return !!setup.collaboration;
      default:
        return false;
    }
  };

  const shouldShowStep = (stepId: string) => {
    // For now, show all steps for school course flow
    return true;
  };

  const getCurrentStepIndex = () => {
    let visibleStepCount = 0;
    for (let i = 0; i <= currentStep; i++) {
      if (shouldShowStep(SETUP_STEPS[i].id)) {
        visibleStepCount++;
      }
    }
    return visibleStepCount;
  };

  const getTotalSteps = () => {
    return SETUP_STEPS.filter(step => shouldShowStep(step.id)).length;
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
            purpose={setup.purpose}
            customDescription={setup.customDescription}
            onPurposeChange={(purpose) => handleOptionSelect('purpose', purpose)}
            onCustomDescriptionChange={(desc) => handleOptionSelect('customDescription', desc)}
            purposeOptions={PURPOSE_OPTIONS}
          />
        );
      case 'courseDetails':
        return (
          <CourseDetailsStep
            testLevel={setup.testLevel}
            gradeLevel={setup.gradeLevel}
            assignmentDescription={setup.assignmentDescription}
            courseFiles={setup.courseFiles || []}
            evaluationTypes={setup.evaluationTypes}
            onTestLevelChange={(level) => handleOptionSelect('testLevel', level)}
            onGradeLevelChange={(grade) => handleOptionSelect('gradeLevel', grade)}
            onAssignmentDescriptionChange={(desc) => handleOptionSelect('assignmentDescription', desc)}
            onCourseFileUpload={handleCourseFileUpload}
            onCourseFileRemove={handleRemoveCourseFile}
            onEvaluationTypeToggle={handleEvaluationTypeToggle}
            onApplyAIRecommendations={handleApplyAIRecommendations}
          />
        );
      case 'testTimeline':
        return (
          <TestTimelineStep
            testFiles={setup.testFiles || []}
            importantDates={setup.importantDates}
            newDate={newDate}
            onTestFileUpload={handleTestFileUpload}
            onTestFileRemove={handleRemoveTestFile}
            onAddDate={handleAddDate}
            onRemoveDate={handleRemoveDate}
            onNewDateChange={setNewDate}
            onApplyAIRecommendations={handleApplyAIRecommendations}
          />
        );
      case 'uploadFiles':
        return (
          <FileUploadStep
            uploadedFiles={setup.uploadedFiles}
            onFileUpload={handleFileUpload}
            onFileRemove={handleRemoveFile}
          />
        );
      case 'timeframe':
        return (
          <TimelineStep
            timeframe={setup.timeframe}
            onTimeframeChange={(timeframe) => handleOptionSelect('timeframe', timeframe)}
            timelineOptions={TIMEFRAME_OPTIONS}
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

  // If purpose is selected and it's self-study, show Self Study setup
  if (setup.purpose === 'self-study') {
    return <SelfStudySetup onBack={() => {
      setSetup(prev => ({ ...prev, purpose: '' }));
      setCurrentStep(1); // Go back to purpose selection
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Guided Setup</h1>
            <p className="text-sm text-slate-600">Step {getCurrentStepIndex()} of {getTotalSteps()}</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <Progress value={(getCurrentStepIndex() / getTotalSteps()) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <currentStepData.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">{currentStepData.title}</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">{currentStepData.description}</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < SETUP_STEPS.length - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {currentStep === SETUP_STEPS.length - 1 ? 'Review & Create' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Summary Component
function ProjectSummary({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const router = useRouter();

  const handleCreateProject = () => {
    // TODO: Implement project creation logic
    console.log('Creating project with setup:', setup);
    
    // Navigate to projects page after creating
    router.push('/projects');
  };

  const getPurposeLabel = (value: string) => {
    if (value === 'custom' && setup.customDescription) {
      return setup.customDescription;
    }
    return PURPOSE_OPTIONS.find(opt => opt.value === value)?.label || value;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

            <div className="flex justify-between pt-4 sm:pt-6">
              <Button variant="outline" onClick={onBack} className="text-sm">
                Edit Configuration
              </Button>
              <Button 
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
              >
                Create Project
                <Check size={16} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 