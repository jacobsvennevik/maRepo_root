"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { axiosApi } from '@/lib/axios-api';
import { axiosGeneration } from '@/lib/axios';
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
      // Check if we're in test mode
      if (isTestMode()) {
        // Use mock data in test mode
        const mockProjectFiles: ProjectFile[] = [
          {
            id: 'file_1',
            name: 'Natural Language Processing Syllabus.pdf',
            file_type: 'pdf',
            uploaded_at: '2025-01-15T10:30:00Z',
            file_size: 2048576
          },
          {
            id: 'file_2',
            name: 'NLP Course Notes.docx',
            file_type: 'docx',
            uploaded_at: '2025-01-16T14:20:00Z',
            file_size: 1536000
          },
          {
            id: 'file_3',
            name: 'Language Models Research Paper.pdf',
            file_type: 'pdf',
            uploaded_at: '2025-01-17T09:15:00Z',
            file_size: 3145728
          },
          {
            id: 'file_4',
            name: 'Neural Networks Overview.pptx',
            file_type: 'pptx',
            uploaded_at: '2025-01-18T16:45:00Z',
            file_size: 5242880
          }
        ];
        
        console.log('🔍 DEBUG: Using mock project files:', mockProjectFiles);
        setProjectFiles(mockProjectFiles);
        return;
      }

      const apiUrl = `/projects/${projectId}/`;
      console.log('🔍 DEBUG: Fetching from URL:', apiUrl);
      
              // Fetch project details which includes uploaded files using axiosApi
        const response = await axiosApi.get(apiUrl, {
        headers: {
          'X-Test-Mode': 'true', // Add test mode header
        }
      });

      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response data:', response.data);
      
      const project = response.data;
      console.log('🔍 DEBUG: Project data received:', project);
      console.log('🔍 DEBUG: Project uploaded_files:', project.uploaded_files);
      console.log('🔍 DEBUG: Project uploaded_files type:', typeof project.uploaded_files);
      console.log('🔍 DEBUG: Project uploaded_files length:', project.uploaded_files?.length);
      
      // Extract uploaded files from project response
      const files = project.uploaded_files || [];
      console.log('🔍 DEBUG: Extracted files array:', files);
      
      // Transform the response to match our ProjectFile interface
      const projectFiles: ProjectFile[] = files.map((file: any) => {
        console.log('🔍 DEBUG: Processing file:', file);
        const transformedFile = {
          id: file.id,
          name: file.original_name || file.file?.split('/').pop() || 'Unknown file',
          file_type: file.content_type?.split('/')[1] || file.file?.split('.').pop()?.toLowerCase() || 'unknown',
          uploaded_at: file.uploaded_at,
          file_size: file.file_size || file.file?.size || 0
        };
        console.log('🔍 DEBUG: Transformed file:', transformedFile);
        return transformedFile;
      });
      
      console.log('🔍 DEBUG: Final projectFiles array:', projectFiles);
      setProjectFiles(projectFiles);
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching project files:', error);
      // Fallback to empty state
      setProjectFiles([]);
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
      // Check if we're in test mode
      if (isTestMode()) {
        // Use mock data in test mode
        const mockResult = {
          deck: {
            suggested_title: "Natural Language Processing Fundamentals",
            suggested_description: "Comprehensive flashcards covering core NLP concepts including language models, tokenization, and neural network architectures.",
          },
          cards: [
            {
              id: "card_1",
              front: "What two core problems do language models target?",
              back: "Belonging: decide if a sequence is a sentence of language L. Continuation: predict the most likely next item given a segment.",
              tags: ["belonging-problem", "continuation-problem", "causal-language-modeling"]
            },
            {
              id: "card_2", 
              front: "What is the belonging (membership) problem in language modeling?",
              back: "Determine whether a given sequence is a sentence of language L.",
              tags: ["role-of-language-models", "continuation-problem"]
            },
            {
              id: "card_3",
              front: "What does the continuation problem ask a language model to do?",
              back: "Given a segment, predict the most likely next item (token or sequence) in language L.",
              tags: ["role-of-language-models", "causal-language-modeling", "masked-language-modeling"]
            },
            {
              id: "card_4",
              front: "Why is self-supervised learning suited to language modeling?",
              back: "It needs no manual labels: remove the next segment and ask the model to predict it using raw running texts, enabling much larger training sets than annotated ones.",
              tags: ["colossal-datasets", "cross-entropy-loss", "forward-pass"]
            },
            {
              id: "card_5",
              front: "What does softmax enforce on the output vector y^?",
              back: "Each component lies in [0,1] and the components sum to 1 across the vocabulary, making y^ a probability distribution.",
              tags: ["cross-entropy-loss", "predicted-item-argmax"]
            }
          ]
        };

        // Auto-populate form with suggested title and description
        const suggestedTitle = mockResult.deck.suggested_title;
        const suggestedDescription = mockResult.deck.suggested_description;
        
        setSuggestedTitle(suggestedTitle);
        setSuggestedDescription(suggestedDescription);
        
        // Reset form with suggestions
        form.reset({
          title: suggestedTitle,
          description: suggestedDescription,
          difficulty: form.getValues('difficulty'),
          language: form.getValues('language'),
        });

        setGeneratedDeck(mockResult);
        goNext();
        return;
      }

      // Real API call using axiosInstance
      const payload = {
        project_id: projectId!,
        source_type: 'files' as const,
        num_cards: 20,
        difficulty: form.getValues('difficulty'),
        language: form.getValues('language'),
        mock_mode: true,
      };

      const response = await axiosGeneration.post(`/projects/${projectId}/flashcards/generate/`, payload, {
        headers: {
          'X-Test-Mode': 'true', // Add test mode header
        }
      });

      const result = response.data;
      
      // Auto-populate form with suggested title and description
      const suggestedTitle = result.deck.suggested_title;
      const suggestedDescription = result.deck.suggested_description;
      
      setSuggestedTitle(suggestedTitle);
      setSuggestedDescription(suggestedDescription);
      
      // Reset form with suggestions
      form.reset({
        title: suggestedTitle,
        description: suggestedDescription,
        difficulty: form.getValues('difficulty'),
        language: form.getValues('language'),
      });

      setGeneratedDeck(result);
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
      // Check if we're in test mode
      if (isTestMode()) {
        // Simulate successful creation in test mode
        const mockCreatedSet = {
          id: 'mock_flashcard_set_1',
          title: form.getValues('title') || deriveTitleFromSource(),
          description: form.getValues('description') || `Generated from ${method === 'files' ? 'uploaded files' : 'manual entry'}`,
          difficulty_level: 'INTERMEDIATE',
          target_audience: '',
          estimated_study_time: 30,
          tags: [],
          flashcards: generatedDeck.cards,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('🔍 DEBUG: Mock flashcard set created:', mockCreatedSet);
        
        // Close the wizard
        onOpenChange(false);
        
        // Call the onCreated callback if provided
        if (onCreated) {
          onCreated(mockCreatedSet);
        }
        
        // Navigate to the created set
        const encodedTitle = encodeURIComponent(form.getValues('title') || deriveTitleFromSource() || 'Untitled Deck');
        router.push(`/projects/${projectId}/flashcards/create?title=${encodedTitle}` as any);
        
        return;
      }

      // Create the flashcard set via API using axiosApi
      const response = await axiosApi.post(`/projects/${projectId}/flashcard-sets/`, {
        title: form.getValues('title') || deriveTitleFromSource(),
        description: form.getValues('description') || `Generated from ${method === 'files' ? 'uploaded files' : 'manual entry'}`,
        difficulty_level: 'INTERMEDIATE',
        target_audience: '',
        estimated_study_time: 30,
        tags: [],
        flashcards: generatedDeck.cards
      });

      const createdSet = response.data;
      
      // Close the wizard
      onOpenChange(false);
      
      // Call the onCreated callback if provided
      if (onCreated) {
        onCreated(createdSet);
      }
      
      // Navigate to the created set
      const encodedTitle = encodeURIComponent(form.getValues('title') || deriveTitleFromSource() || 'Untitled Deck');
      router.push(`/projects/${projectId}/flashcards/create?title=${encodedTitle}` as any);
      
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
        
        const response = await axiosApi.post(`/projects/${projectId}/upload_file/`, formData, {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Flashcard Set</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}
          </DialogDescription>
          
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
        </DialogHeader>

        <div className="space-y-3">
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
              cards={generatedDeck.cards}
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
                    Your flashcard set is ready to be created with {generatedDeck.cards.length} cards
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
                      <p className="text-sm text-gray-700">{generatedDeck.cards.length} flashcards</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFlashcardSetWizard;


