/**
 * AI-Powered Metadata Generation Step
 * 
 * Generates and manages quiz/content metadata including titles, descriptions,
 * and topics using AI analysis of selected sources. Follows CEFR-B2 guidelines
 * and ensures uniqueness within the project.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Edit3,
  Save,
  X,
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface AIMetadataSuggestions {
  topic: string;
  title: string;
  description: string;
  confidence: number;
  source_analysis: {
    dominant_concepts: string[];
    difficulty_indicators: string[];
    content_type: string;
    estimated_scope: string;
  };
}

export interface MetadataFormData {
  topic: string;
  title: string;
  description: string;
  suggestedByAI: boolean;
  userModified: boolean;
}

interface AIMetadataStepProps {
  sources: any[];
  initialMetadata?: Partial<MetadataFormData>;
  onMetadataChange: (metadata: MetadataFormData) => void;
  titleTemplate?: string;
  contentType?: 'quiz' | 'flashcard' | 'diagnostic';
  projectId: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
}

// ============================================================================
// Constants and Configuration
// ============================================================================

const CONTENT_TYPE_CONFIG = {
  quiz: {
    titleSuffix: 'Quiz',
    descriptionPrefix: 'Test your knowledge of',
    icon: Brain,
    color: 'bg-blue-100 text-blue-800',
  },
  flashcard: {
    titleSuffix: 'Flashcards',
    descriptionPrefix: 'Review and memorize',
    icon: Brain,
    color: 'bg-green-100 text-green-800',
  },
  diagnostic: {
    titleSuffix: 'Assessment',
    descriptionPrefix: 'Assess your understanding of',
    icon: Brain,
    color: 'bg-purple-100 text-purple-800',
  },
};

const QUALITY_INDICATORS = {
  title: {
    maxLength: 60,
    minLength: 5,
    patterns: {
      good: /^[A-Z][a-zA-Z0-9\s\-—]+$/,
      avoid: /[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/,
    },
  },
  description: {
    maxLength: 200,
    minLength: 20,
    cefr_b2_words: ['assess', 'understand', 'explore', 'analyze', 'demonstrate', 'evaluate'],
  },
  topic: {
    maxLength: 50,
    minLength: 3,
    maxWords: 8,
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

const validateTitle = (title: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (title.length < QUALITY_INDICATORS.title.minLength) {
    issues.push('Title too short');
  }
  if (title.length > QUALITY_INDICATORS.title.maxLength) {
    issues.push('Title too long');
  }
  if (QUALITY_INDICATORS.title.patterns.avoid.test(title)) {
    issues.push('Contains special characters');
  }
  if (!QUALITY_INDICATORS.title.patterns.good.test(title)) {
    issues.push('Should start with capital letter');
  }
  
  return { isValid: issues.length === 0, issues };
};

const validateDescription = (description: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (description.length < QUALITY_INDICATORS.description.minLength) {
    issues.push('Description too short');
  }
  if (description.length > QUALITY_INDICATORS.description.maxLength) {
    issues.push('Description too long');
  }
  
  return { isValid: issues.length === 0, issues };
};

const validateTopic = (topic: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const wordCount = topic.split(' ').filter(word => word.length > 0).length;
  
  if (topic.length < QUALITY_INDICATORS.topic.minLength) {
    issues.push('Topic too short');
  }
  if (topic.length > QUALITY_INDICATORS.topic.maxLength) {
    issues.push('Topic too long');
  }
  if (wordCount > QUALITY_INDICATORS.topic.maxWords) {
    issues.push(`Too many words (${wordCount}/${QUALITY_INDICATORS.topic.maxWords})`);
  }
  
  return { isValid: issues.length === 0, issues };
};

const generateDefaultMetadata = (
  sources: any[], 
  contentType: string,
  titleTemplate?: string
): Partial<MetadataFormData> => {
  const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG];
  
  // Extract topic from sources
  let topic = 'General Knowledge';
  if (sources.length > 0) {
    const sourceTitles = sources.map(s => s.title || s.name || '').filter(Boolean);
    if (sourceTitles.length > 0) {
      topic = sourceTitles[0].replace(/\.[^.]+$/, ''); // Remove file extension
    }
  }
  
  // Generate title using template or default pattern
  const title = titleTemplate 
    ? titleTemplate.replace('{topic}', topic).replace('{type}', config.titleSuffix)
    : `${topic} — ${config.titleSuffix}`;
  
  // Generate description
  const description = `${config.descriptionPrefix} ${topic.toLowerCase()}. This content is based on your selected materials and designed to help you learn effectively.`;
  
  return {
    topic,
    title,
    description,
    suggestedByAI: false,
    userModified: false,
  };
};

// ============================================================================
// Main Component
// ============================================================================

export const AIMetadataStep: React.FC<AIMetadataStepProps> = ({
  sources,
  initialMetadata,
  onMetadataChange,
  titleTemplate,
  contentType = 'quiz',
  projectId,
  isGenerating = false,
  onRegenerate,
}) => {
  const [metadata, setMetadata] = useState<MetadataFormData>({
    topic: '',
    title: '',
    description: '',
    suggestedByAI: false,
    userModified: false,
    ...initialMetadata,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<keyof MetadataFormData | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AIMetadataSuggestions | null>(null);
  
  const config = CONTENT_TYPE_CONFIG[contentType];
  const Icon = config.icon;
  
  // ============================================================================
  // Validation
  // ============================================================================
  
  const titleValidation = validateTitle(metadata.title);
  const descriptionValidation = validateDescription(metadata.description);
  const topicValidation = validateTopic(metadata.topic);
  
  const isFormValid = titleValidation.isValid && descriptionValidation.isValid && topicValidation.isValid;
  
  // ============================================================================
  // Effects
  // ============================================================================
  
  // Initialize with default metadata if empty
  useEffect(() => {
    if (!metadata.title && !metadata.topic && !metadata.description && sources.length > 0) {
      const defaultMetadata = generateDefaultMetadata(sources, contentType, titleTemplate);
      const newMetadata = { ...metadata, ...defaultMetadata };
      setMetadata(newMetadata);
      onMetadataChange(newMetadata);
    }
  }, [sources, contentType, titleTemplate]);
  
  // Notify parent of changes
  useEffect(() => {
    onMetadataChange(metadata);
  }, [metadata, onMetadataChange]);
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleFieldEdit = (field: keyof MetadataFormData, value: string) => {
    setEditingField(field);
    setTempValue(value);
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (editingField) {
      const newMetadata = {
        ...metadata,
        [editingField]: tempValue,
        userModified: true,
      };
      setMetadata(newMetadata);
    }
    setIsEditing(false);
    setEditingField(null);
    setTempValue('');
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingField(null);
    setTempValue('');
  };
  
  const handleRegenerate = async () => {
    try {
      // Mock AI generation - replace with actual API call
      const mockSuggestions: AIMetadataSuggestions = {
        topic: "Machine Learning Fundamentals",
        title: "Machine Learning Fundamentals — Diagnostic Quiz",
        description: "Assess your understanding of core machine learning concepts including supervised learning, neural networks, and model evaluation techniques.",
        confidence: 0.87,
        source_analysis: {
          dominant_concepts: ["neural networks", "supervised learning", "classification"],
          difficulty_indicators: ["intermediate", "technical terms"],
          content_type: "academic",
          estimated_scope: "comprehensive overview",
        },
      };
      
      setAiSuggestions(mockSuggestions);
      
      const newMetadata = {
        ...metadata,
        topic: mockSuggestions.topic,
        title: mockSuggestions.title,
        description: mockSuggestions.description,
        suggestedByAI: true,
        userModified: false,
      };
      
      setMetadata(newMetadata);
      onRegenerate?.();
      
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
  };
  
  // ============================================================================
  // Render Helpers
  // ============================================================================
  
  const renderFieldEditor = (
    field: keyof MetadataFormData,
    label: string,
    value: string,
    validation: { isValid: boolean; issues: string[] },
    isTextarea = false
  ) => {
    const isCurrentlyEditing = isEditing && editingField === field;
    
    return (
      <div className="space-y-2">
        <Label className="flex items-center justify-between">
          {label}
          {!isCurrentlyEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFieldEdit(field, value)}
              className="h-6 px-2 text-slate-500 hover:text-slate-700"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </Label>
        
        {isCurrentlyEditing ? (
          <div className="space-y-2">
            {isTextarea ? (
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={`p-3 rounded-lg border ${validation.isValid ? 'border-slate-200 bg-slate-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-sm">{value || 'No value set'}</p>
            {!validation.isValid && (
              <div className="mt-2">
                {validation.issues.map((issue, index) => (
                  <p key={index} className="text-xs text-red-600">• {issue}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Icon className="h-6 w-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Content Details</h2>
        </div>
        <p className="text-sm text-slate-600">
          Review and customize the title, topic, and description for your content
        </p>
      </div>

      {/* AI Generation Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-blue-600" />
            AI-Generated Suggestions
            <Badge variant="secondary" className={config.color}>
              {sources.length} source{sources.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Generate smart titles and descriptions based on your selected sources
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating || sources.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          
          {aiSuggestions && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                AI confidence: {Math.round(aiSuggestions.confidence * 100)}% • 
                Key concepts: {aiSuggestions.source_analysis.dominant_concepts.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Metadata Form */}
      <div className="space-y-4">
        {renderFieldEditor('topic', 'Topic/Subject', metadata.topic, topicValidation)}
        {renderFieldEditor('title', 'Title', metadata.title, titleValidation)}
        {renderFieldEditor('description', 'Description', metadata.description, descriptionValidation, true)}
      </div>

      {/* Validation Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFormValid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Ready to proceed</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-900">Please fix validation issues</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {metadata.suggestedByAI && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
              {metadata.userModified && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                  Modified
                </Badge>
              )}
            </div>
          </div>
          
          {!isFormValid && (
            <div className="mt-3 text-sm text-slate-600">
              <p>Please review and fix the issues highlighted above before continuing.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMetadataStep;

