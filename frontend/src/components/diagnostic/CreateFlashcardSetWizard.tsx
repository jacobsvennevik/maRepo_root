"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenerationApi } from '@/lib/generationApi';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, Upload, PencilLine, MoreVertical, Clock, File, Image, Code, FolderOpen, X, Brain, Sparkles, Loader2 } from 'lucide-react';
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
  const [totalSteps, setTotalSteps] = React.useState<number>(4);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [method, setMethod] = React.useState<StartMethod | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [projectFiles, setProjectFiles] = React.useState<ProjectFile[]>([]);
  const [selectedExistingFileIds, setSelectedExistingFileIds] = React.useState<Array<string | number>>([]);
  const [existingSearch, setExistingSearch] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [generatedDeck, setGeneratedDeck] = React.useState<FlashcardDeck | null>(null);
  const [form, setForm] = React.useState<{ 
    title: string; 
    isPrivate: boolean;
    kind: AssessmentKind;
    description: string;
  }>({
    title: '',
    isPrivate: true,
    kind: 'FLASHCARDS',
    description: '',
  });

  React.useEffect(() => {
    if (!open) {
      // reset when closing
      setStep(1);
      setIsSubmitting(false);
      setMethod(null);
      setUploadedFiles([]);
      setSelectedExistingFileIds([]);
      setGeneratedDeck(null);
      setForm({ title: '', isPrivate: true, kind: 'FLASHCARDS', description: '' });
    }
  }, [open]);

  // Load existing project files when choosing file-based start
  React.useEffect(() => {
    const loadFiles = async () => {
      try {
        // Fetch project details which includes uploaded files
        const response = await fetch(`/projects/api/projects/${projectId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const project = await response.json();
          // Extract uploaded files from project response
          const files = project.uploaded_files || [];
          // Transform the response to match our ProjectFile interface
          const projectFiles: ProjectFile[] = files.map((file: any) => ({
            id: file.id,
            name: file.file?.split('/').pop() || 'Unknown file', // Extract filename from file path
            file_type: file.file?.split('.').pop()?.toLowerCase() || 'unknown',
            uploaded_at: file.uploaded_at,
            file_size: file.file?.size || 0
          }));
          setProjectFiles(projectFiles);
        } else {
          console.warn('Failed to fetch project details:', response.status);
          // Fallback to empty state
          setProjectFiles([]);
        }
      } catch (error) {
        console.error('Error fetching project files:', error);
        // Fallback to empty state
        setProjectFiles([]);
      }
    };
    
    if (open && ((step === 1 && method === 'files') || step === 2)) {
      loadFiles();
    }
  }, [open, step, method, projectId]);

  const canContinueFromStep1 = Boolean(method);
  const canContinueFromStep2 = method === 'files' ? (uploadedFiles.length > 0 || selectedExistingFileIds.length > 0) : true;
  const canContinueFromStep3 = form.title.trim().length > 0 && form.kind;

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
      // Make real API call to generate flashcards
      const response = await fetch(`/generation/api/projects/${projectId}/flashcards/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          method: 'files',
          files: uploadedFiles.map((f: File) => ({ name: f.name, size: f.size })),
          existing_files: selectedExistingFileIds,
          deck_title: form.title || deriveTitleFromSource(),
          difficulty: 'medium',
          content_type: 'mixed',
          language: 'English',
          tags_csv: 'flashcards,study,learning',
          mock_mode: true // Enable mock mode for testing
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate flashcards: ${response.status}`);
      }

      // Parse the backend response
      const result = await response.json();
      
      // Check if mock mode was used
      if (result.mock_mode) {
        console.log('Mock mode banner:', result.mock_banner);
      }
      
      // Transform the backend response to match our FlashcardDeck interface
      const mockDeck: FlashcardDeck = {
        deck_metadata: {
          description: result.description || "Flashcards generated from content",
          learning_objectives: result.learning_objectives || ["Understand key concepts"],
          themes: result.themes || ["General concepts"]
        },
        flashcards: result.flashcards || []
            };

      setGeneratedDeck(mockDeck);
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
      // Create the flashcard set via API
      const response = await fetch(`/generation/api/projects/${projectId}/flashcard-sets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          title: form.title || deriveTitleFromSource(),
      kind: form.kind,
          description: form.description || `Generated from ${method === 'files' ? 'uploaded files' : 'manual entry'}`,
      difficulty_level: 'INTERMEDIATE',
      target_audience: '',
      estimated_study_time: 30,
      tags: [],
          flashcards: generatedDeck.flashcards
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create flashcard set');
      }

      const createdSet = await response.json();
      
      // Close the wizard
      onOpenChange(false);
      
      // Call the onCreated callback if provided
      if (onCreated) {
        onCreated(createdSet);
      }
      
      // Navigate to the created set
      const encodedTitle = encodeURIComponent(form.title || deriveTitleFromSource() || 'Untitled Deck');
      router.push(`/projects/${projectId}/flashcards/create?title=${encodedTitle}` as any);
      
    } catch (error: any) {
      console.error('Failed to create deck:', error);
      alert(`Failed to create flashcard set: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
                        <CardTitle className="text-sm">Recent Files</CardTitle>
                    </CardHeader>
                      <CardContent className="p-2">
                        <div className="space-y-1">
                          {projectFiles.length === 0 ? (
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
                          {projectFiles.length === 0 ? (
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
                          setUploadedFiles(files);
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
                      value={form.title} 
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assessment-type" className="text-xs">Assessment Type</Label>
                    <select
                      id="assessment-type"
                      value={form.kind}
                      onChange={(e) => setForm(prev => ({ ...prev, kind: e.target.value as AssessmentKind }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select assessment type</option>
                      <option value="FLASHCARDS">Flashcards</option>
                      <option value="MCQ">Multiple Choice Questions</option>
                      <option value="MIXED">Mixed Assessment</option>
                      <option value="TRUE_FALSE">True/False Questions</option>
                      <option value="FILL_BLANK">Fill in the Blank</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deck-description" className="text-xs">Description (optional)</Label>
                    <Input 
                      id="deck-description" 
                      placeholder="Brief description of this assessment set" 
                      value={form.description} 
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-600">Deck visibility</div>
                    <label className="inline-flex items-center space-x-2">
                      <input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm(prev => ({ ...prev, isPrivate: e.target.checked }))} />
                      <span className="text-xs text-slate-700">Private deck</span>
                    </label>
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
            <div className="space-y-4">
              {/* Generated Flashcards Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-3 w-3" /> Generated Flashcards</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* Deck Metadata */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-900">Deck Overview</h4>
                    <p className="text-xs text-slate-600">{generatedDeck.deck_metadata.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Learning Objectives:</span>
                        <div className="mt-1 space-y-1">
                          {generatedDeck.deck_metadata.learning_objectives.slice(0, 3).map((obj, idx) => (
                            <div key={idx} className="text-slate-700">• {obj}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Themes:</span>
                        <div className="mt-1 space-y-1">
                          {generatedDeck.deck_metadata.themes.slice(0, 3).map((theme, idx) => (
                            <div key={idx} className="text-slate-700">• {theme}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Flashcards */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-900">Sample Cards ({generatedDeck.flashcards.length} total)</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {generatedDeck.flashcards.slice(0, 3).map((card, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded border text-xs">
                          <div className="font-medium text-slate-700 mb-1">Q: {card.question}</div>
                          <div className="text-slate-600">A: {card.answer}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {card.difficulty}
                            </span>
                            <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {card.card_type}
                            </span>
                          </div>
                        </div>
                      ))}
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
              {step === 1 ? null : step === 4 ? (
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


