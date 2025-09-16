"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FileText, 
  Upload, 
  Timer, 
  ListChecks, 
  Settings, 
  Eye,
  File,
  Image,
  Code,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  QuizCreationSchema, 
  type QuizCreationForm,
  DEFAULT_QUIZ_CONFIG,
  DIFFICULTY_OPTIONS,
  DELIVERY_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
  getDifficultySuggestions,
  getSuggestedTimeLimit,
  getSuggestedQuestionMix,
  validateQuizConfig
} from '../schemas/quizCreation';
import { QuizApiService } from '../services/quizApi';
import { isTestMode } from '@/features/projects/services/upload-utils';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface ProjectFile {
  id: string | number;
  name: string;
  file_type?: string;
  uploaded_at?: string;
  file_size?: number;
}

interface CreateQuizWizardProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (quizId: string) => void;
}

type StartMethod = 'auto' | 'files' | 'manual';

// ============================================================================
// Test Mode Detection (following flashcard pattern)
// ============================================================================

const isTestModeActive = (): boolean => {
  // Check if running in test environment
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  // Check for explicit test mode flag in development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  // Check for localhost and test mode
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    process.env.NEXT_PUBLIC_TEST_MODE === "true"
  ) {
    return true;
  }

  return false;
};

// ============================================================================
// Main Component
// ============================================================================

export function CreateQuizWizard({ projectId, open, onOpenChange, onCreated }: CreateQuizWizardProps) {
  const router = useRouter();
  
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [step, setStep] = React.useState<number>(1);
  const [totalSteps] = React.useState<number>(6);
  const [method, setMethod] = React.useState<StartMethod | null>(null);
  
  // File management (following flashcard pattern)
  const [projectFiles, setProjectFiles] = React.useState<ProjectFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [selectedExistingFileIds, setSelectedExistingFileIds] = React.useState<Array<string | number>>([]);
  const [existingSearch, setExistingSearch] = React.useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = React.useState<boolean>(false);
  
  // Generation and submission states
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [generatedQuiz, setGeneratedQuiz] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // AI suggestions
  const [suggestedTitle, setSuggestedTitle] = React.useState<string>('');
  const [suggestedDescription, setSuggestedDescription] = React.useState<string>('');
  const [suggestedDifficulty, setSuggestedDifficulty] = React.useState<string>('');
  
  // ============================================================================
  // Form Management (following flashcard pattern)
  // ============================================================================
  
  const form = useForm<QuizCreationForm>({
    resolver: zodResolver(QuizCreationSchema),
    defaultValues: {
      ...DEFAULT_QUIZ_CONFIG,
      source_type: 'auto',
    },
  });

  const { handleSubmit, trigger, watch, setValue, getValues } = form;

  // ============================================================================
  // Debug Logging (following flashcard pattern)
  // ============================================================================
  
  console.log('🔍 DEBUG: CreateQuizWizard render state:', {
    open,
    step,
    method,
    projectId,
    projectFiles: projectFiles.length,
    uploadedFiles: uploadedFiles.length,
    selectedExistingFileIds: selectedExistingFileIds.length,
    isTestMode: isTestModeActive()
  });

  // ============================================================================
  // Effects and Initialization
  // ============================================================================
  
  React.useEffect(() => {
    if (!open) {
      setStep(1);
      setMethod(null);
      setProjectFiles([]);
      setUploadedFiles([]);
      setSelectedExistingFileIds([]);
      setExistingSearch('');
      setGeneratedQuiz(null);
      setError(null);
      setSuggestedTitle('');
      setSuggestedDescription('');
      setSuggestedDifficulty('');
      form.reset();
    }
  }, [open, form]);

  // Load project files when wizard opens
  React.useEffect(() => {
    if (open && projectId) {
      loadProjectFiles();
    }
  }, [open, projectId]);

  // Auto-populate suggestions when topic changes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'topic' && value.topic) {
        const difficulty = getDifficultySuggestions(value.topic);
        setSuggestedDifficulty(difficulty);
        setValue('difficulty', difficulty);
        
        // Auto-suggest title if empty
        if (!value.title) {
          const suggestedTitle = `${value.topic} Quiz`;
          setSuggestedTitle(suggestedTitle);
          setValue('title', suggestedTitle);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // ============================================================================
  // File Management Functions
  // ============================================================================
  
  const loadProjectFiles = async () => {
    setIsLoadingFiles(true);
    try {
      // TODO: Replace with actual API call
      const mockFiles: ProjectFile[] = [
        { id: 1, name: 'lecture-notes.pdf', file_type: 'pdf', uploaded_at: '2024-01-15', file_size: 1024000 },
        { id: 2, name: 'textbook-chapter.docx', file_type: 'docx', uploaded_at: '2024-01-14', file_size: 2048000 },
        { id: 3, name: 'practice-problems.pdf', file_type: 'pdf', uploaded_at: '2024-01-13', file_size: 512000 },
      ];
      setProjectFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load project files:', error);
      setError('Failed to load project files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleExistingFile = (fileId: string | number) => {
    setSelectedExistingFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const deriveTitleFromSource = () => {
    if (method === 'files') {
      if (uploadedFiles.length > 0) {
        const base = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
        return `${base} Quiz`;
      }
      const picked = projectFiles.find(f => selectedExistingFileIds.includes(f.id));
      if (picked) {
        const base = picked.name.replace(/\.[^.]+$/, '');
        return `${base} Quiz`;
      }
    }
    return '';
  };

  // Auto-populate title when files are selected
  React.useEffect(() => {
    const currentTitle = getValues('title');
    if (!currentTitle?.trim() && method === 'files') {
      const suggestedTitle = deriveTitleFromSource();
      if (suggestedTitle) {
        setValue('title', suggestedTitle);
        console.log('🔍 DEBUG: Auto-populated title from files:', suggestedTitle);
      }
    }
  }, [uploadedFiles, selectedExistingFileIds, method, setValue, getValues]);

  // ============================================================================
  // Navigation Functions
  // ============================================================================
  
  const goNext = async () => {
    const isValid = await trigger();
    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ============================================================================
  // Generation Functions
  // ============================================================================
  
  const generateQuiz = async () => {
    if (method !== 'files' && method !== 'auto') {
      setError('Invalid generation method');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = getValues();
      
      // Prepare payload for API
      const payload = {
        project: projectId,
        topic: formData.topic || 'General Knowledge',
        difficulty: formData.difficulty === 'BEGINNER' ? 1 : 
                   formData.difficulty === 'INTERMEDIATE' ? 2 :
                   formData.difficulty === 'ADVANCED' ? 3 : 4,
        delivery_mode: formData.delivery_mode,
        max_questions: formData.max_questions,
        test_style: formData.test_style,
        style_config_override: formData.style_config_override,
      };

      console.log('🔍 DEBUG: Generating quiz with payload:', payload);
      console.log('🧪 Test mode active:', isTestModeActive());

      // Use QuizApiService for generation
      const quizApi = new QuizApiService();
      const session = await quizApi.createSession(payload);
      
      setGeneratedQuiz(session);
      console.log('✅ DEBUG: Quiz generated successfully:', session);
      
    } catch (error) {
      console.error('❌ DEBUG: Quiz generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // Submission Functions
  // ============================================================================
  
  const handleCreate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = getValues();
      
      if (generatedQuiz) {
        // Quiz was already created during generation
        console.log('🔍 DEBUG: Using existing quiz session:', generatedQuiz.id);
        
        // Update quiz metadata if needed
        if (formData.title || formData.description) {
          const quizApi = new QuizApiService();
          await quizApi.updateSession(generatedQuiz.id, {
            title: formData.title,
            description: formData.description,
          });
        }

        // Close wizard and navigate
        onOpenChange(false);
        router.push(`/projects/${projectId}/quiz-center/${generatedQuiz.id}` as any);
        onCreated?.(generatedQuiz.id);
        return;
      }

      // Fallback: Create quiz manually
      console.log('🔍 DEBUG: Creating quiz manually');
      
      const quizApi = new QuizApiService();
      const session = await quizApi.createSession({
        project: projectId,
        topic: formData.topic || 'General Knowledge',
        difficulty: formData.difficulty === 'BEGINNER' ? 1 : 
                   formData.difficulty === 'INTERMEDIATE' ? 2 :
                   formData.difficulty === 'ADVANCED' ? 3 : 4,
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
      setError(error instanceof Error ? error.message : 'Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Validation Helpers
  // ============================================================================
  
  const canContinueFromStep1 = Boolean(method);
  const canContinueFromStep2 = method === 'files' ? 
    (uploadedFiles.length > 0 || selectedExistingFileIds.length > 0) : true;
  const canContinueFromStep3 = getValues('title')?.trim().length > 0 && getValues('topic')?.trim().length > 0;

  // ============================================================================
  // UI Helper Functions
  // ============================================================================
  
  const getFileIcon = (fileName: string, fileType?: string) => {
    if (fileType === 'pdf') return <File className="h-3 w-3 text-red-500" />;
    if (fileType === 'docx' || fileType === 'doc') return <FileText className="h-3 w-3 text-blue-500" />;
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') return <Image className="h-3 w-3 text-green-500" />;
    if (fileType === 'tsx' || fileType === 'ts' || fileType === 'js' || fileType === 'jsx') return <Code className="h-3 w-3 text-purple-500" />;
    if (fileType === 'html' || fileType === 'css') return <Code className="h-3 w-3 text-orange-500" />;
    return <File className="h-3 w-3 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // ============================================================================
  // Render Functions
  // ============================================================================
  
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">How would you like to create your quiz?</h2>
        <p className="text-sm text-slate-600">Choose a method that works best for your content</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-200" 
          onClick={() => { setMethod("auto"); goNext(); }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">AI Auto-Generate</h3>
                <p className="text-sm text-slate-600">Let AI create a quiz from your project content automatically</p>
                <Badge variant="secondary" className="mt-1">Recommended</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-200" 
          onClick={() => { setMethod("files"); goNext(); }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">From Files</h3>
                <p className="text-sm text-slate-600">Generate quiz based on specific uploaded documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-emerald-200" 
          onClick={() => { setMethod("manual"); goNext(); }}
        >
          <CardContent className="p4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <ListChecks className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Manual Setup</h3>
                <p className="text-sm text-slate-600">Define questions and settings yourself</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isTestModeActive() && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            🧪 Test mode is active - AI calls will be mocked with predefined responses
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderStep2 = () => (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Basic Quiz Settings</h2>
          <p className="text-sm text-slate-600">Configure the basic parameters for your quiz</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Quiz Title *</Label>
            <Input 
              id="title" 
              {...form.register('title')}
              placeholder="e.g., Week 3 Knowledge Check"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="topic">Topic/Subject *</Label>
            <Input 
              id="topic" 
              {...form.register('topic')}
              placeholder="e.g., Machine Learning Fundamentals"
            />
            {form.formState.errors.topic && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.topic.message}</p>
            )}
            {suggestedDifficulty && (
              <p className="text-sm text-blue-600 mt-1">
                💡 Suggested difficulty: {suggestedDifficulty}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...form.register('description')}
              placeholder="Optional description of the quiz content..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select 
                value={form.watch('difficulty')} 
                onValueChange={(value) => setValue('difficulty', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-slate-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_questions">Number of Questions</Label>
              <Input 
                id="max_questions" 
                type="number" 
                min={1} 
                max={50}
                {...form.register('max_questions', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="time_limit_sec">Time Limit (minutes)</Label>
            <Input 
              id="time_limit_sec" 
              type="number" 
              min={1} 
              max={120}
              {...form.register('time_limit_sec', { 
                valueAsNumber: true,
                setValueAs: (value) => value ? value * 60 : undefined
              })}
              placeholder="15"
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Suggested: {Math.round((getSuggestedTimeLimit(form.watch('max_questions') || 10, form.watch('difficulty') || 'INTERMEDIATE')) / 60)} minutes
            </p>
          </div>
        </div>
      </div>
    </FormProvider>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Source Configuration</h2>
        <p className="text-sm text-slate-600">
          {method === 'files' ? 'Select files to generate questions from' : 
           method === 'auto' ? 'AI will analyze your project content automatically' :
           'Configure manual quiz creation'}
        </p>
      </div>

      {method === 'files' && (
        <div className="space-y-4">
          {/* File Upload Section */}
          <div>
            <Label>Upload New Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
              </label>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div>
              <Label>Uploaded Files</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeUploadedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Project Files */}
          <div>
            <Label>Project Files</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search files..."
                value={existingSearch}
                onChange={(e) => setExistingSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isLoadingFiles ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading files...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {projectFiles
                  .filter(file => 
                    file.name.toLowerCase().includes(existingSearch.toLowerCase())
                  )
                  .map(file => (
                    <div 
                      key={file.id} 
                      className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                        selectedExistingFileIds.includes(file.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleExistingFile(file.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.name, file.file_type)}
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <div className="text-xs text-gray-500">
                            {file.file_type?.toUpperCase()} • {formatFileSize(file.file_size || 0)} • {formatTimeAgo(file.uploaded_at || '')}
                          </div>
                        </div>
                      </div>
                      {selectedExistingFileIds.includes(file.id) && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {method === 'auto' && (
        <div className="text-center space-y-4">
          <div className="p-6 border rounded-lg bg-blue-50">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">AI Auto-Generation</h3>
            <p className="text-sm text-blue-700">
              AI will analyze your project content and create relevant quiz questions automatically.
              This includes all uploaded files, notes, and project materials.
            </p>
          </div>
        </div>
      )}

      {method === 'manual' && (
        <div className="text-center space-y-4">
          <div className="p-6 border rounded-lg bg-emerald-50">
            <ListChecks className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-semibold text-emerald-900">Manual Setup</h3>
            <p className="text-sm text-emerald-700">
              You'll be able to manually create and configure quiz questions after the basic setup is complete.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Advanced Configuration</h2>
          <p className="text-sm text-slate-600">Fine-tune your quiz settings</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="delivery_mode">Feedback Mode</Label>
            <Select 
              value={form.watch('delivery_mode')} 
              onValueChange={(value) => setValue('delivery_mode', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback mode" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_MODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-slate-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Question Mix</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="MCQ" className="text-xs">Multiple Choice</Label>
                <Input 
                  id="MCQ" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...form.register('question_mix.MCQ', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="SHORT_ANSWER" className="text-xs">Short Answer</Label>
                <Input 
                  id="SHORT_ANSWER" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...form.register('question_mix.SHORT_ANSWER', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="PRINCIPLE" className="text-xs">Principle</Label>
                <Input 
                  id="PRINCIPLE" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...form.register('question_mix.PRINCIPLE', { valueAsNumber: true })}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total: {getQuestionMixTotal(form.watch('question_mix'))} questions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={form.watch('language')} 
                onValueChange={(value) => setValue('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test_style">Test Style</Label>
              <Select 
                value={form.watch('test_style') || ''} 
                onValueChange={(value) => setValue('test_style', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default Style</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="conceptual">Conceptual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Quiz Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow_retakes" 
                  checked={form.watch('allow_retakes')}
                  onCheckedChange={(checked) => setValue('allow_retakes', checked as boolean)}
                />
                <Label htmlFor="allow_retakes" className="text-sm">Allow multiple attempts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show_hints" 
                  checked={form.watch('show_hints')}
                  onCheckedChange={(checked) => setValue('show_hints', checked as boolean)}
                />
                <Label htmlFor="show_hints" className="text-sm">Show hints during quiz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="randomize_questions" 
                  checked={form.watch('randomize_questions')}
                  onCheckedChange={(checked) => setValue('randomize_questions', checked as boolean)}
                />
                <Label htmlFor="randomize_questions" className="text-sm">Randomize question order</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="randomize_choices" 
                  checked={form.watch('randomize_choices')}
                  onCheckedChange={(checked) => setValue('randomize_choices', checked as boolean)}
                />
                <Label htmlFor="randomize_choices" className="text-sm">Randomize answer choices</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Generate Quiz</h2>
        <p className="text-sm text-slate-600">Review your settings and generate the quiz</p>
      </div>

      <div className="space-y-4">
        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Title:</span>
                <span className="ml-2">{getValues('title') || 'Untitled Quiz'}</span>
              </div>
              <div>
                <span className="font-medium">Topic:</span>
                <span className="ml-2">{getValues('topic') || 'General'}</span>
              </div>
              <div>
                <span className="font-medium">Difficulty:</span>
                <span className="ml-2">{getValues('difficulty')}</span>
              </div>
              <div>
                <span className="font-medium">Questions:</span>
                <span className="ml-2">{getValues('max_questions')}</span>
              </div>
              <div>
                <span className="font-medium">Time Limit:</span>
                <span className="ml-2">{getValues('time_limit_sec') ? Math.round(getValues('time_limit_sec')! / 60) : 'No limit'} min</span>
              </div>
              <div>
                <span className="font-medium">Method:</span>
                <span className="ml-2 capitalize">{method}</span>
              </div>
            </div>
            
            {method === 'files' && (
              <div>
                <span className="font-medium text-sm">Source Files:</span>
                <div className="mt-1 space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-slate-600">
                      📄 {file.name}
                    </div>
                  ))}
                  {selectedExistingFileIds.map(fileId => {
                    const file = projectFiles.find(f => f.id === fileId);
                    return file ? (
                      <div key={fileId} className="text-xs text-slate-600">
                        📄 {file.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Button */}
        <div className="text-center">
          <Button 
            onClick={generateQuiz}
            disabled={isGenerating || !canContinueFromStep3}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="mt-4">
              <Progress value={33} className="w-full" />
              <p className="text-sm text-slate-600 mt-2">
                AI is analyzing your content and creating questions...
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {generatedQuiz && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              ✅ Quiz generated successfully! {generatedQuiz.questions?.length || 0} questions created.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Review & Create</h2>
        <p className="text-sm text-slate-600">Final review before creating your quiz</p>
      </div>

      <div className="space-y-4">
        {/* Final Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Quiz Title:</span>
                <span>{getValues('title') || 'Untitled Quiz'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Topic:</span>
                <span>{getValues('topic') || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Difficulty:</span>
                <span>{getValues('difficulty')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Questions:</span>
                <span>{getValues('max_questions')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Limit:</span>
                <span>{getValues('time_limit_sec') ? Math.round(getValues('time_limit_sec')! / 60) : 'No limit'} min</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Feedback Mode:</span>
                <span>{getValues('delivery_mode')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Language:</span>
                <span>{getValues('language')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Creation Method:</span>
                <span className="capitalize">{method}</span>
              </div>
            </div>

            {generatedQuiz && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Quiz Generated Successfully</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {generatedQuiz.questions?.length || 0} questions ready
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="text-center">
          <Button 
            onClick={handleCreate}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Quiz...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Quiz
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <WizardShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create Quiz"
      step={step}
      totalSteps={totalSteps}
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={goBack} disabled={isSubmitting} size="sm">
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} size="sm">
            Cancel
          </Button>
          {step === 1 ? null : step === 6 ? (
            <Button onClick={handleCreate} disabled={isSubmitting || !generatedQuiz} size="sm">
              {isSubmitting ? 'Creating…' : 'Create Quiz'}
            </Button>
          ) : step === 5 ? (
            <Button onClick={goNext} disabled={!generatedQuiz} size="sm">
              Next
            </Button>
          ) : (
            <Button onClick={goNext} disabled={
              (step === 2 && !canContinueFromStep3) ||
              (step === 3 && !canContinueFromStep2) ||
              isSubmitting
            } size="sm">
              Next
            </Button>
          )}
        </div>
      </div>
    </WizardShell>
  );
}

export default CreateQuizWizard;