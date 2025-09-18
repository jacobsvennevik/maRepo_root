/**
 * Enhanced Quiz Wizard Main Component
 * 
 * Updated quiz creation wizard using the new shared components
 * and improved patterns for better code reuse and UX.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizApiService } from '../../services/quizApi';
import { isTestMode } from '@/features/projects/services/upload-utils';

// Shared components
import { SourceSelectionStep } from '@/components/wizard/shared/SourceSelectionStep';
import { AIMetadataStep } from '@/components/wizard/shared/AIMetadataStep';
import { useMultiSourceManagement } from '@/components/wizard/shared/useMultiSourceManagement';

// Enhanced local components
import { EnhancedBasicConfigStep } from './steps/EnhancedBasicConfigStep';

// Original components (to be gradually replaced)
import { 
  MethodSelectionStep,
  AdvancedConfigStep,
  GenerateQuizStep,
  ReviewCreateStep
} from './steps';

// Hooks and utilities
import { useQuizGeneration } from '../../hooks';
import { useFormValidation } from '../../hooks';
import { useWizardNavigation } from '../../hooks';
import { 
  QuizCreationSchema, 
  DEFAULT_QUIZ_FORM_CONFIG 
} from '../../schemas/quizCreation';
import { isTestModeActive } from '../../utils';
import { QUIZ_PRESETS, type QuizPreset } from '../../constants/presets';
import { generateMetadata } from '@/components/wizard/shared/titleGeneration';
import { 
  AlertTriangle,
  CheckCircle2,
  Brain,
  Settings,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface EnhancedQuizWizardProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (quizId: string) => void;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: string;
  required: boolean;
  showInProgress?: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const ENHANCED_WIZARD_STEPS: WizardStep[] = [
  { 
    id: 1, 
    title: 'Choose Sources', 
    description: 'Select content sources for questions',
    component: 'SourceSelection',
    required: true,
  },
  { 
    id: 2, 
    title: 'Configure Quiz', 
    description: 'Set quiz type and basic parameters',
    component: 'BasicConfig',
    required: true,
  },
  { 
    id: 3, 
    title: 'Review Details', 
    description: 'Finalize title and description',
    component: 'AIMetadata',
    required: true,
  },
  { 
    id: 4, 
    title: 'Advanced Options', 
    description: 'Customize advanced settings',
    component: 'AdvancedConfig',
    required: false,
  },
  { 
    id: 5, 
    title: 'Generate Quiz', 
    description: 'Create questions using AI',
    component: 'Generate',
    required: true,
    showInProgress: true,
  },
  { 
    id: 6, 
    title: 'Review & Create', 
    description: 'Final review and publish',
    component: 'Review',
    required: true,
  },
];

const TOTAL_STEPS = ENHANCED_WIZARD_STEPS.length;

// ============================================================================
// Main Component
// ============================================================================

export const EnhancedQuizWizard: React.FC<EnhancedQuizWizardProps> = ({
  projectId,
  open,
  onOpenChange,
  onCreated,
}) => {
  const router = useRouter();
  
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [selectedPreset, setSelectedPreset] = React.useState<QuizPreset | null>(null);
  const [metadataFormData, setMetadataFormData] = React.useState<any>({});
  const [skipAdvanced, setSkipAdvanced] = React.useState(false);
  
  // ============================================================================
  // Custom Hooks
  // ============================================================================
  
  const form = useFormValidation({
    schema: QuizCreationSchema,
    defaultValues: {
      ...DEFAULT_QUIZ_FORM_CONFIG,
      source_type: 'auto',
    },
  });

  const sourceManagement = useMultiSourceManagement({
    projectId,
    supportedTypes: ['flashcards', 'files', 'studyMaterials'],
    onSourcesChange: (sources) => {
      console.log('🔍 Sources changed:', sources);
    },
  });

  const quizGeneration = useQuizGeneration({
    projectId,
    onSuccess: (quiz) => {
      console.log('✅ Quiz generated successfully:', quiz);
    },
    onError: (error) => {
      console.error('❌ Quiz generation failed:', error);
    },
  });

  const navigation = useWizardNavigation({
    totalSteps: TOTAL_STEPS,
    validateStep: async (step) => {
      switch (step) {
        case 1: // Source selection
          return sourceManagement.hasMinimumSelection;
        case 2: // Basic config
          return form.getFormValue('title')?.trim().length > 0 && 
                 form.getFormValue('topic')?.trim().length > 0;
        case 3: // AI Metadata
          return metadataFormData.title?.trim().length > 0;
        case 4: // Advanced (optional)
          return true;
        case 5: // Generate
          return !!quizGeneration.generatedQuiz;
        default:
          return await form.validateForm();
      }
    },
  });

  // ============================================================================
  // Effects and Initialization
  // ============================================================================

  React.useEffect(() => {
    if (!open) {
      // Reset all state when wizard closes
      setSelectedPreset(null);
      setMetadataFormData({});
      setSkipAdvanced(false);
      form.resetForm();
      sourceManagement.clearSelection();
      quizGeneration.reset();
      navigation.reset();
    }
  }, [open]);

  // Auto-populate title and topic when sources change
  React.useEffect(() => {
    if (sourceManagement.totalSelectedCount > 0) {
      const allSources = [
        ...sourceManagement.flashcards,
        ...sourceManagement.files,
        ...sourceManagement.studyMaterials,
      ].filter(source => 
        sourceManagement.selectedSources.flashcards.ids.includes(source.id) ||
        sourceManagement.selectedSources.files.ids.includes(source.id) ||
        sourceManagement.selectedSources.studyMaterials.ids.includes(source.id)
      );

      if (allSources.length > 0) {
        const suggestions = generateMetadata({
          contentType: 'quiz',
          sources: allSources,
          quizType: form.getFormValue('quiz_type'),
          difficulty: form.getFormValue('difficulty'),
        });

        if (!form.getFormValue('topic')) {
          form.setFormValue('topic', suggestions.topic);
        }
        if (!form.getFormValue('title')) {
          form.setFormValue('title', suggestions.title);
        }
      }
    }
  }, [sourceManagement.selectedSources, sourceManagement.totalSelectedCount]);

  // Skip advanced step if preset is simple
  React.useEffect(() => {
    if (selectedPreset) {
      const simplePresets = ['quick-check', 'diagnostic-basic', 'practice-session'];
      setSkipAdvanced(simplePresets.includes(selectedPreset.id));
    }
  }, [selectedPreset]);

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handlePresetSelected = (preset: QuizPreset) => {
    setSelectedPreset(preset);
    console.log('🔍 Preset selected:', preset.name);
  };

  const handleMetadataChange = (metadata: any) => {
    setMetadataFormData(metadata);
    
    // Update form with metadata
    form.setFormValue('title', metadata.title);
    form.setFormValue('topic', metadata.topic);
    form.setFormValue('description', metadata.description);
  };

  const handleGenerateQuiz = async () => {
    const formData = form.form.getValues();
    
    // Prepare payload for API
    const payload = {
      project: projectId,
      topic: formData.topic || metadataFormData.topic || 'General Knowledge',
      quiz_type: formData.quiz_type || 'formative',
      difficulty: formData.difficulty || 'INTERMEDIATE',
      delivery_mode: formData.delivery_mode,
      max_questions: formData.max_questions,
      title: formData.title || metadataFormData.title,
      description: formData.description || metadataFormData.description,
      sources: sourceManagement.selectedSources,
      preset_id: selectedPreset?.id,
    };

    console.log('🔍 DEBUG: Generating quiz with payload:', payload);
    await quizGeneration.generateQuiz(payload);
  };

  const handleCreateQuiz = async () => {
    try {
      const formData = form.form.getValues();
      
      if (quizGeneration.generatedQuiz) {
        console.log('🔍 DEBUG: Using existing quiz session:', quizGeneration.generatedQuiz.id);
        
        // Update quiz metadata if needed
        if (metadataFormData.title || metadataFormData.description) {
          const quizApi = new QuizApiService();
          await quizApi.updateSession(quizGeneration.generatedQuiz.id, {
            title: metadataFormData.title,
          });
        }

        // Close wizard and navigate
        onOpenChange(false);
        router.push(`/projects/${projectId}/quiz-center/${quizGeneration.generatedQuiz.id}` as any);
        onCreated?.(quizGeneration.generatedQuiz.id);
        return;
      }

      // Fallback: Create quiz manually
      console.log('🔍 DEBUG: Creating quiz manually');
      
      const quizApi = new QuizApiService();
      const session = await quizApi.createSession({
        project: projectId,
        topic: formData.topic || metadataFormData.topic || 'General Knowledge',
        difficulty: formData.difficulty || 'INTERMEDIATE',
        delivery_mode: formData.delivery_mode,
        max_questions: formData.max_questions,
      });

      onOpenChange(false);
      router.push(`/projects/${projectId}/quiz-center/${session.id}` as any);
      onCreated?.(session.id);
      
    } catch (error) {
      console.error('❌ DEBUG: Quiz creation failed:', error);
    }
  };

  // ============================================================================
  // Navigation Helpers
  // ============================================================================
  
  const shouldSkipStep = (stepNumber: number): boolean => {
    if (stepNumber === 4 && skipAdvanced) return true;
    return false;
  };

  const getEffectiveStepNumber = (): number => {
    let effectiveStep = navigation.currentStep;
    if (navigation.currentStep > 4 && skipAdvanced) {
      effectiveStep = navigation.currentStep - 1;
    }
    return effectiveStep;
  };

  const goToNextStep = async () => {
    const nextStep = navigation.currentStep + 1;
    if (shouldSkipStep(nextStep)) {
      // Skip to the step after
      await navigation.goNext();
      await navigation.goNext();
    } else {
      await navigation.goNext();
    }
  };

  // ============================================================================
  // Render Functions
  // ============================================================================
  
  const renderCurrentStep = () => {
    const currentStep = navigation.currentStep;
    
    switch (currentStep) {
      case 1:
        return (
          <SourceSelectionStep
            sources={{
              flashcards: {
                enabled: true,
                count: sourceManagement.flashcards.length,
                items: sourceManagement.flashcards,
                loading: sourceManagement.isLoadingFlashcards,
              },
              files: {
                enabled: true,
                count: sourceManagement.files.length,
                items: sourceManagement.files,
                loading: sourceManagement.isLoadingFiles,
              },
              studyMaterials: {
                enabled: true,
                count: sourceManagement.studyMaterials.length,
                items: sourceManagement.studyMaterials,
                loading: sourceManagement.isLoadingStudyMaterials,
              },
            }}
            selectedSources={sourceManagement.selectedSources}
            onSourcesChange={sourceManagement.setSelectedSources}
            onFileUpload={sourceManagement.handleFileUpload}
            uploadedFiles={sourceManagement.uploadedFiles}
            onRemoveUploadedFile={sourceManagement.removeUploadedFile}
            searchTerm={sourceManagement.searchTerm}
            onSearchChange={sourceManagement.setSearchTerm}
          />
        );
      
      case 2:
        return (
          <EnhancedBasicConfigStep
            form={form.form}
            sources={[
              ...sourceManagement.flashcards,
              ...sourceManagement.files,
              ...sourceManagement.studyMaterials,
            ]}
            onPresetSelected={handlePresetSelected}
            showPresets={true}
          />
        );
      
      case 3:
        return (
          <AIMetadataStep
            sources={[
              ...sourceManagement.flashcards,
              ...sourceManagement.files,
              ...sourceManagement.studyMaterials,
            ]}
            initialMetadata={metadataFormData}
            onMetadataChange={handleMetadataChange}
            contentType="quiz"
            projectId={projectId}
            isGenerating={false}
            onRegenerate={() => console.log('Regenerating metadata...')}
          />
        );
      
      case 4:
        if (skipAdvanced) {
          // This should not render due to navigation logic
          return null;
        }
        return (
          <AdvancedConfigStep
            form={form.form}
          />
        );
      
      case 5:
        return (
          <GenerateQuizStep
            form={form.form}
            method="files" // Updated based on sources
            uploadedFiles={sourceManagement.uploadedFiles}
            selectedExistingFileIds={[
              ...sourceManagement.selectedSources.flashcards.ids,
              ...sourceManagement.selectedSources.files.ids,
              ...sourceManagement.selectedSources.studyMaterials.ids,
            ]}
            projectFiles={[
              ...sourceManagement.flashcards,
              ...sourceManagement.files,
              ...sourceManagement.studyMaterials,
            ]}
            isGenerating={quizGeneration.isGenerating}
            generatedQuiz={quizGeneration.generatedQuiz}
            error={quizGeneration.error}
            onGenerate={handleGenerateQuiz}
          />
        );
      
      case 6:
        return (
          <ReviewCreateStep
            form={form.form}
            method="files"
            generatedQuiz={quizGeneration.generatedQuiz}
            isSubmitting={false}
            error={quizGeneration.error}
            onCreate={handleCreateQuiz}
          />
        );
      
      default:
        return null;
    }
  };

  const getStepValidationStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return sourceManagement.hasMinimumSelection;
      case 2:
        return form.getFormValue('title')?.trim().length > 0;
      case 3:
        return metadataFormData.title?.trim().length > 0;
      case 5:
        return !!quizGeneration.generatedQuiz;
      default:
        return true;
    }
  };

  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <WizardShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create AI-Generated Quiz"
      step={getEffectiveStepNumber()}
      totalSteps={skipAdvanced ? TOTAL_STEPS - 1 : TOTAL_STEPS}
      headerExtras={
        <div className="flex items-center gap-2 mt-2">
          {selectedPreset && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              {selectedPreset.name}
            </Badge>
          )}
          {sourceManagement.totalSelectedCount > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {sourceManagement.totalSelectedCount} source{sourceManagement.totalSelectedCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {isTestModeActive() && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Test Mode
            </Badge>
          )}
        </div>
      }
    >
      <div data-testid="source-selection">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div>
          {navigation.canGoPrevious && (
            <Button variant="outline" onClick={navigation.goPrevious} size="sm">
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
            Cancel
          </Button>
          
          {navigation.currentStep === TOTAL_STEPS ? (
            <Button onClick={handleCreateQuiz} disabled={!quizGeneration.generatedQuiz} size="sm">
              Create Quiz
            </Button>
          ) : navigation.currentStep === 5 ? (
            <Button onClick={navigation.goNext} disabled={!quizGeneration.generatedQuiz} size="sm">
              Next
            </Button>
          ) : (
            <Button 
              onClick={goToNextStep} 
              disabled={!getStepValidationStatus(navigation.currentStep)}
              size="sm"
            >
              {skipAdvanced && navigation.currentStep === 3 ? 'Skip to Generation' : 'Next'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {sourceManagement.isAnyLoading && (
        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Loading sources... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </WizardShell>
  );
};

export default EnhancedQuizWizard;

