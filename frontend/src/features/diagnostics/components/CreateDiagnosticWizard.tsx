"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { StylePicker, TestStyleConfig } from './StylePicker';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CreateDiagnosticWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated: (session: any) => void;
}

interface DiagnosticFormData {
  topic: string;
  delivery_mode: 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK';
  max_questions: number;
  difficulty: number;
  scheduled_for?: string;
  due_at?: string;
  test_style?: string | null;
  style_config_override?: any;
}

const STEPS = [
  { id: 'basic', title: 'Basic Settings', description: 'Set topic and basic parameters' },
  { id: 'style', title: 'Test Style', description: 'Choose test style and configuration' },
  { id: 'schedule', title: 'Schedule', description: 'Set timing and deadlines' },
  { id: 'review', title: 'Review', description: 'Review and create diagnostic' }
];

export function CreateDiagnosticWizard({ 
  open, 
  onOpenChange, 
  projectId, 
  onCreated 
}: CreateDiagnosticWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DiagnosticFormData>({
    topic: '',
    delivery_mode: 'DEFERRED_FEEDBACK',
    max_questions: 3,
    difficulty: 2,
  });
  const [styleConfig, setStyleConfig] = useState<TestStyleConfig>({
    test_style: null,
    style_config_override: {}
  });

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      topic: '',
      delivery_mode: 'DEFERRED_FEEDBACK',
      max_questions: 3,
      difficulty: 2,
    });
    setStyleConfig({
      test_style: null,
      style_config_override: {}
    });
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreateDiagnostic = async () => {
    try {
      setIsLoading(true);
      
      // Use axiosApi directly to align with unit tests
      const { axiosApi } = await import('@/lib/axios-api');

      const payload = {
        project: projectId,
        topic: formData.topic,
        difficulty: formData.difficulty,
        delivery_mode: formData.delivery_mode,
        max_questions: formData.max_questions,
        // Include style fields
        test_style: styleConfig.test_style,
        style_config_override: styleConfig.style_config_override
      };

      const response = await axiosApi.post('/diagnostics/generate/', payload);
      const newSession = response?.data ?? {};
      onCreated(newSession);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Thermodynamics Fundamentals"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label id="label-delivery_mode" htmlFor="delivery_mode">Feedback Mode</Label>
                <Select
                  value={formData.delivery_mode}
                  onValueChange={(value: string) => 
                    setFormData(prev => ({ ...prev, delivery_mode: value as 'IMMEDIATE_FEEDBACK' | 'DEFERRED_FEEDBACK' }))
                  }
                >
                  <SelectTrigger aria-labelledby="label-delivery_mode" aria-label="Feedback Mode">
                    <SelectValue placeholder={formData.delivery_mode === 'IMMEDIATE_FEEDBACK' ? 'Immediate Feedback' : 'Deferred Feedback'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE_FEEDBACK">Immediate Feedback</SelectItem>
                    <SelectItem value="DEFERRED_FEEDBACK">Deferred Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label id="label-max_questions" htmlFor="max_questions">Questions</Label>
                <Select
                  value={formData.max_questions.toString()}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, max_questions: parseInt(value) }))
                  }
                >
                  <SelectTrigger aria-labelledby="label-max_questions" aria-label="Questions">
                    <SelectValue placeholder={`${formData.max_questions} Questions`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty.toString()}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, difficulty: parseInt(value) }))
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder={`Level ${formData.difficulty}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 - Easy</SelectItem>
                  <SelectItem value="2">Level 2 - Medium</SelectItem>
                  <SelectItem value="3">Level 3 - Hard</SelectItem>
                  <SelectItem value="4">Level 4 - Expert</SelectItem>
                  <SelectItem value="5">Level 5 - Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <StylePicker
            value={styleConfig}
            onChange={setStyleConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_for">Scheduled For</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={formData.scheduled_for || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="due_at">Due By</Label>
                <Input
                  id="due_at"
                  type="datetime-local"
                  value={formData.due_at || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_at: e.target.value }))}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Optional: Set specific times for when the diagnostic should be available and when it should close.</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Review Your Diagnostic</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Topic:</strong> {formData.topic}</div>
                <div><strong>Questions:</strong> {formData.max_questions}</div>
                <div><strong>Difficulty:</strong> Level {formData.difficulty}</div>
                <div><strong>Feedback:</strong> {formData.delivery_mode === 'IMMEDIATE_FEEDBACK' ? 'Immediate' : 'Deferred'}</div>
                {styleConfig.test_style && (
                  <div><strong>Test Style:</strong> {styleConfig.test_style}</div>
                )}
                {formData.scheduled_for && (
                  <div><strong>Scheduled:</strong> {new Date(formData.scheduled_for).toLocaleString()}</div>
                )}
                {formData.due_at && (
                  <div><strong>Due:</strong> {new Date(formData.due_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.topic.trim().length > 0;
      case 1:
        return true; // Style picker is optional
      case 2:
        return true; // Schedule is optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Diagnostic</DialogTitle>
          <DialogDescription>
            Generate a pre-lecture diagnostic to assess student knowledge
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress 
            value={(currentStep + 1) / STEPS.length * 100} 
            className="h-2"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{STEPS[currentStep].title}</span>
            <span>{currentStep + 1} of {STEPS.length}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleCreateDiagnostic} 
              disabled={isLoading || !canProceed()}
            >
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Diagnostic
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
