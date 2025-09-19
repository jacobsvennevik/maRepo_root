"use client";

import React from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FlashcardReviewStep from './FlashcardReviewStep';
import { postGenerateFlashcards } from '@/lib/api/flashcards';
import { FlashcardDeckSchema, type FlashcardDeckForm } from './schemas/flashcardDeck';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosGeneration, axiosApi } from '@/lib/axios';
import { getProjectScoped, postProjectScoped } from '@/lib/projectApi';
// Test mode detection - check dynamically to respond to environment variable changes during tests
const isTestMode = (): boolean => {
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

import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, Upload, PencilLine, MoreVertical, Clock, File, Image, Code, FolderOpen, X, Brain, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import type { AssessmentSet, CreateAssessmentSetForm, AssessmentKind } from '@/features/diagnostics/types/assessment';

interface CreateFlashcardSetWizardProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (set: AssessmentSet) => void;
}

type StartMethod = 'files' | 'manual';

interface ProjectFile {
  id: string | number;
  name: string;
  file_type?: string;
  uploaded_at?: string;
  file_size?: number;
}

interface Flashcard {
  question: string;
  answer: string;
  concept_id: string;
  difficulty: 'medium' | 'hard' | 'expert';
  bloom_level: 'apply' | 'analyze' | 'evaluate' | 'create';
  card_type: 'definition' | 'application' | 'analysis' | 'synthesis' | 'evaluation' | 'problem_solving' | 'comparison' | 'critique' | 'cloze' | 'scenario';
  theme: string;
  related_concepts: string[];
  hints: string[];
  examples: string[];
  common_misconceptions: string[];
  learning_objective: string;
}

interface FlashcardDeck {
  deck_metadata: {
    description: string;
    learning_objectives: string[];
    themes: string[];
  };
  flashcards: Flashcard[];
  flashcardSetId?: string | number | null;
}

export function CreateFlashcardSetWizard({ projectId, open, onOpenChange, onCreated }: CreateFlashcardSetWizardProps) {
  const router = useRouter();

  const [step, setStep] = React.useState<number>(1);
  const [totalSteps, setTotalSteps] = React.useState<number>(5);
  const [method, setMethod] = React.useState<StartMethod | null>(null);
  const [projectFiles, setProjectFiles] = React.useState<ProjectFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [selectedExistingFileIds, setSelectedExistingFileIds] = React.useState<Array<string | number>>([]);
  const [existingSearch, setExistingSearch] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generatedDeck, setGeneratedDeck] = React.useState<FlashcardDeck | null>(null);
  const form = useForm<FlashcardDeckForm>({
    resolver: zodResolver(FlashcardDeckSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'medium',
      language: 'en',
    },
  });
  const [suggestedTitle, setSuggestedTitle] = React.useState<string>('');
  const [suggestedDescription, setSuggestedDescription] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = React.useState<boolean>(false);

  // Debug logging for current state
  console.log('�� DEBUG: CreateFlashcardSetWizard render state:', {
    open,
    step,
    method,
    projectId,
    projectFiles: projectFiles.length,
    uploadedFiles: uploadedFiles.length,
    selectedExistingFileIds: selectedExistingFileIds.length
  });

  // Additional debug logging for file display
  React.useEffect(() => {
    console.log('🔍 DEBUG: projectFiles state changed:', {
      count: projectFiles.length,
      files: projectFiles.map(f => ({ id: f.id, name: f.name, type: f.file_type }))
    });
  }, [projectFiles]);

  React.useEffect(() => {
    if (!open) {
      // reset when closing
      setStep(1);
      setIsSubmitting(false);
      setMethod(null);
      setUploadedFiles([]);
      setSelectedExistingFileIds([]);
      setGeneratedDeck(null);
      form.reset({ title: '', description: '', difficulty: 'medium', language: 'en' });
    }
  }, [open]);

  // Load files whenever the wizard is open and we have a projectId
  const loadFiles = async () => {
    console.log('🔍 DEBUG: loadFiles called with:', { projectId, open, step, method });
    
    setIsLoadingFiles(true);
    
    try {
      // Check if we're in test mode and if we should skip API call
      const testMode = isTestMode();
      
      // In test mode, check if we have authentication
      let hasAuth = false;
      if (typeof window !== "undefined" && window.localStorage) {
        const token = localStorage.getItem("access_token");
        hasAuth = !!token;
      }
      
      console.log('🔍 DEBUG: Test mode:', testMode, 'Has auth:', hasAuth);
      
      // If we're in test mode and don't have auth, skip API call and use fallback
      if (testMode && !hasAuth) {
        console.log('🔍 DEBUG: Test mode without auth - using fallback files directly');
        const fallbackFiles: ProjectFile[] = [
          {
            id: 'demo_1',
            name: 'Course Syllabus.pdf',
            file_type: 'pdf',
            uploaded_at: '2025-01-15T10:30:00Z',
            file_size: 2048576
          },
          {
            id: 'demo_2',
            name: 'Lecture Notes.docx',
            file_type: 'docx',
            uploaded_at: '2025-01-16T14:20:00Z',
            file_size: 1536000
          },
          {
            id: 'demo_3',
            name: 'Assignment Guidelines.pdf',
            file_type: 'pdf',
            uploaded_at: '2025-01-17T09:15:00Z',
            file_size: 3145728
          }
        ];
        setProjectFiles(fallbackFiles);
        return;
      }
      
      // Try to load real project files from API
      const project = await getProjectScoped('', projectId);

      console.log('🔍 DEBUG: Project data:', project);
      
      if (project && project.files) {
        console.log('🔍 DEBUG: Project data received:', project);
        
        // Extract uploaded files from project response
        const files = project.uploaded_files || [];
        console.log('🔍 DEBUG: Extracted files array:', files);
        
        // Transform the response to match our ProjectFile interface
        const projectFiles: ProjectFile[] = files.map((file: any) => {
          const transformedFile = {
            id: file.id,
            name: file.original_name || file.file?.split('/').pop() || 'Unknown file',
            file_type: file.content_type?.split('/')[1] || file.file?.split('.').pop()?.toLowerCase() || 'unknown',
            uploaded_at: file.uploaded_at,
            file_size: file.file_size || file.file?.size || 0
          };
          return transformedFile;
        });
        
        console.log('🔍 DEBUG: Final projectFiles array:', projectFiles);
        setProjectFiles(projectFiles);
      } else {
        console.log('🔍 DEBUG: No project files found, setting empty array');
        setProjectFiles([]);
      }
      
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching project files:', error);
      
      // In test mode, provide fallback mock files if API fails
      if (isTestMode()) {
        console.log('🔍 DEBUG: API failed in test mode, using fallback mock files');
        const fallbackFiles: ProjectFile[] = [
          {
            id: 'fallback_1',
            name: 'Uploaded Course Material.pdf',
            file_type: 'pdf',
            uploaded_at: '2025-01-15T10:30:00Z',
            file_size: 2048576
          },
          {
            id: 'fallback_2',
            name: 'Study Notes.docx',
            file_type: 'docx',
            uploaded_at: '2025-01-16T14:20:00Z',
            file_size: 1536000
          }
        ];
        setProjectFiles(fallbackFiles);
      } else {
        // In production mode, fallback to empty state
        setProjectFiles([]);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  React.useEffect(() => {
    // Load files whenever the wizard is open and we have a projectId
    if (open && projectId) {
      console.log('🔍 DEBUG: loadFiles condition met, calling loadFiles()');
      loadFiles();
    } else {
      console.log('🔍 DEBUG: loadFiles condition NOT met:', { open, projectId });
    }
  }, [open, step, method, projectId]);

  // Additional effect to ensure files are loaded when component mounts
  React.useEffect(() => {
    console.log('🔍 DEBUG: Component mounted/updated:', { open, projectId, step, method });
    if (open && projectId) {
      console.log('🔍 DEBUG: Component ready, loading files...');
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        if (open && projectId) {
          console.log('🔍 DEBUG: Delayed file loading...');
          loadFiles();
        }
      }, 100);
    }
  }, [open, projectId]);

  const canContinueFromStep1 = Boolean(method);
  const canContinueFromStep2 = method === 'files' ? (uploadedFiles.length > 0 || selectedExistingFileIds.length > 0) : true;
  const canContinueFromStep3 = form.getValues('title')?.trim().length > 0;

  const deriveTitleFromSource = () => {
    if (method === 'files') {
      if (uploadedFiles.length > 0) {
        const base = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
        return base;
      }
      const picked = projectFiles.find(f => selectedExistingFileIds.includes(f.id));
      if (picked) {
        return picked.name.replace(/\.[^.]+$/, '');
      }
    }
    return '';
  };

  // Auto-populate title when files are selected
  React.useEffect(() => {
    const currentTitle = form.getValues('title');
    if (!currentTitle?.trim() && method === 'files') {
      const suggestedTitle = deriveTitleFromSource();
      if (suggestedTitle) {
        form.setValue('title', suggestedTitle);
        console.log('🔍 DEBUG: Auto-populated title from files:', suggestedTitle);
      }
    }
  }, [uploadedFiles, selectedExistingFileIds, method, form]);

  const goNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getFileIcon = (fileName: string, fileType?: string) => {
    if (fileType === 'pdf') return <File className="h-3 w-3 text-red-500" />;
    if (fileType === 'docx' || fileType === 'doc') return <FileText className="h-3 w-3 text-blue-500" />;
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') return <Image className="h-3 w-3 text-green-500" />;
    if (fileType === 'tsx' || fileType === 'ts' || fileType === 'js' || fileType === 'jsx') return <Code className="h-3 w-3 text-purple-500" />;
    if (fileType === 'html' || fileType === 'css') return <Code className="h-3 w-3 text-orange-500" />;
    return <File className="h-3 w-3 text-gray-500" />;
  };

  const getFileIconBg = (fileName: string, fileType?: string) => {
    if (fileType === 'pdf') return 'bg-red-100';
    if (fileType === 'docx' || fileType === 'doc') return 'bg-blue-100';
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png') return 'bg-green-100';
    if (fileType === 'tsx' || fileType === 'ts' || fileType === 'js' || fileType === 'jsx') return 'bg-purple-100';
    if (fileType === 'html' || fileType === 'css') return 'bg-orange-100';
    return 'bg-gray-100';
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${diffWeeks}w ago`;
  };

  const generateFlashcards = async () => {
    if (method !== 'files' || (uploadedFiles.length === 0 && selectedExistingFileIds.length === 0)) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Always make real API call - let backend handle test mode via headers
      const payload = {
        project_id: projectId!,
        source_type: 'files' as const,
        num_cards: 20,
        difficulty: form.getValues('difficulty'),
        language: form.getValues('language'),
      };

      const headers: any = {};
      
      // Add test mode header if in test mode (backend will handle AI mocking)
      if (isTestMode()) {
        headers['X-Test-Mode'] = 'true';
        console.log('🧪 Test mode: Adding X-Test-Mode header for backend AI mocking');
      }

      console.log('🚀 Generating flashcards with payload:', payload);
      console.log('🚀 Headers:', headers);

      const response = await axiosGeneration.post(`/projects/${projectId}/flashcards/generate`, payload, {
        headers
      });

      const result = response.data;
      console.log('✅ Received flashcard generation response:', result);
      
      // Handle different response formats
      let suggestedTitle, suggestedDescription, cards;
      
      if (result.deck && result.cards) {
        // New format with deck metadata and cards
        suggestedTitle = result.deck.suggested_title;
        suggestedDescription = result.deck.suggested_description;
        cards = result.cards;
      } else if (result.title && result.flashcards) {
        // FlashcardSet format from API
        suggestedTitle = result.title;
        suggestedDescription = result.description || `Generated flashcard set with ${result.total_cards || result.flashcards?.length || 0} cards`;
        cards = result.flashcards || [];
      } else {
        // Fallback
        suggestedTitle = "Generated Flashcards";
        suggestedDescription = "AI-generated flashcard set";
        cards = result.cards || result.flashcards || [];
      }
      
      setSuggestedTitle(suggestedTitle);
      setSuggestedDescription(suggestedDescription);
      
      // Reset form with suggestions
      form.reset({
        title: suggestedTitle,
        description: suggestedDescription,
        difficulty: form.getValues('difficulty'),
        language: form.getValues('language'),
      });

      // Build preview-friendly cards for the review step
      const previewCards = (Array.isArray(cards) ? cards : []).map((c: any, idx: number) => {
        // Support multiple shapes: {question, answer}, {front, back}, string pairs, etc.
        const front = typeof c.front === 'string' ? c.front
          : typeof c.question === 'string' ? c.question
          : c.q || c.prompt || '';
        const back = typeof c.back === 'string' ? c.back
          : typeof c.answer === 'string' ? c.answer
          : c.a || c.response || '';
        const tags = Array.isArray(c.tags) ? c.tags : [];
        return {
          id: String(c.id ?? idx + 1),
          front,
          back,
          tags,
        };
      });

      // Convert to expected format for the wizard
      const normalizedResult: FlashcardDeck = {
        deck_metadata: {
          description: suggestedDescription,
          learning_objectives: [],
          themes: [],
        },
        flashcards: cards,
        flashcardSetId: result.id || null,
      };

      setGeneratedDeck(normalizedResult);
      goNext();
      
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      // In a real app, you'd show an error message here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!generatedDeck) return;

    setIsSubmitting(true);
    
    try {
      // Since the generate API already created the flashcard set, 
      // we just need to navigate to it
      
      // The generated deck should contain the flashcard set info if it was created by the API
      if (generatedDeck.flashcardSetId) {
        console.log('🔍 DEBUG: Using existing flashcard set ID:', generatedDeck.flashcardSetId);
        // Ensure the deck uses the user-provided Deck name (title)
        const desiredTitle = form.getValues('title');
        const desiredDescription = form.getValues('description');
        try {
          if (desiredTitle || desiredDescription) {
            // Generated sets are managed via the generation service
            await axiosGeneration.patch(`flashcard-sets/${generatedDeck.flashcardSetId}/`, {
              ...(desiredTitle ? { title: desiredTitle } : {}),
              ...(desiredDescription ? { description: desiredDescription } : {}),
            });
          }
        } catch (e) {
          console.warn('Could not update deck title/description after generation', e);
        }

        // Close the wizard
        onOpenChange(false);
        
        // Navigate to the created set
        router.push(`/projects/${projectId}/flashcards/${generatedDeck.flashcardSetId}` as any);
        return;
      }

      // Fallback: Create the flashcard set if it wasn't created during generation
      console.log('🔍 DEBUG: Creating new flashcard set from generated cards');
      
      const response = await postProjectScoped(`flashcard-sets/`, projectId, {
        title: form.getValues('title') || deriveTitleFromSource(),
        description: form.getValues('description') || `Generated from ${method === 'files' ? 'uploaded files' : 'manual entry'}`,
        difficulty_level: 'INTERMEDIATE',
        target_audience: '',
        estimated_study_time: 30,
        tags: [],
        flashcards: generatedDeck.flashcards
      });

      const createdSet = response.data;
      
      // Close the wizard
      onOpenChange(false);
      
      // Call the onCreated callback if provided
      if (onCreated) {
        onCreated(createdSet);
      }
      
      // Navigate to the created set
      if (createdSet?.id) {
        router.push(`/projects/${projectId}/flashcards/${createdSet.id}` as any);
      } else {
        // Fallback to flashcards dashboard if no ID
        router.push(`/projects/${projectId}/flashcards` as any);
      }
      
    } catch (error: any) {
      console.error('Failed to create deck:', error);
      alert(`Failed to create flashcard set: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    console.log('🔍 DEBUG: handleFileUpload called with files:', files);
    console.log('🔍 DEBUG: Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    // Set uploaded files in local state first
    setUploadedFiles(files);
    console.log('🔍 DEBUG: uploadedFiles state updated:', files);
    
    // Upload files to the backend project
    try {
      console.log('🔍 DEBUG: Starting file upload to backend...');
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosApi.post(`projects/${projectId}/upload_file/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        if (response.status === 200 || response.status === 201) {
          const result = response.data;
          console.log('🔍 DEBUG: File uploaded successfully:', result);
          console.log('✅ File uploaded successfully:', file.name);
        } else {
          console.error('🔍 DEBUG: File upload failed:', response.status, response.statusText);
          console.error('❌ File upload failed:', file.name, response.status);
        }
      }
      
      // Refresh the project files after upload
      console.log('🔍 DEBUG: Refreshing project files after upload...');
      // Reload files from the backend
      setTimeout(() => {
        if (open && projectId) {
          loadFiles();
        }
      }, 1000); // Wait a bit for backend processing
      
    } catch (error) {
      console.error('🔍 DEBUG: Error during file upload:', error);
    }
    
    // Auto-advance to next step after file selection
    if (files.length > 0) {
      console.log('🔍 DEBUG: Files selected, auto-advancing to next step');
      goNext();
    }
  };

  return (
    <WizardShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create Flashcard Set"
      step={step}
      totalSteps={totalSteps}
      headerExtras={(
        <>
          {/* Debug Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2 text-xs">
            <div className="font-medium text-blue-800">🔍 DEBUG INFO:</div>
            <div className="text-blue-700">
              Open: {open ? 'true' : 'false'} | 
              Step: {step} | 
              Method: {method || 'null'} | 
              ProjectId: {projectId ? 'set' : 'null'} | 
              Files: {projectFiles.length} | 
              Loading: {isLoadingFiles ? 'true' : 'false'}
            </div>
            <div className="mt-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 DEBUG: Manual loadFiles trigger clicked');
                  console.log('🔍 DEBUG: Current state:', { open, projectId, step, method });
                  if (projectId) {
                    loadFiles();
                  } else {
                    console.log('🔍 DEBUG: No projectId available');
                  }
                }}
                className="text-xs h-6 px-2"
              >
                🔄 Force Load Files
              </Button>
            </div>
          </div>

          {/* Mock Mode Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="text-lg">🧪</div>
              <div className="text-sm font-medium">
                Mock Mode Enabled
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Using predefined flashcard templates instead of AI generation for testing purposes.
            </p>
          </div>
        </>
      )}
    >
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">How would you like to start?</h2>
                <p className="text-sm text-slate-600">Choose your preferred method for creating flashcards</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200" onClick={() => { setMethod('files'); setStep(2); }}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">Use Files</h3>
                        <p className="text-sm text-slate-600">Generate from uploaded documents and materials</p>
                      </div>
                    </div>
                </CardContent>
              </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200" onClick={() => { setMethod('manual'); setStep(2); }}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <PencilLine className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">Manual Entry</h3>
                        <p className="text-sm text-slate-600">Create flashcards one by one with custom content</p>
                      </div>
                    </div>
                </CardContent>
              </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {/* Test mode banner for step 2 */}
              {isTestMode() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600 text-sm">🧪</span>
                    <span className="text-yellow-800 text-sm font-medium">Mock Mode Enabled</span>
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    Using predefined flashcard templates instead of AI generation for testing purposes.
                    {projectFiles.length > 0 && ' Real project files loaded successfully.'}
                    {projectFiles.length === 0 && ' Using fallback demo files for testing.'}
                  </p>
                </div>
              )}

              {method === 'files' && (
                <div className="space-y-3">
                  {/* Files Selection Section - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Recent Files Section */}
                  <Card>
                      <CardHeader className="pb-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Recent Files</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0"
                            onClick={() => loadFiles()}
                            title="Refresh files"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                    </CardHeader>
                      <CardContent className="p-2">
                        <div className="space-y-1">
                          {isLoadingFiles ? (
                            <div className="text-center py-2 text-slate-500">
                              <Loader2 className="h-5 w-5 mx-auto mb-1 text-slate-300 animate-spin" />
                              <p className="text-xs">Loading files...</p>
                            </div>
                          ) : projectFiles.length === 0 ? (
                            <div className="text-center py-2 text-slate-500">
                              <FolderOpen className="h-5 w-5 mx-auto mb-1 text-slate-300" />
                              <p className="text-xs">No files uploaded yet</p>
                              <p className="text-xs text-slate-400">Upload files to get started</p>
                            </div>
                          ) : (
                            projectFiles.slice(0, 4).map((file) => {
                              const checked = selectedExistingFileIds.includes(file.id);
                              return (
                                <div
                                  key={file.id}
                                  className={`flex items-center justify-between p-1 rounded-lg border transition-colors cursor-pointer ${
                                    checked 
                                      ? 'bg-emerald-50 border-emerald-200' 
                                      : 'hover:bg-slate-50 border-slate-200'
                                  }`}
                                  onClick={() => {
                                    setSelectedExistingFileIds((prev: Array<string | number>) => 
                                      checked 
                                        ? prev.filter(id => id !== file.id)
                                        : [...prev, file.id]
                                    );
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`p-1 rounded-full ${getFileIconBg(file.name, file.file_type)}`}>
                                      {getFileIcon(file.name, file.file_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-slate-900 truncate">
                                        {file.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      <span className="text-xs">{formatTimeAgo(file.uploaded_at)}</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                                      checked 
                                        ? 'bg-emerald-500 border-emerald-500' 
                                        : 'border-slate-300'
                                    }`}>
                                      {checked && <CheckCircle2 className="h-2 w-2 text-white" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                    </CardContent>
                  </Card>

                    {/* Favorite Files Section */}
                  <Card>
                      <CardHeader className="pb-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Favorite Files</CardTitle>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                    </CardHeader>
                      <CardContent className="p-2">
                        <div className="space-y-1">
                          {isLoadingFiles ? (
                            <div className="text-center py-2 text-slate-500">
                              <Loader2 className="h-5 w-5 mx-auto mb-1 text-slate-300 animate-spin" />
                              <p className="text-xs">Loading files...</p>
                            </div>
                          ) : projectFiles.length === 0 ? (
                            <div className="text-center py-2 text-slate-500">
                              <FolderOpen className="h-5 w-5 mx-auto mb-1 text-slate-300" />
                              <p className="text-xs">No favorite files yet</p>
                              <p className="text-xs text-slate-400">Mark files as favorites</p>
                            </div>
                          ) : (
                            projectFiles.slice(0, 4).map((file) => {
                              const checked = selectedExistingFileIds.includes(file.id);
                              return (
                                <div
                                  key={file.id}
                                  className={`flex items-center justify-between p-1 rounded-lg border transition-colors cursor-pointer ${
                                    checked 
                                      ? 'bg-emerald-50 border-emerald-200' 
                                      : 'border-slate-300'
                                  }`}
                                  onClick={() => {
                                    setSelectedExistingFileIds((prev: Array<string | number>) => 
                                      checked 
                                        ? prev.filter(id => id !== file.id)
                                        : [...prev, file.id]
                                    );
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`p-1 rounded-full ${getFileIconBg(file.name, file.file_type)}`}>
                                      {getFileIcon(file.name, file.file_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-slate-900 truncate">
                                        {file.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      <span className="text-xs">{formatTimeAgo(file.uploaded_at)}</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                                      checked 
                                        ? 'bg-emerald-500 border-emerald-500' 
                                        : 'border-slate-300'
                                    }`}>
                                      {checked && <CheckCircle2 className="h-2 w-2 text-white" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Upload New Files Section - Ultra Compact */}
                  <Card>
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm flex items-center gap-2"><Upload className="h-3 w-3" /> Upload New Files</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                      <p className="text-xs text-slate-600">Add one or more files to base your deck on</p>
                      
                      {/* Ultra Compact Drag & Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-3 text-center transition-all duration-300 ${
                          false // TODO: Add drag state
                            ? 'border-blue-400 bg-blue-50/50 scale-105' 
                            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="mx-auto w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-slate-900 mb-1">
                              Drop files here or click to browse
                            </h4>
                            <p className="text-xs text-slate-500 mb-2">
                              Supported: PDF, DOCX, PPTX, TXT, PNG, JPG, CSV, MD
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('file-upload')?.click()}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs h-7 px-2"
                            >
                              Browse Files
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Hidden file input */}
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          console.log('🔍 DEBUG: File input change event:', {
                            filesCount: files.length,
                            fileNames: files.map(f => f.name),
                            fileTypes: files.map(f => f.type)
                          });
                          handleFileUpload(files);
                        }}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.csv,.md"
                      />

                      {/* Ultra Compact Uploaded Files Preview */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600 font-medium">Selected files:</p>
                          <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-1 bg-slate-50 rounded border">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs text-slate-700 truncate">{file.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-slate-400 hover:text-slate-600"
                                  onClick={() => {
                                    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Form Fields Section */}
            <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Deck Configuration</CardTitle>
              </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="deck-title" className="text-xs">Deck name</Label>
                    <Input 
                      id="deck-title" 
                      placeholder="e.g., Lecture 3 - Neural Networks" 
                      {...form.register('title')}
                      className="text-sm"
                    />
                  </div>
                  

                  
                  <div className="space-y-2">
                    <Label htmlFor="deck-description" className="text-xs">Description (optional)</Label>
                    <Input 
                      id="deck-description" 
                      placeholder="Brief description of this assessment set" 
                      {...form.register('description')}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="text-center">
                <Button 
                  onClick={generateFlashcards}
                  disabled={!canContinueFromStep3 || isGenerating}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Flashcards...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && generatedDeck && (
            <FlashcardReviewStep
              cards={generatedDeck.flashcards.map((card, idx) => ({
                id: String(card.concept_id || idx + 1),
                front: card.question,
                back: card.answer,
                tags: card.related_concepts || [],
              }))}
              form={form}
              mockMode={isTestMode()}
              suggestedTitle={suggestedTitle}
              suggestedDescription={suggestedDescription}
            />
          )}

          {step === 5 && generatedDeck && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Ready to Create!</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Your flashcard set is ready to be created with {generatedDeck.flashcards.length} cards
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Final Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Deck Name:</span>
                      <p className="text-sm text-gray-700">{form.getValues('title')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-gray-700">{form.getValues('description')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Cards:</span>
                      <p className="text-sm text-gray-700">{generatedDeck.flashcards.length} flashcards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={goBack} disabled={isSubmitting} size="sm">Back</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} size="sm">Cancel</Button>
              {step === 1 ? null : step === 5 ? (
                <Button onClick={handleCreate} disabled={isSubmitting || !generatedDeck} size="sm">
                  {isSubmitting ? 'Creating…' : 'Create Flashcard Set'}
                </Button>
              ) : (
                <Button onClick={goNext} disabled={isSubmitting || !canContinueFromStep2} size="sm">
                  Next
                </Button>
              )}
            </div>
          </div>
    </WizardShell>
  );
}

export default CreateFlashcardSetWizard;


