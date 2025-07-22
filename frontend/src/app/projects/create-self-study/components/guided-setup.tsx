'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Target, BookOpen, CalendarDays, Upload, Users, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAutoSave } from '../hooks/useAutoSave';

// Import modular step components
import { 
  ProjectNameStep,
  PurposeStep,
  FocusAreasStep,
  LearningMaterialsStep,
  TimelineStep,
  StudyFrequencyStep,
  LearningGoalStep,
  CollaborationStep
} from './steps';

// Import constants and types
import { 
  SETUP_STEPS,
  PURPOSE_OPTIONS,
  FOCUS_AREA_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS
} from '../constants';
import { SelfStudyProjectSetup } from '../types';

interface GuidedSetupProps {
  onBack: () => void;
}

export function GuidedSetup({ onBack }: GuidedSetupProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [setup, setSetup] = useState<SelfStudyProjectSetup>({
    projectName: '',
    purpose: 'self-study', // Pre-select self-study
    focusAreas: [],
    customFocusArea: '',
    learningMaterials: [],
    timeframe: '',
    studyFrequency: '',
    learningGoal: '',
    subGoals: [],
    collaboration: '',
    collaborators: '',
    customDescription: ''
  });
  const [showSummary, setShowSummary] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const { loadFromStorage, clearStorage } = useAutoSave({
    data: setup,
    key: 'self-study-guided-setup',
    enabled: !showSummary
  });

  // Load saved progress on mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setSetup(prev => ({
        ...prev,
        ...savedData,
        learningMaterials: savedData.learningMaterials || [],
        focusAreas: savedData.focusAreas || [],
        subGoals: savedData.subGoals || []
      }));
      setHasUnsavedChanges(true);
    }
  }, [loadFromStorage]);

  const currentStepData = SETUP_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleProjectNameChange = (name: string) => {
    setSetup(prev => ({ ...prev, projectName: name }));
    setHasUnsavedChanges(true);
  };

  const handlePurposeChange = (purpose: string) => {
    setSetup(prev => ({ ...prev, purpose }));
    setHasUnsavedChanges(true);
  };

  const handleCustomDescriptionChange = (description: string) => {
    setSetup(prev => ({ ...prev, customDescription: description }));
    setHasUnsavedChanges(true);
  };

  const handleFocusAreasChange = (areas: string[]) => {
    setSetup(prev => ({ ...prev, focusAreas: areas }));
    setHasUnsavedChanges(true);
  };

  const handleCustomFocusAreaChange = (area: string) => {
    setSetup(prev => ({ ...prev, customFocusArea: area }));
    setHasUnsavedChanges(true);
  };

  const handleMaterialsChange = (materials: any[]) => {
    setSetup(prev => ({ ...prev, learningMaterials: materials }));
    setHasUnsavedChanges(true);
  };

  const handleMaterialRemove = (id: string) => {
    setSetup(prev => ({
      ...prev,
      learningMaterials: prev.learningMaterials.filter(material => material.id !== id)
    }));
    setHasUnsavedChanges(true);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSetup(prev => ({ ...prev, timeframe }));
    setHasUnsavedChanges(true);
  };

  const handleStudyFrequencyChange = (frequency: string) => {
    setSetup(prev => ({ ...prev, studyFrequency: frequency }));
    setHasUnsavedChanges(true);
  };

  const handleLearningGoalChange = (goal: string) => {
    setSetup(prev => ({ ...prev, learningGoal: goal }));
    setHasUnsavedChanges(true);
  };

  const handleSubGoalsChange = (subGoals: string[]) => {
    setSetup(prev => ({ ...prev, subGoals }));
    setHasUnsavedChanges(true);
  };

  const handleCollaborationChange = (collaboration: string) => {
    setSetup(prev => ({ ...prev, collaboration }));
    setHasUnsavedChanges(true);
  };

  const handleCollaboratorsChange = (collaborators: string) => {
    setSetup(prev => ({ ...prev, collaborators }));
    setHasUnsavedChanges(true);
  };

  const isStepComplete = () => {
    switch (currentStepData.id) {
      case 'projectName':
        return setup.projectName.trim().length > 0;
      case 'purpose':
        return setup.purpose.length > 0;
      case 'focusAreas':
        return setup.focusAreas.length > 0;
      case 'learningMaterials':
        return true; // Optional step
      case 'timeframe':
        return setup.timeframe.length > 0;
      case 'studyFrequency':
        return setup.studyFrequency.length > 0;
      case 'learningGoal':
        return setup.learningGoal.trim().length > 0;
      case 'collaboration':
        return setup.collaboration.length > 0;
      default:
        return true;
    }
  };

  const getCurrentStepIndex = () => {
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return SETUP_STEPS.length;
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'projectName':
        return (
          <ProjectNameStep
            projectName={setup.projectName}
            onProjectNameChange={handleProjectNameChange}
          />
        );
      case 'purpose':
        return (
          <PurposeStep
            purpose={setup.purpose}
            customDescription={setup.customDescription}
            onPurposeChange={handlePurposeChange}
            onCustomDescriptionChange={handleCustomDescriptionChange}
            purposeOptions={PURPOSE_OPTIONS}
          />
        );
      case 'focusAreas':
        return (
          <FocusAreasStep
            focusAreas={setup.focusAreas}
            customFocusArea={setup.customFocusArea}
            onFocusAreasChange={handleFocusAreasChange}
            onCustomFocusAreaChange={handleCustomFocusAreaChange}
            focusAreaOptions={FOCUS_AREA_OPTIONS}
          />
        );
      case 'learningMaterials':
        return (
          <LearningMaterialsStep
            learningMaterials={setup.learningMaterials}
            onMaterialsChange={handleMaterialsChange}
            onMaterialRemove={handleMaterialRemove}
          />
        );
      case 'timeframe':
        return (
          <TimelineStep
            timeframe={setup.timeframe}
            onTimeframeChange={handleTimeframeChange}
            timeframeOptions={TIMEFRAME_OPTIONS}
          />
        );
      case 'studyFrequency':
        return (
          <StudyFrequencyStep
            studyFrequency={setup.studyFrequency}
            onStudyFrequencyChange={handleStudyFrequencyChange}
            frequencyOptions={FREQUENCY_OPTIONS}
          />
        );
      case 'learningGoal':
        return (
          <LearningGoalStep
            learningGoal={setup.learningGoal}
            subGoals={setup.subGoals || []}
            onLearningGoalChange={handleLearningGoalChange}
            onSubGoalsChange={handleSubGoalsChange}
          />
        );
      case 'collaboration':
        return (
          <CollaborationStep
            collaboration={setup.collaboration}
            collaborators={setup.collaborators}
            onCollaborationChange={handleCollaborationChange}
            onCollaboratorsChange={handleCollaboratorsChange}
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
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Self-Study Project Setup</h1>
              <p className="text-sm text-slate-600">Step {getCurrentStepIndex()} of {getTotalSteps()}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-600">{Math.round((getCurrentStepIndex() / getTotalSteps()) * 100)}%</span>
          </div>
          <Progress value={(getCurrentStepIndex() / getTotalSteps()) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <currentStepData.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">{currentStepData.title}</CardTitle>
                <p className="text-sm text-slate-600">{currentStepData.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {currentStep === SETUP_STEPS.length - 1 ? (
              <>
                <Check className="h-4 w-4" />
                Review & Create
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProjectSummary({ setup, onBack }: { setup: SelfStudyProjectSetup; onBack: () => void }) {
  const router = useRouter();

  const handleCreateProject = async () => {
    try {
      // Here you would typically send the data to your API
      console.log('Creating self-study project:', setup);
      
      // TODO: Implement actual project creation API call
      // For now, we'll simulate project creation
      const mockProject = {
        id: Math.random().toString(36).substr(2, 9), // Generate random ID
        name: setup.projectName,
        project_type: 'self_study',
        goal_description: setup.learningGoal,
        study_frequency: setup.studyFrequency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Clear auto-save data
      localStorage.removeItem('self-study-guided-setup');
      
      // Navigate to the new project's overview page
      router.push(`/projects/${mockProject.id}/overview`);
    } catch (error) {
      console.error('Failed to create self-study project:', error);
      // Handle error (e.g., show a toast notification)
    }
  };

  const getPurposeLabel = (value: string) => {
    const option = PURPOSE_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getTimeframeLabel = (value: string) => {
    const option = TIMEFRAME_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getFrequencyLabel = (value: string) => {
    const option = FREQUENCY_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getCollaborationLabel = (value: string) => {
    const option = COLLABORATION_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getFocusAreaLabels = () => {
    return setup.focusAreas.map(area => {
      const option = FOCUS_AREA_OPTIONS.find(opt => opt.value === area);
      return option ? option.label : area;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Project Summary</h1>
              <p className="text-sm text-slate-600">Review your self-study project details</p>
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Project Name</h3>
                  <p className="text-slate-600">{setup.projectName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Purpose</h3>
                  <p className="text-slate-600">{getPurposeLabel(setup.purpose)}</p>
                  {setup.customDescription && (
                    <p className="text-sm text-slate-500 mt-1">{setup.customDescription}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {getFocusAreaLabels().map((label, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Timeline</h3>
                  <p className="text-slate-600">{getTimeframeLabel(setup.timeframe)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Study Frequency</h3>
                  <p className="text-slate-600">{getFrequencyLabel(setup.studyFrequency)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Collaboration</h3>
                  <p className="text-slate-600">{getCollaborationLabel(setup.collaboration)}</p>
                  {setup.collaborators && (
                    <p className="text-sm text-slate-500 mt-1">{setup.collaborators}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Learning Materials</h3>
                  <p className="text-slate-600">{setup.learningMaterials.length} items</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Learning Goal</h3>
                  <p className="text-slate-600">{setup.learningGoal}</p>
                </div>
              </div>
            </div>

            {setup.subGoals && setup.subGoals.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 mb-2">Sub-goals</h3>
                <ul className="space-y-1">
                  {setup.subGoals.map((goal, index) => (
                    <li key={index} className="text-slate-600 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Edit Project
          </Button>
          <Button
            onClick={handleCreateProject}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            Create Self-Study Project
          </Button>
        </div>
      </div>
    </div>
  );
} 