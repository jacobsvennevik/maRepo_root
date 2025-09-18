"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MessageSquare, 
  Target, 
  Lightbulb,
  CheckCircle2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { 
  validateConfig, 
  applyFixes, 
  getValidationSummary,
  type ValidationIssue,
  type StyleConfig 
} from '../utils/styleValidator';
import { 
  generatePreviewItems, 
  generatePreviewBadges,
  type PreviewItem,
  type PreviewBadge 
} from '../utils/previewGenerator';
import { getMVPPresets, type StylePreset } from '../utils/presetRegistry';
import { 
  trackStyleSelected, 
  trackStyleCustomized, 
  trackPreviewOpened,
  trackValidationTriggered,
  trackAutofixApplied 
} from '../utils/styleAnalytics';

export interface TestStyleConfig {
  test_style: 'mcq_quiz' | 'mixed_checkpoint' | 'stem_problem_set' | null;
  style_config_override: {
    timing?: {
      total_minutes: number;
      per_item_seconds: number;
    };
    feedback?: 'immediate' | 'on_submit' | 'end_only' | 'tiered_hints';
    item_mix?: {
      single_select: number;
      cloze: number;
      short_answer: number;
      numeric: number;
      multi_step: number;
    };
    difficulty?: 'easier' | 'balanced' | 'harder';
    hints?: boolean;
  };
}

interface StylePickerProps {
  value: TestStyleConfig;
  onChange: (config: TestStyleConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESETS = {
  mcq_quiz: {
    name: 'MCQ Quiz',
    description: 'Multiple choice questions with immediate feedback',
    icon: Target,
    config: {
      timing: { total_minutes: 15, per_item_seconds: 60 },
      feedback: 'immediate' as const,
      item_mix: { single_select: 0.9, cloze: 0.1, short_answer: 0, numeric: 0, multi_step: 0 },
      difficulty: 'balanced' as const,
      hints: false
    }
  },
  mixed_checkpoint: {
    name: 'Mixed Checkpoint',
    description: 'Combination of question types with deferred feedback',
    icon: CheckCircle2,
    config: {
      timing: { total_minutes: 30, per_item_seconds: 90 },
      feedback: 'on_submit' as const,
      item_mix: { single_select: 0.6, cloze: 0, short_answer: 0.4, numeric: 0, multi_step: 0 },
      difficulty: 'balanced' as const,
      hints: true
    }
  },
  stem_problem_set: {
    name: 'STEM Problem Set',
    description: 'Numeric and multi-step problems with tiered hints',
    icon: Settings,
    config: {
      timing: { total_minutes: 45, per_item_seconds: 300 },
      feedback: 'tiered_hints' as const,
      item_mix: { single_select: 0, cloze: 0, short_answer: 0, numeric: 0.7, multi_step: 0.3 },
      difficulty: 'harder' as const,
      hints: true
    }
  }
};

// Icon mapping for presets
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ElementType> = {
    target: Target,
    'check-circle': CheckCircle2,
    settings: Settings,
    clock: Clock,
    message: MessageSquare,
    lightbulb: Lightbulb
  };
  return iconMap[iconName] || Target;
};

export function StylePicker({ value, onChange, onNext, onBack }: StylePickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [previewBadges, setPreviewBadges] = useState<PreviewBadge[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const presets = getMVPPresets();
  
  const [effectiveConfig, setEffectiveConfig] = useState<StyleConfig>(() => {
    if (value.test_style && presets[value.test_style]) {
      return { ...presets[value.test_style].config, ...value.style_config_override };
    }
    return value.style_config_override;
  });

  // Validate configuration whenever it changes
  useEffect(() => {
    const validation = validateConfig(effectiveConfig);
    setValidationIssues(validation.issues);
    
    // Track validation events
    if (validation.issues.length > 0) {
      trackValidationTriggered(
        value.test_style || 'custom',
        validation.issues.length,
        validation.issues.some(i => i.level === 'error'),
        validation.issues.some(i => i.level === 'warning')
      );
    }
  }, [effectiveConfig, value.test_style]);

  // Generate preview when configuration changes
  useEffect(() => {
    if (showPreview) {
      const items = generatePreviewItems(effectiveConfig);
      const badges = generatePreviewBadges(effectiveConfig);
      setPreviewItems(items);
      setPreviewBadges(badges);
    }
  }, [effectiveConfig, showPreview]);

  const handlePresetSelect = (presetId: string) => {
    const preset = presets[presetId];
    if (!preset) return;
    
    // Ensure timing config has required properties and item_mix has correct structure
    const configWithRequiredTiming = {
      ...preset.config,
      timing: preset.config.timing ? {
        total_minutes: preset.config.timing.total_minutes ?? 30,
        per_item_seconds: preset.config.timing.per_item_seconds ?? 60
      } : undefined,
      item_mix: preset.config.item_mix ? {
        single_select: preset.config.item_mix.single_select ?? 0,
        cloze: preset.config.item_mix.cloze ?? 0,
        short_answer: preset.config.item_mix.short_answer ?? 0,
        numeric: preset.config.item_mix.numeric ?? 0,
        multi_step: preset.config.item_mix.multi_step ?? 0
      } : undefined
    };
    
    const newConfig = {
      test_style: presetId as any,
      style_config_override: configWithRequiredTiming
    };
    setEffectiveConfig(configWithRequiredTiming);
    onChange(newConfig);
    
    // Track preset selection
    trackStyleSelected(presetId, preset.label, 'preset');
  };

  const handleOverrideChange = (key: string, newValue: any) => {
    const oldValue = effectiveConfig[key as keyof StyleConfig];
    
    // Create base overrides with the new value
    // eslint-disable-next-line prefer-const
    let updatedOverrides = {
      ...effectiveConfig,
      [key]: newValue
    };
    
    // Ensure timing config has required properties if it's being updated
    if (key === 'timing' && newValue) {
      updatedOverrides.timing = {
        total_minutes: newValue.total_minutes ?? 30,
        per_item_seconds: newValue.per_item_seconds ?? 60
      };
    }
    
    // Ensure item_mix has correct structure if it's being updated
    if (key === 'item_mix' && newValue) {
      updatedOverrides.item_mix = {
        single_select: newValue.single_select ?? 0,
        cloze: newValue.cloze ?? 0,
        short_answer: newValue.short_answer ?? 0,
        numeric: newValue.numeric ?? 0,
        multi_step: newValue.multi_step ?? 0
      };
    }
    
    setEffectiveConfig(updatedOverrides);
    
    // Create a properly typed config for onChange that matches TestStyleConfig
    const configForOnChange = {
      ...updatedOverrides,
      // Ensure timing has required properties if it exists
      timing: updatedOverrides.timing ? {
        total_minutes: updatedOverrides.timing.total_minutes ?? 30,
        per_item_seconds: updatedOverrides.timing.per_item_seconds ?? 60
      } : undefined,
      // Ensure item_mix has correct structure if it exists
      item_mix: updatedOverrides.item_mix ? {
        single_select: updatedOverrides.item_mix.single_select ?? 0,
        cloze: updatedOverrides.item_mix.cloze ?? 0,
        short_answer: updatedOverrides.item_mix.short_answer ?? 0,
        numeric: updatedOverrides.item_mix.numeric ?? 0,
        multi_step: updatedOverrides.item_mix.multi_step ?? 0
      } : undefined
    } as TestStyleConfig['style_config_override'];
    
    onChange({
      test_style: value.test_style,
      style_config_override: configForOnChange
    });
    
    // Track customization
    trackStyleCustomized(
      value.test_style || 'custom',
      key,
      oldValue,
      newValue,
      key
    );
  };

  const handleApplyAllFixes = () => {
    const validation = validateConfig(effectiveConfig);
    if (validation.fixes.length > 0) {
      const fixedConfig = applyFixes(effectiveConfig, validation.fixes);
      setEffectiveConfig(fixedConfig);
      
      // Create a properly typed config for onChange that matches TestStyleConfig
      const configForOnChange = {
        ...fixedConfig,
        // Ensure timing has required properties if it exists
        timing: fixedConfig.timing ? {
          total_minutes: fixedConfig.timing.total_minutes ?? 30,
          per_item_seconds: fixedConfig.timing.per_item_seconds ?? 60
        } : undefined,
        // Ensure item_mix has correct structure if it exists
        item_mix: fixedConfig.item_mix ? {
          single_select: fixedConfig.item_mix.single_select ?? 0,
          cloze: fixedConfig.item_mix.cloze ?? 0,
          short_answer: fixedConfig.item_mix.short_answer ?? 0,
          numeric: fixedConfig.item_mix.numeric ?? 0,
          multi_step: fixedConfig.item_mix.multi_step ?? 0
        } : undefined
      } as TestStyleConfig['style_config_override'];
      
      onChange({
        test_style: value.test_style,
        style_config_override: configForOnChange
      });
      
      // Track autofix application
      trackAutofixApplied(
        value.test_style || 'custom',
        validation.fixes.length,
        validation.fixes.map(f => f.path)
      );
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      trackPreviewOpened(value.test_style || 'custom', 3);
    }
  };

  const renderValidationIssues = () => {
    if (validationIssues.length === 0) return null;

    const errors = validationIssues.filter(i => i.level === 'error');
    const warnings = validationIssues.filter(i => i.level === 'warning');
    const info = validationIssues.filter(i => i.level === 'info');

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Validation Issues</h4>
          {validationIssues.some(i => i.fix) && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleApplyAllFixes}
            >
              Apply All Fixes
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {errors.map((issue, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{issue.path}:</strong> {issue.message}
                {issue.fix && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-2"
                    onClick={() => {
                      const fixedConfig = applyFixes(effectiveConfig, [issue.fix!]);
                      setEffectiveConfig(fixedConfig);
                      
                      // Create a properly typed config for onChange that matches TestStyleConfig
                      const configForOnChange = {
                        ...fixedConfig,
                        // Ensure timing has required properties if it exists
                        timing: fixedConfig.timing ? {
                          total_minutes: fixedConfig.timing.total_minutes ?? 30,
                          per_item_seconds: fixedConfig.timing.per_item_seconds ?? 60
                        } : undefined,
                        // Ensure item_mix has correct structure if it exists
                        item_mix: fixedConfig.item_mix ? {
                          single_select: fixedConfig.item_mix.single_select ?? 0,
                          cloze: fixedConfig.item_mix.cloze ?? 0,
                          short_answer: fixedConfig.item_mix.short_answer ?? 0,
                          numeric: fixedConfig.item_mix.numeric ?? 0,
                          multi_step: fixedConfig.item_mix.multi_step ?? 0
                        } : undefined
                      } as TestStyleConfig['style_config_override'];
                      
                      onChange({
                        test_style: value.test_style,
                        style_config_override: configForOnChange
                      });
                    }}
                  >
                    Fix
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
          
          {warnings.map((issue, index) => (
            <Alert key={index} variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{issue.path}:</strong> {issue.message}
                {issue.fix && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-2"
                    onClick={() => {
                      const fixedConfig = applyFixes(effectiveConfig, [issue.fix!]);
                      setEffectiveConfig(fixedConfig);
                      
                      // Create a properly typed config for onChange that matches TestStyleConfig
                      const configForOnChange = {
                        ...fixedConfig,
                        // Ensure timing has required properties if it exists
                        timing: fixedConfig.timing ? {
                          total_minutes: fixedConfig.timing.total_minutes ?? 30,
                          per_item_seconds: fixedConfig.timing.per_item_seconds ?? 60
                        } : undefined,
                        // Ensure item_mix has correct structure if it exists
                        item_mix: fixedConfig.item_mix ? {
                          single_select: fixedConfig.item_mix.single_select ?? 0,
                          cloze: fixedConfig.item_mix.cloze ?? 0,
                          short_answer: fixedConfig.item_mix.short_answer ?? 0,
                          numeric: fixedConfig.item_mix.numeric ?? 0,
                          multi_step: fixedConfig.item_mix.multi_step ?? 0
                        } : undefined
                      } as TestStyleConfig['style_config_override'];
                      
                      onChange({
                        test_style: value.test_style,
                        style_config_override: configForOnChange
                      });
                    }}
                  >
                    Fix
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
          
          {info.map((issue, index) => (
            <Alert key={index} variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{issue.path}:</strong> {issue.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Preview Configuration</h4>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handlePreviewToggle}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Timing: {effectiveConfig.timing?.total_minutes || 15}m total</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            <span>Feedback: {effectiveConfig.feedback || 'immediate'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3" />
            <span>Difficulty: {effectiveConfig.difficulty || 'balanced'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-3 w-3" />
            <span>Hints: {effectiveConfig.hints ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        {showPreview && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {previewBadges.map((badge, index) => (
                <Badge key={index} variant={badge.variant} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium">Sample Items:</div>
              {previewItems.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium">{item.question}</div>
                  {item.options && (
                    <div className="mt-1 text-gray-600">
                      {item.options.slice(0, 2).join(', ')}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Test Style</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a preset style or customize your test configuration
        </p>
      </div>

      {/* Preset Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(presets).map((preset) => {
          const Icon = getIconComponent(preset.icon);
          const isSelected = value.test_style === preset.id;
          
          return (
            <Card 
              key={preset.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md hover:bg-gray-50'
              }`}
              onClick={() => handlePresetSelect(preset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-base">{preset.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">{preset.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {preset.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {isSelected && (
                  <Badge className="mt-2" variant="default">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Issues */}
      {renderValidationIssues()}

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Advanced Configuration</h4>
          <Checkbox
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 border rounded-lg">
            {/* Timing Configuration */}
            <div className="space-y-3">
              <Label>Timing Configuration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Total Time (minutes)</Label>
                  <Slider
                    value={[effectiveConfig.timing?.total_minutes || 15]}
                    onValueChange={([value]) => 
                      handleOverrideChange('timing', {
                        ...effectiveConfig.timing,
                        total_minutes: value
                      })
                    }
                    min={5}
                    max={120}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {effectiveConfig.timing?.total_minutes || 15} minutes
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Per Item Time (seconds)</Label>
                  <Slider
                    value={[effectiveConfig.timing?.per_item_seconds || 60]}
                    onValueChange={([value]) => 
                      handleOverrideChange('timing', {
                        ...effectiveConfig.timing,
                        per_item_seconds: value
                      })
                    }
                    min={30}
                    max={600}
                    step={30}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {effectiveConfig.timing?.per_item_seconds || 60} seconds
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Configuration */}
            <div>
              <Label>Feedback Mode</Label>
              <select
                value={effectiveConfig.feedback || 'immediate'}
                onChange={(e) => handleOverrideChange('feedback', e.target.value)}
                className="mt-2 w-full p-2 border rounded-md"
              >
                <option value="immediate">Immediate</option>
                <option value="on_submit">On Submit</option>
                <option value="end_only">End Only</option>
                <option value="tiered_hints">Tiered Hints</option>
              </select>
            </div>

            {/* Difficulty Configuration */}
            <div>
              <Label>Difficulty Level</Label>
              <select
                value={effectiveConfig.difficulty || 'balanced'}
                onChange={(e) => handleOverrideChange('difficulty', e.target.value)}
                className="mt-2 w-full p-2 border rounded-md"
              >
                <option value="easier">Easier</option>
                <option value="balanced">Balanced</option>
                <option value="harder">Harder</option>
              </select>
            </div>

            {/* Hints Configuration */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={effectiveConfig.hints || false}
                onCheckedChange={(checked) => handleOverrideChange('hints', checked)}
              />
              <Label>Enable Hints</Label>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {renderPreview()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
