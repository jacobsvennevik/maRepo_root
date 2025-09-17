/**
 * Quiz Wizard Main Component
 * 
 * Refactored quiz creation wizard using modular step components
 * for better maintainability and code reuse.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Button } from '@/components/ui/button';
import { QuizApiService } from '../../services/quizApi';
import { isTestMode } from '@/features/projects/services/upload-utils';
import { 
  MethodSelectionStep,
  BasicConfigStep,
  SourceConfigStep,
  AdvancedConfigStep,
  GenerateQuizStep,
  ReviewCreateStep
} from './steps';
import { useFileManagement } from '../../hooks';
import { useQuizGeneration } from '../../hooks';
import { useFormValidation } from '../../hooks';
import { useWizardNavigation } from '../../hooks';
import { 
  QuizCreationSchema, 
  DEFAULT_QUIZ_CONFIG 
} from '../../schemas/quizCreation';
import { 
  TOTAL_WIZARD_STEPS,
} from '../../constants';
import { isTestModeActive } from '../../utils';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface QuizWizardProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (quizId: string) => void;
}

type StartMethod = 'auto' | 'files' | 'manual';

// ============================================================================
// Main Component
// ============================================================================

export const QuizWizard: React.FC<QuizWizardProps> = ({
  projectId,
  open,
  onOpenChange,
  onCreated,
}) => {
  const router = useRouter();
  
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [method, setMethod] = React.useState<StartMethod | null>(null);
  const [suggestedDifficulty, setSuggestedDifficulty] = React.useState<string>('');
  
  // ============================================================================
  // Custom Hooks
  // ============================================================================
  
  const form = useFormValidation({
    schema: QuizCreationSchema,
    defaultValues: {
      ...DEFAULT_QUIZ_CONFIG,
      source_type: 'auto',
    },
  });

  const fileManagement = useFileManagement({
    projectId,
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
    totalSteps: TOTAL_WIZARD_STEPS,
    validateStep: async (step) => {
      if (step === 1) return true; // Method selection doesn't need validation
      return await form.validateForm();
    },
  });

  // ============================================================================
  // Effects and Initialization
  // ============================================================================

  React.useEffect(() => {
    if (!open) {
      // Reset all state when wizard closes
      setMethod(null);
      setSuggestedDifficulty('');
      form.resetForm();
      fileManagement.clearFiles();
      quizGeneration.reset();
      navigation.reset();
    }
  }, [open]);

  // Load project files when wizard opens
  React.useEffect(() => {
    if (open && projectId) {
      fileManagement.loadProjectFiles();
    }
  }, [open, projectId]);

  // Auto-populate suggestions when topic changes
  React.useEffect(() => {
    const subscription = form.form.watch((value: any, { name }: { name?: string }) => {
      if (name === 'topic' && value.topic) {
        const difficulty = getDifficultySuggestions(value.topic);
        setSuggestedDifficulty(difficulty);
        form.setFormValue('difficulty', difficulty);
        
        // Auto-suggest title if empty
        if (!value.title) {
          const suggestedTitle = `${value.topic} Quiz`;
          form.setFormValue('title', suggestedTitle);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.form]);

  // Auto-populate title when files are selected
  React.useEffect(() => {
    const currentTitle = form.getFormValue('title');
    if (!currentTitle?.trim() && method === 'files') {
      const suggestedTitle = deriveTitleFromSource(method, fileManagement.uploadedFiles, fileManagement.projectFiles);
      if (suggestedTitle) {
        form.setFormValue('title', suggestedTitle);
        console.log('🔍 DEBUG: Auto-populated title from files:', suggestedTitle);
      }
    }
  }, [fileManagement.uploadedFiles, fileManagement.selectedExistingFileIds, method]);

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleMethodSelect = (selectedMethod: StartMethod) => {
    setMethod(selectedMethod);
    form.setFormValue('source_type', selectedMethod);
    navigation.goNext();
  };

  const handleGenerateQuiz = async () => {
    if (method !== 'files' && method !== 'auto') {
      console.error('Invalid generation method');
      return;
    }

    const formData = form.form.getValues();
    
    // Prepare payload for API
    const payload = {
      project: projectId,
      topic: formData.topic || 'General Knowledge',
      quiz_type: formData.quiz_type || 'formative',
      difficulty: formData.difficulty || 'INTERMEDIATE',
      delivery_mode: formData.delivery_mode,
      max_questions: formData.max_questions,
      test_style: formData.test_style,
      style_config_override: formData.style_config_override,
    };

    console.log('🔍 DEBUG: Generating quiz with payload:', payload);
    console.log('🧪 Test mode active:', isTestModeActive());

    await quizGeneration.generateQuiz(payload);
  };

  const handleCreateQuiz = async () => {
    try {
      const formData = form.form.getValues();
      
      if (quizGeneration.generatedQuiz) {
        // Quiz was already created during generation
        console.log('🔍 DEBUG: Using existing quiz session:', quizGeneration.generatedQuiz.id);
        
        // Update quiz metadata if needed
        if (formData.title || formData.description) {
          const quizApi = new QuizApiService();
          await quizApi.updateSession(quizGeneration.generatedQuiz.id, {
            title: formData.title,
            description: formData.description,
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
        topic: formData.topic || 'General Knowledge',
        difficulty: formData.difficulty || 'INTERMEDIATE',
        delivery_mode: formData.delivery_mode,
        max_questions: formData.max_questions,
        title: formData.title,
        description: formData.description,
      });

      // Close wizard and navigate
      onOpenChange(false);
      router.push(`/projects/${projectId}/quiz-center/${session.id}` as any);
      onCreated?.(session.id);
      
    } catch (error) {
      console.error('❌ DEBUG: Quiz creation failed:', error);
    }
  };

  // ============================================================================
  // Validation Helpers
  // ============================================================================
  
  const canContinueFromStep2 = method === 'files' ? 
    (fileManagement.uploadedFiles.length > 0 || fileManagement.selectedExistingFileIds.length > 0) : true;
  const canContinueFromStep3 = form.getFormValue('title')?.trim().length > 0 && form.getFormValue('topic')?.trim().length > 0;

  // ============================================================================
  // Render Functions
  // ============================================================================
  
  const renderCurrentStep = () => {
    switch (navigation.currentStep) {
      case 1:
        return (
          <MethodSelectionStep
            onMethodSelect={handleMethodSelect}
            isTestMode={isTestModeActive()}
          />
        );
      
      case 2:
        return (
          <BasicConfigStep
            form={form.form}
            suggestedDifficulty={suggestedDifficulty}
          />
        );
      
      case 3:
        return (
          <BasicConfigStep
            form={form.form}
            suggestedDifficulty={suggestedDifficulty}
          />
        );
      
      case 4:
        return (
          <SourceConfigStep
            method={method!}
            uploadedFiles={fileManagement.uploadedFiles}
            selectedExistingFileIds={fileManagement.selectedExistingFileIds}
            existingSearch={fileManagement.existingSearch}
            isLoadingFiles={fileManagement.isLoadingFiles}
            projectFiles={fileManagement.projectFiles}
            onFileUpload={fileManagement.handleFileUpload}
            onRemoveFile={fileManagement.removeUploadedFile}
            onToggleExistingFile={fileManagement.toggleExistingFile}
            onSearchChange={fileManagement.setExistingSearch}
          />
        );
      
      case 5:
        return (
          <AdvancedConfigStep
            form={form.form}
          />
        );
      
      case 6:
        return (
          <GenerateQuizStep
            form={form.form}
            method={method!}
            uploadedFiles={fileManagement.uploadedFiles}
            selectedExistingFileIds={fileManagement.selectedExistingFileIds}
            projectFiles={fileManagement.projectFiles}
            isGenerating={quizGeneration.isGenerating}
            generatedQuiz={quizGeneration.generatedQuiz}
            error={quizGeneration.error}
            onGenerate={handleGenerateQuiz}
          />
        );
      
      case 7:
        return (
          <ReviewCreateStep
            form={form.form}
            method={method!}
            generatedQuiz={quizGeneration.generatedQuiz}
            isSubmitting={false} // TODO: Add submitting state
            error={quizGeneration.error}
            onCreate={handleCreateQuiz}
          />
        );
      
      default:
        return null;
    }
  };

  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <WizardShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create Quiz"
      step={navigation.currentStep}
      totalSteps={TOTAL_WIZARD_STEPS}
    >
      {renderCurrentStep()}

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
          {navigation.currentStep === 1 ? null : navigation.currentStep === 7 ? (
            <Button onClick={handleCreateQuiz} disabled={!quizGeneration.generatedQuiz} size="sm">
              Create Quiz
            </Button>
          ) : navigation.currentStep === 6 ? (
            <Button onClick={navigation.goNext} disabled={!quizGeneration.generatedQuiz} size="sm">
              Next
            </Button>
          ) : navigation.currentStep === 5 ? (
            <Button onClick={navigation.goNext} disabled={!quizGeneration.generatedQuiz} size="sm">
              Next
            </Button>
          ) : (
            <Button onClick={navigation.goNext} disabled={
              (navigation.currentStep === 2 && !canContinueFromStep3) ||
              (navigation.currentStep === 3 && !canContinueFromStep2)
            } size="sm">
              Next
            </Button>
          )}
        </div>
      </div>
    </WizardShell>
  );
};

// ============================================================================
// Helper Functions (imported from utils)
// ============================================================================

const getDifficultySuggestions = (topic: string): string => {
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('basic') || topicLower.includes('intro') || topicLower.includes('fundamental')) {
    return 'BEGINNER';
  }
  
  if (topicLower.includes('advanced') || topicLower.includes('expert') || topicLower.includes('research')) {
    return 'ADVANCED';
  }
  
  if (topicLower.includes('master') || topicLower.includes('phd') || topicLower.includes('doctoral')) {
    return 'EXPERT';
  }
  
  return 'INTERMEDIATE';
};

const deriveTitleFromSource = (method: string, uploadedFiles: File[], selectedFiles: any[]): string => {
  if (method === 'files') {
    if (uploadedFiles.length > 0) {
      const base = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
      return `${base} Quiz`;
    }
    const picked = selectedFiles.find(f => f.id);
    if (picked) {
      const base = picked.name.replace(/\.[^.]+$/, '');
      return `${base} Quiz`;
    }
  }
  return '';
};

export default QuizWizard;
