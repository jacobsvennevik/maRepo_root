'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { GuidedSetupLayout } from './Layout';

// Import existing step components
import { ProjectNameStep } from '../steps/project-name-step';
import { PurposeStep } from '../steps/purpose-step';
import { TimelineStep } from '../steps/timeline-step';
import { GoalStep } from '../steps/goal-step';
import { StudyFrequencyStep } from '../steps/study-frequency-step';
import { CollaborationStep } from '../steps/collaboration-step';
import { FileUploadStep } from '../steps/file-upload-step';
import { FocusAreasStep } from '../steps/focus-areas-step';
import { LearningMaterialsStep } from '../steps/learning-materials-step';
import { LearningGoalStep } from '../steps/learning-goal-step';

// Import constants and types
import { 
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS,
  PURPOSE_OPTIONS
} from '../../constants';
import { ProjectSetup } from '../../types';

interface SelfStudySetupProps {
  onBack: () => void;
}

const SELF_STUDY_STEPS = [
  { id: 'projectName', title: 'Project Name', description: 'Give your learning project a name' },
  { id: 'purpose', title: 'Purpose', description: 'What are you learning?' },
  { id: 'focusAreas', title: 'Focus Areas', description: 'What topics will you focus on?' },
  { id: 'learningMaterials', title: 'Learning Materials', description: 'Upload files and add resources' },
  { id: 'timeline', title: 'Timeline', description: 'How long will this take?' },
  { id: 'studyFrequency', title: 'Study Frequency', description: 'How often will you study?' },
  { id: 'learningGoal', title: 'Learning Goal', description: 'What do you want to achieve?' },
  { id: 'collaboration', title: 'Collaboration', description: 'Will you study alone or with others?' }
];

export function SelfStudySetup({ onBack }: SelfStudySetupProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [setup, setSetup] = useState<ProjectSetup>({
    projectName: '',
    purpose: 'self-study', // Pre-selected for Self Study
    focusAreas: [],
    learningMaterials: [],
    timeline: '',
    studyFrequency: '',
    learningGoal: '',
    collaboration: '',
    customDescription: ''
  });
  const [showSummary, setShowSummary] = useState(false);

  const currentStepData = SELF_STUDY_STEPS[currentStep];
  const progress = ((currentStep + 1) / SELF_STUDY_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < SELF_STUDY_STEPS.length - 1) {
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

  const handleSkip = () => {
    handleNext();
  };

  const handleOptionSelect = (field: keyof ProjectSetup, value: string) => {
    setSetup(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setSetup(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setSetup(prev => ({
      ...prev,
      learningMaterials: [...(prev.learningMaterials || []), ...files]
    }));
  };

  const handleFileRemove = (index: number) => {
    setSetup(prev => ({
      ...prev,
      learningMaterials: prev.learningMaterials.filter((_, i) => i !== index)
    }));
  };

  const isStepComplete = () => {
    const stepId = currentStepData.id;
    switch (stepId) {
      case 'projectName':
        return !!setup.projectName.trim();
      case 'purpose':
        return !!setup.purpose;
      case 'focusAreas':
        return setup.focusAreas.length > 0;
      case 'learningMaterials':
        return true; // Optional step
      case 'timeline':
        return !!setup.timeline;
      case 'studyFrequency':
        return !!setup.studyFrequency;
      case 'learningGoal':
        return !!setup.learningGoal.trim();
      case 'collaboration':
        return !!setup.collaboration;
      default:
        return false;
    }
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
            preSelectedPurpose="self-study"
          />
        );
      case 'focusAreas':
        return (
          <FocusAreasStep
            focusAreas={setup.focusAreas || []}
            onFocusAreaToggle={handleFocusAreaToggle}
          />
        );
      case 'learningMaterials':
        return (
          <LearningMaterialsStep
            learningMaterials={setup.learningMaterials || []}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
          />
        );
      case 'timeline':
        return (
          <TimelineStep
            timeline={setup.timeline}
            onTimelineChange={(timeline) => handleOptionSelect('timeline', timeline)}
            timelineOptions={TIMEFRAME_OPTIONS}
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
      case 'learningGoal':
        return (
          <LearningGoalStep
            learningGoal={setup.learningGoal}
            onLearningGoalChange={(goal) => handleOptionSelect('learningGoal', goal)}
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
    <GuidedSetupLayout
      currentStep={currentStep + 1}
      totalSteps={SELF_STUDY_STEPS.length}
      progress={progress}
      canGoBack={currentStep > 0}
      canGoNext={isStepComplete()}
      canSkip={currentStepData.id === 'learningMaterials'} // Only skip materials step
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      nextButtonText={currentStep === SELF_STUDY_STEPS.length - 1 ? 'Review & Create' : 'Next'}
    >
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-slate-900">{currentStepData.title}</CardTitle>
          <p className="text-sm sm:text-base text-slate-600">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {renderStepContent()}
        </CardContent>
      </Card>
    </GuidedSetupLayout>
  );
}

// Project Summary Component
function ProjectSummary({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const router = useRouter();

  const handleCreateProject = () => {
    // TODO: Implement project creation logic
    console.log('Creating Self Study project with setup:', setup);
    
    // Navigate to projects page after creating
    router.push('/projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">Self Study Project Summary</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">Review your learning project before creating</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Project Name</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.projectName}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Purpose</h3>
                <p className="text-slate-600 text-sm sm:text-base">Self Study</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {setup.focusAreas.map(area => (
                    <span key={area} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Timeline</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.timeline}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Study Frequency</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.studyFrequency}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Collaboration</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.collaboration}</p>
              </div>
            </div>
            
            {setup.learningGoal && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Learning Goal</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.learningGoal}</p>
              </div>
            )}

            {setup.learningMaterials.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Learning Materials</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.learningMaterials.length} files uploaded</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back to Setup
              </Button>
              <Button onClick={handleCreateProject} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 