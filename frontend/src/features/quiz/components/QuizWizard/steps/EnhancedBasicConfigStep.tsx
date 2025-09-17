/**
 * Enhanced Basic Configuration Step
 * 
 * Improved version of BasicConfigStep with preset support,
 * smart defaults, and better UX for quiz configuration.
 */

import React, { useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DIFFICULTY_OPTIONS,
  QUIZ_TYPE_OPTIONS,
} from '../../../constants';
import { 
  getSuggestedTimeLimit,
} from '../../../utils';
import { 
  QUIZ_PRESETS, 
  PRESET_CATEGORIES,
  getRecommendedPresets,
  getPresetById,
  type QuizPreset,
} from '../../../constants/presets';
import { 
  generateMetadata,
  type SourceItem,
} from '@/components/wizard/shared/titleGeneration';
import { 
  Sparkles,
  Clock,
  Target,
  Settings,
  Zap,
  BookOpen,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface EnhancedBasicConfigStepProps {
  form: any;
  suggestedDifficulty?: string;
  sources?: SourceItem[];
  onPresetSelected?: (preset: QuizPreset) => void;
  showPresets?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export const EnhancedBasicConfigStep: React.FC<EnhancedBasicConfigStepProps> = ({
  form,
  suggestedDifficulty,
  sources = [],
  onPresetSelected,
  showPresets = true,
}) => {
  const { register, watch, setValue, formState } = form;
  
  const [selectedPreset, setSelectedPreset] = useState<QuizPreset | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  
  const currentValues = watch();
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Generate AI suggestions when sources change
  useEffect(() => {
    if (sources.length > 0) {
      const suggestions = generateMetadata({
        contentType: 'quiz',
        sources,
        quizType: currentValues.quiz_type,
        difficulty: currentValues.difficulty,
      });
      setAiSuggestions(suggestions);
      
      // Auto-populate if fields are empty
      if (!currentValues.topic && suggestions.topic) {
        setValue('topic', suggestions.topic);
      }
      if (!currentValues.title && suggestions.title) {
        setValue('title', suggestions.title);
      }
      if (!currentValues.description && suggestions.description) {
        setValue('description', suggestions.description);
      }
    }
  }, [sources, currentValues.quiz_type, currentValues.difficulty]);
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handlePresetSelect = (preset: QuizPreset) => {
    setSelectedPreset(preset);
    
    // Apply preset configuration
    setValue('quiz_type', preset.config.quiz_type);
    setValue('difficulty', preset.config.difficulty);
    setValue('max_questions', preset.config.max_questions);
    setValue('time_limit_sec', preset.config.time_limit_sec);
    setValue('delivery_mode', preset.config.delivery_mode);
    
    // Apply features
    Object.entries(preset.config.features).forEach(([key, value]) => {
      setValue(key, value);
    });
    
    onPresetSelected?.(preset);
  };
  
  const handleUseAISuggestion = (field: string, value: string) => {
    setValue(field, value);
  };
  
  // ============================================================================
  // Render Helpers
  // ============================================================================
  
  const renderPresetCard = (preset: QuizPreset, isRecommended = false) => {
    const isSelected = selectedPreset?.id === preset.id;
    
    return (
      <Card 
        key={preset.id}
        className={`cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
        onClick={() => handlePresetSelect(preset)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{preset.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900">{preset.name}</h4>
                  {isRecommended && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1">{preset.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {preset.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {preset.config.max_questions} questions
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {preset.config.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            {isSelected && (
              <div className="text-blue-600">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderPresetCategories = () => {
    const recommendedPresets = getRecommendedPresets(3);
    
    return (
      <div className="space-y-6">
        {/* Recommended Presets */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Recommended for You</h4>
          <div className="grid gap-3">
            {recommendedPresets.map(preset => renderPresetCard(preset, true))}
          </div>
        </div>
        
        {/* Category-based Presets */}
        {PRESET_CATEGORIES.map(category => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{category.icon}</span>
              <h4 className="font-medium text-slate-900">{category.name}</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3">{category.description}</p>
            <div className="grid gap-3">
              {category.presets.slice(0, 2).map(preset => renderPresetCard(preset))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderAISuggestions = () => {
    if (!aiSuggestions) return null;
    
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-blue-600" />
            AI Suggestions
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {Math.round(aiSuggestions.confidence * 100)}% confident
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Title Suggestion */}
          {aiSuggestions.title && aiSuggestions.title !== currentValues.title && (
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div>
                <Label className="text-xs text-slate-500">Suggested Title</Label>
                <p className="text-sm font-medium">{aiSuggestions.title}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUseAISuggestion('title', aiSuggestions.title)}
              >
                Use
              </Button>
            </div>
          )}
          
          {/* Topic Suggestion */}
          {aiSuggestions.topic && aiSuggestions.topic !== currentValues.topic && (
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div>
                <Label className="text-xs text-slate-500">Suggested Topic</Label>
                <p className="text-sm font-medium">{aiSuggestions.topic}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUseAISuggestion('topic', aiSuggestions.topic)}
              >
                Use
              </Button>
            </div>
          )}
          
          {/* Keywords */}
          {aiSuggestions.keywords?.length > 0 && (
            <div>
              <Label className="text-xs text-slate-500">Key Concepts Found</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {aiSuggestions.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Configure Your Quiz</h2>
          <p className="text-sm text-slate-600">
            Choose a preset for quick setup or customize your quiz configuration
          </p>
        </div>

        {/* Preset Selection */}
        {showPresets && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-900">Quick Setup Presets</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvancedOptions ? 'Hide' : 'Show'} Custom Options
              </Button>
            </div>
            
            {renderPresetCategories()}
            
            {selectedPreset && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Using preset: <strong>{selectedPreset.name}</strong>. 
                  You can still modify individual settings below.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions && renderAISuggestions()}

        {/* Basic Configuration Form */}
        <div className={`space-y-4 ${!showAdvancedOptions && selectedPreset ? 'opacity-75' : ''}`}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input 
                id="title" 
                {...register('title')}
                placeholder="e.g., Week 3 Knowledge Check"
              />
              {formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="topic">Topic/Subject *</Label>
              <Input 
                id="topic" 
                {...register('topic')}
                placeholder="e.g., Machine Learning Fundamentals"
              />
              {formState.errors.topic && (
                <p className="text-sm text-red-600 mt-1">{formState.errors.topic.message}</p>
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
                {...register('description')}
                placeholder="Optional description of the quiz content..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz_type">Quiz Type</Label>
                <Select 
                  value={watch('quiz_type')} 
                  onValueChange={(value) => setValue('quiz_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUIZ_TYPE_OPTIONS.map((option: any) => (
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
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={watch('difficulty')} 
                  onValueChange={(value) => setValue('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((option: any) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_questions">Number of Questions</Label>
                <Input 
                  id="max_questions" 
                  type="number"
                  {...register('max_questions', { valueAsNumber: true })}
                  placeholder="10"
                  min={1}
                  max={50}
                />
                {formState.errors.max_questions && (
                  <p className="text-sm text-red-600 mt-1">{formState.errors.max_questions.message}</p>
                )}
                {watch('max_questions') && (
                  <p className="text-sm text-blue-600 mt-1">
                    💡 Suggested: {Math.round((getSuggestedTimeLimit(watch('max_questions') || 10, watch('difficulty') || 'INTERMEDIATE')) / 60)} minutes
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="time_limit_sec">Time Limit (minutes)</Label>
                <Input 
                  id="time_limit_sec" 
                  type="number"
                  {...register('time_limit_sec', { valueAsNumber: true })}
                  placeholder="20"
                  min={1}
                  max={120}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Preset Summary */}
        {selectedPreset && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedPreset.icon}</span>
                <div>
                  <h4 className="font-medium text-green-900">
                    {selectedPreset.name} Selected
                  </h4>
                  <p className="text-sm text-green-700">
                    {selectedPreset.description} • {selectedPreset.estimatedTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FormProvider>
  );
};

export default EnhancedBasicConfigStep;

