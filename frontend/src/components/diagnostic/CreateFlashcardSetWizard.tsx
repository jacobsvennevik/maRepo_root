"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectDropdown, SelectDropdownContent, SelectDropdownItem, SelectDropdownTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/wizard/FileUpload';
import { GenerationApi } from '@/lib/generationApi';
import { getAuthHeaders } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-provider';
import { CheckCircle2, FileText, Upload, PencilLine } from 'lucide-react';
import type { AssessmentSet, CreateAssessmentSetForm, AssessmentKind } from '@/features/diagnostics/types/assessment';

interface CreateFlashcardSetWizardProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (set: AssessmentSet) => void;
}

type StartMethod = 'files' | 'manual';

export function CreateFlashcardSetWizard({ projectId, open, onOpenChange, onCreated }: CreateFlashcardSetWizardProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [step, setStep] = React.useState<number>(1);
  const [totalSteps, setTotalSteps] = React.useState<number>(3);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [method, setMethod] = React.useState<StartMethod | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [projectFiles, setProjectFiles] = React.useState<Array<{ id: string | number; name: string }>>([]);
  const [selectedExistingFileIds, setSelectedExistingFileIds] = React.useState<Array<string | number>>([]);
  const [existingSearch, setExistingSearch] = React.useState<string>('');
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
      setForm({ title: '', isPrivate: true, kind: 'FLASHCARDS', description: '' });
    }
  }, [open]);

  // Load existing project files when choosing file-based start
  React.useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/`, { headers: getAuthHeaders() });
        const data = await res.json();
        const files = (data?.uploaded_files || []).map((f: any) => ({ id: f.id, name: f.file?.split('/')?.pop() || `File ${f.id}` }));
        setProjectFiles(files);
      } catch (_) {
        // silent failure; the UI will show empty state
      }
    };
    if (open && ((step === 1 && method === 'files') || step === 2)) {
      loadFiles();
    }
  }, [open, step, method, projectId]);

  const canContinueFromStep1 = Boolean(method);
  const canContinueFromStep2 = form.title.trim().length > 0 && form.kind;

  const deriveTitleFromSource = () => {
    if (method === 'files') {
      if (uploadedFiles.length > 0) {
        const base = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
        return base;
      }
      const picked = projectFiles.find(f => selectedExistingFileIds.includes(f.id));
      if (picked) return picked.name.replace(/\.[^.]+$/, '');
    }
    return '';
  };

  const goNext = () => {
    if (step === 1) {
      if (method === 'files' && !form.title) {
        const prefill = deriveTitleFromSource();
        setForm(prev => ({ ...prev, title: prefill || prev.title }));
      }
      // If manual, make step 2 required; otherwise optional but shown for edits
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    if (step === 2) { setStep(1); return; }
    if (step === 3) { setStep(2); return; }
  };

  const handleCreate = async () => {
    // Prepare payload for backend
    const payload: CreateAssessmentSetForm = {
      title: form.title,
      kind: form.kind,
      description: form.description || (method === 'manual'
        ? 'Manual deck'
        : `From files: ${[
            ...uploadedFiles.map(f => f.name),
            ...projectFiles.filter(f => selectedExistingFileIds.includes(f.id)).map(f => f.name),
          ].filter(Boolean).slice(0, 3).join(', ')}${(uploadedFiles.length + selectedExistingFileIds.length) > 3 ? '…' : ''}`),
      difficulty_level: 'INTERMEDIATE',
      target_audience: '',
      estimated_study_time: 30,
      tags: [],
    };

    try {
      setIsSubmitting(true);
      // Navigate to a dedicated create screen with loading + success UX
      onOpenChange(false);
      const encodedTitle = encodeURIComponent(form.title || deriveTitleFromSource() || 'Untitled Deck');
      router.push(`/projects/${projectId}/flashcards/create?title=${encodedTitle}` as any);
    } catch (_) {
      addToast({ title: 'Failed to create deck', description: 'Network or server error.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepHeader = ({ current }: { current: number }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-2 h-2 rounded-full ${current >= 1 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      <div className={`w-2 h-2 rounded-full ${current >= 2 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      <div className={`w-2 h-2 rounded-full ${current >= 3 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      <span className="ml-2 text-xs text-slate-500">Step {current} of {totalSteps}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Create New Flashcard Deck</DialogTitle>
          <DialogDescription>Choose how to start, review details, and create your deck.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <StepHeader current={step} />

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className={`cursor-pointer hover:shadow ${method === 'files' ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => { setMethod('files'); goNext(); }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Use Files (Upload or Existing)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">Choose this to upload new files and/or pick from existing project files on the next step</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:shadow ${method === 'manual' ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => { setMethod('manual'); if (!form.title) setForm(prev => ({ ...prev, title: '' })); goNext(); }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><PencilLine className="h-4 w-4" /> Create Manually</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Start with an empty deck and write your own cards</p>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deck-title">Deck name</Label>
                <Input id="deck-title" placeholder="e.g., Lecture 3 - Neural Networks" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <SelectDropdown value={form.kind} onValueChange={(value: string) => setForm(prev => ({ ...prev, kind: value as AssessmentKind }))}>
                  <SelectDropdownTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectDropdownTrigger>
                  <SelectDropdownContent>
                    <SelectDropdownItem value="FLASHCARDS">Flashcards</SelectDropdownItem>
                    <SelectDropdownItem value="MCQ">Multiple Choice Questions</SelectDropdownItem>
                    <SelectDropdownItem value="MIXED">Mixed Assessment</SelectDropdownItem>
                    <SelectDropdownItem value="TRUE_FALSE">True/False Questions</SelectDropdownItem>
                    <SelectDropdownItem value="FILL_BLANK">Fill in the Blank</SelectDropdownItem>
                  </SelectDropdownContent>
                </SelectDropdown>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deck-description">Description (optional)</Label>
                <Input id="deck-description" placeholder="Brief description of this assessment set" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">Deck visibility</div>
                <label className="inline-flex items-center space-x-2">
                  <input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm(prev => ({ ...prev, isPrivate: e.target.checked }))} />
                  <span className="text-sm text-slate-700">Private deck</span>
                </label>
              </div>

              {method === 'files' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Upload New Files</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-600">Add one or more files to base your deck on</p>
                      <FileUpload onUpload={(files) => setUploadedFiles(files)} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" maxFiles={5} />
                      {uploadedFiles.length > 0 && (
                        <div className="text-xs text-slate-600">Selected: {uploadedFiles.map(f => f.name).join(', ')}</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Pick Existing Files</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Input placeholder="Search files" value={existingSearch} onChange={(e) => setExistingSearch(e.target.value)} />
                      <div className="max-h-52 overflow-auto rounded border border-slate-200">
                        {projectFiles.filter(f => f.name.toLowerCase().includes(existingSearch.toLowerCase())).length === 0 ? (
                          <div className="p-3 text-sm text-slate-500">No files found for this project.</div>
                        ) : (
                          projectFiles
                            .filter(f => f.name.toLowerCase().includes(existingSearch.toLowerCase()))
                            .map((f) => {
                              const checked = selectedExistingFileIds.includes(f.id);
                              return (
                                <label key={f.id} className={`flex items-center justify-between p-2 text-sm cursor-pointer hover:bg-slate-50 ${checked ? 'bg-emerald-50' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        setSelectedExistingFileIds(prev => e.target.checked ? [...prev, f.id] : prev.filter(id => id !== f.id));
                                      }}
                                    />
                                    <span className="truncate max-w-[360px]">{f.name}</span>
                                  </div>
                                </label>
                              );
                            })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Review & Confirm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Start method:</span> <span className="font-medium capitalize">{method || '-'}</span></div>
                  <div><span className="text-slate-500">Deck title:</span> <span className="font-medium">{form.title || deriveTitleFromSource() || '-'}</span></div>
                  <div><span className="text-slate-500">Assessment type:</span> <span className="font-medium">{form.kind || '-'}</span></div>
                  <div><span className="text-slate-500">Description:</span> <span className="font-medium">{form.description || 'No description'}</span></div>
                  {method === 'files' && uploadedFiles.length > 0 && (
                    <div className="sm:col-span-2"><span className="text-slate-500">Uploads:</span> <span className="font-medium">{uploadedFiles.map(f => f.name).join(', ')}</span></div>
                  )}
                  {method === 'files' && selectedExistingFileIds.length > 0 && (
                    <div className="sm:col-span-2"><span className="text-slate-500">Existing:</span> <span className="font-medium">{projectFiles.filter(f => selectedExistingFileIds.includes(f.id)).map(f => f.name).join(', ')}</span></div>
                  )}
                  <div><span className="text-slate-500">Privacy:</span> <span className="font-medium">{form.isPrivate ? 'Private' : 'Public'}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-2">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={goBack} disabled={isSubmitting}>Back</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              {step === 1 ? null : step === 3 ? (
                <Button onClick={handleCreate} disabled={isSubmitting || !form.title}>
                  {isSubmitting ? 'Creating…' : (method === 'manual' ? 'Start Creating' : 'Generate Flashcards')}
                </Button>
              ) : (
                <Button onClick={goNext} disabled={isSubmitting || !canContinueFromStep2}>
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


