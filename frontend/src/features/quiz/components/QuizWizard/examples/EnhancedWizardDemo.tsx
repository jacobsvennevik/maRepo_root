/**
 * Enhanced Quiz Wizard Demo
 * 
 * Demonstrates how to integrate and use the enhanced quiz wizard
 * with all the new shared components and improved features.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedQuizWizard } from '../EnhancedQuizWizard';
import { 
  QUIZ_PRESETS, 
  getRecommendedPresets,
  getPresetsByCategory,
  type QuizPreset 
} from '../../../constants/presets';
import { 
  Brain,
  Sparkles,
  Clock,
  Target,
  Play,
  Settings,
  Info,
  CheckCircle2,
} from 'lucide-react';

// ============================================================================
// Demo Component
// ============================================================================

interface EnhancedWizardDemoProps {
  projectId: string;
}

export const EnhancedWizardDemo: React.FC<EnhancedWizardDemoProps> = ({
  projectId,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [createdQuizzes, setCreatedQuizzes] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState<'showcase' | 'interactive'>('showcase');

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleQuizCreated = (quizId: string) => {
    setCreatedQuizzes(prev => [...prev, quizId]);
    console.log('✅ Quiz created successfully:', quizId);
  };

  const startQuizCreation = () => {
    setIsWizardOpen(true);
    setDemoMode('interactive');
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderPresetShowcase = () => {
    const recommendedPresets = getRecommendedPresets(3);
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">Available Quiz Presets</h3>
          <p className="text-sm text-slate-600">
            Pre-configured quiz types for different use cases
          </p>
        </div>

        {/* Recommended Presets */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Recommended for You
          </h4>
          <div className="grid gap-3">
            {recommendedPresets.map(preset => (
              <Card key={preset.id} className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{preset.icon}</div>
                      <div>
                        <h5 className="font-medium text-slate-900">{preset.name}</h5>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['quick', 'academic', 'professional'].map(category => {
            const categoryPresets = getPresetsByCategory(category);
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {categoryName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryPresets.slice(0, 3).map(preset => (
                      <div key={preset.id} className="text-sm">
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-slate-500 text-xs">{preset.estimatedTime}</div>
                      </div>
                    ))}
                    {categoryPresets.length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{categoryPresets.length - 3} more...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFeatureHighlights = () => {
    const features = [
      {
        icon: <Sparkles className="h-5 w-5 text-blue-600" />,
        title: 'AI-Powered Metadata',
        description: 'Smart title and description generation from your content sources',
      },
      {
        icon: <Target className="h-5 w-5 text-green-600" />,
        title: 'Multi-Source Selection',
        description: 'Combine flashcards, files, and study materials in one quiz',
      },
      {
        icon: <Settings className="h-5 w-5 text-purple-600" />,
        title: 'Quick Presets',
        description: 'Pre-configured quiz types for different scenarios',
      },
      {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
        title: 'Smart Validation',
        description: 'Real-time validation and quality checks',
      },
    ];

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <h4 className="font-medium text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUsageExample = () => {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Integration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-slate-50 p-4 rounded border overflow-x-auto">
{`import { EnhancedQuizWizard } from '@/features/quiz/components/QuizWizard';

function MyQuizCenter({ projectId }: { projectId: string }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleQuizCreated = (quizId: string) => {
    console.log('Quiz created:', quizId);
    // Handle navigation or state updates
  };

  return (
    <>
      <Button onClick={() => setIsWizardOpen(true)}>
        Create AI Quiz
      </Button>
      
      <EnhancedQuizWizard
        projectId={projectId}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onCreated={handleQuizCreated}
      />
    </>
  );
}`}
          </pre>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Enhanced Quiz Wizard</h1>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Experience the next generation of quiz creation with AI-powered suggestions, 
          multi-source integration, and intelligent presets.
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <Button onClick={startQuizCreation} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Try Enhanced Wizard
          </Button>
          <Button variant="outline" size="lg" onClick={() => setDemoMode('showcase')}>
            <Info className="h-4 w-4 mr-2" />
            View Features
          </Button>
        </div>

        {createdQuizzes.length > 0 && (
          <Alert className="max-w-md mx-auto">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully created {createdQuizzes.length} quiz{createdQuizzes.length !== 1 ? 'es' : ''} 
              using the enhanced wizard!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Feature Highlights */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Key Features</h2>
        {renderFeatureHighlights()}
      </div>

      {/* Preset Showcase */}
      {demoMode === 'showcase' && renderPresetShowcase()}

      {/* Usage Example */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">How to Use</h2>
        {renderUsageExample()}
      </div>

      {/* Comparison with Original */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Improvements Over Original Wizard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-900 mb-2">Enhanced Features</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Multi-source selection (flashcards + files + materials)</li>
                <li>• AI-powered title and description generation</li>
                <li>• Quick setup presets for common scenarios</li>
                <li>• Smart validation and error prevention</li>
                <li>• Improved step navigation with skip logic</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Developer Benefits</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Reusable shared components</li>
                <li>• Better code organization and maintainability</li>
                <li>• Consistent UX across different wizards</li>
                <li>• Comprehensive TypeScript support</li>
                <li>• Easy to extend and customize</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quiz Wizard */}
      <EnhancedQuizWizard
        projectId={projectId}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onCreated={handleQuizCreated}
      />
    </div>
  );
};

export default EnhancedWizardDemo;

