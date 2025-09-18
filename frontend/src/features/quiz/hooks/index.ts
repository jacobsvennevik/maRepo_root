/**
 * Quiz Feature Shared Hooks
 * 
 * Reusable hooks for common quiz functionality to improve code reuse
 * and maintainability.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ============================================================================
// File Management Hook
// ============================================================================

interface UseFileManagementOptions {
  projectId: string;
  onFilesChange?: (files: File[]) => void;
  onSelectedFilesChange?: (fileIds: (string | number)[]) => void;
}

interface UseFileManagementReturn {
  uploadedFiles: File[];
  selectedExistingFileIds: (string | number)[];
  existingSearch: string;
  isLoadingFiles: boolean;
  projectFiles: any[];
  handleFileUpload: (files: File[]) => void;
  removeUploadedFile: (index: number) => void;
  toggleExistingFile: (fileId: string | number) => void;
  setExistingSearch: (search: string) => void;
  loadProjectFiles: () => Promise<void>;
  clearFiles: () => void;
}

export const useFileManagement = ({
  projectId,
  onFilesChange,
  onSelectedFilesChange,
}: UseFileManagementOptions): UseFileManagementReturn => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedExistingFileIds, setSelectedExistingFileIds] = useState<(string | number)[]>([]);
  const [existingSearch, setExistingSearch] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    onFilesChange?.([...uploadedFiles, ...files]);
  }, [onFilesChange, uploadedFiles]);

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      onFilesChange?.(newFiles);
      return newFiles;
    });
  }, [onFilesChange]);

  const toggleExistingFile = useCallback((fileId: string | number) => {
    setSelectedExistingFileIds(prev => {
      const newSelection = prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId];
      onSelectedFilesChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectedFilesChange]);

  const loadProjectFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      // TODO: Replace with actual API call
      const mockFiles = [
        { id: 1, name: 'lecture-notes.pdf', file_type: 'pdf', uploaded_at: '2024-01-15', file_size: 1024000 },
        { id: 2, name: 'textbook-chapter.docx', file_type: 'docx', uploaded_at: '2024-01-14', file_size: 2048000 },
        { id: 3, name: 'practice-problems.pdf', file_type: 'pdf', uploaded_at: '2024-01-13', file_size: 512000 },
      ];
      setProjectFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load project files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setSelectedExistingFileIds([]);
    setExistingSearch('');
    onFilesChange?.([]);
    onSelectedFilesChange?.([]);
  }, [onFilesChange, onSelectedFilesChange]);

  return {
    uploadedFiles,
    selectedExistingFileIds,
    existingSearch,
    isLoadingFiles,
    projectFiles,
    handleFileUpload,
    removeUploadedFile,
    toggleExistingFile,
    setExistingSearch,
    loadProjectFiles,
    clearFiles,
  };
};

// ============================================================================
// Quiz Generation Hook
// ============================================================================

interface UseQuizGenerationOptions {
  projectId: string;
  onSuccess?: (quiz: any) => void;
  onError?: (error: string) => void;
}

interface UseQuizGenerationReturn {
  isGenerating: boolean;
  generatedQuiz: any;
  error: string | null;
  generateQuiz: (config: any) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useQuizGeneration = ({
  projectId,
  onSuccess,
  onError,
}: UseQuizGenerationOptions): UseQuizGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async (config: any) => {
    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const mockQuiz = {
        id: `quiz_${Date.now()}`,
        title: config.title || 'Generated Quiz',
        questions: Array.from({ length: config.max_questions || 10 }, (_, i) => ({
          id: `q_${i + 1}`,
          text: `Question ${i + 1}`,
          type: 'multiple_choice',
          choices: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_choice_index: 0,
        })),
      };

      setGeneratedQuiz(mockQuiz);
      onSuccess?.(mockQuiz);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setGeneratedQuiz(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    generatedQuiz,
    error,
    generateQuiz,
    clearError,
    reset,
  };
};

// ============================================================================
// Form Validation Hook
// ============================================================================

interface UseFormValidationOptions<T> {
  schema: any;
  defaultValues?: Partial<T>;
  onValidationChange?: (isValid: boolean) => void;
}

interface UseFormValidationReturn<T> {
  form: any;
  isValid: boolean;
  errors: any;
  validateField: (fieldName: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  setFormValue: (fieldName: keyof T, value: any) => void;
  getFormValue: (fieldName: keyof T) => any;
}

export const useFormValidation = <T extends FieldValues>({
  schema,
  defaultValues,
  onValidationChange,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const { handleSubmit, trigger, watch, setValue, getValues, formState } = form;

  const isValid = formState.isValid;
  const errors = formState.errors as any;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const validateField = useCallback(async (fieldName: keyof T): Promise<boolean> => {
    const result = await trigger(fieldName as any);
    return result;
  }, [trigger]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const result = await trigger();
    return result;
  }, [trigger]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  const setFormValue = useCallback((fieldName: keyof T, value: any) => {
    setValue(fieldName as any, value);
  }, [setValue]);

  const getFormValue = useCallback((fieldName: keyof T) => {
    return getValues(fieldName as any);
  }, [getValues]);

  return {
    form,
    isValid,
    errors,
    validateField,
    validateForm,
    resetForm,
    setFormValue,
    getFormValue,
  };
};

// ============================================================================
// Wizard Navigation Hook
// ============================================================================

interface UseWizardNavigationOptions {
  totalSteps: number;
  onStepChange?: (step: number) => void;
  validateStep?: (step: number) => Promise<boolean>;
}

interface UseWizardNavigationReturn {
  currentStep: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goNext: () => Promise<void>;
  goPrevious: () => void;
  goToStep: (step: number) => Promise<void>;
  reset: () => void;
}

export const useWizardNavigation = ({
  totalSteps,
  onStepChange,
  validateStep,
}: UseWizardNavigationOptions): UseWizardNavigationReturn => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const canGoNext = currentStep < totalSteps;
  const canGoPrevious = currentStep > 1;

  const goNext = useCallback(async () => {
    if (!canGoNext) return;

    // Skip validation on step 1 (method selection)
    if (currentStep === 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
      return;
    }

    // Validate current step if validator provided
    if (validateStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    onStepChange?.(nextStep);
  }, [currentStep, canGoNext, validateStep, onStepChange]);

  const goPrevious = useCallback(() => {
    if (!canGoPrevious) return;
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    onStepChange?.(prevStep);
  }, [currentStep, canGoPrevious, onStepChange]);

  const goToStep = useCallback(async (step: number) => {
    if (step < 1 || step > totalSteps) return;
    
    // Validate current step if validator provided
    if (validateStep && step > currentStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }

    setCurrentStep(step);
    onStepChange?.(step);
  }, [currentStep, totalSteps, validateStep, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    onStepChange?.(1);
  }, [onStepChange]);

  return {
    currentStep,
    canGoNext,
    canGoPrevious,
    goNext,
    goPrevious,
    goToStep,
    reset,
  };
};

// ============================================================================
// Auto-save Hook
// ============================================================================

interface UseAutoSaveOptions<T> {
  data: T;
  key: string;
  interval?: number;
  onSave?: (data: T) => void;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  save: () => void;
  clear: () => void;
}

export const useAutoSave = <T>({
  data,
  key,
  interval = 30000, // 30 seconds
  onSave,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setLastSaved(new Date());
      onSave?.(data);
    } catch (error) {
      console.warn('Failed to save data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, key, onSave]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }, [key]);

  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(save, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [save, interval]);

  return {
    isSaving,
    lastSaved,
    save,
    clear,
  };
};
