/**
 * GenerateQuizStep
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  File,
} from 'lucide-react';

interface GenerateQuizStepProps {
  form: any;
  method: 'auto' | 'files' | 'manual';
  uploadedFiles: File[];
  selectedExistingFileIds: (string | number)[];
  projectFiles: any[];
  isGenerating: boolean;
  generatedQuiz: any;
  error: string | null;
  onGenerate: () => void;
}

export const GenerateQuizStep: React.FC<GenerateQuizStepProps> = ({
  form,
  method,
  uploadedFiles,
  selectedExistingFileIds,
  projectFiles,
  isGenerating,
  generatedQuiz,
  error,
  onGenerate,
}) => {
  const { getValues } = form;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Generate Quiz</h2>
        <p className="text-sm text-slate-600">Review your settings and generate the quiz</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Configuration Summary</h3>
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
              <div className="mt-3">
                <span className="font-medium text-sm">Source Files:</span>
                <div className="mt-1 space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-slate-600">
                      📄 {file.name}
                    </div>
                  ))}
                  {selectedExistingFileIds.map(fileId => {
                    const file = projectFiles.find((f: any) => f.id === fileId);
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

        <div className="text-center">
          <Button 
            onClick={onGenerate}
            disabled={isGenerating}
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

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
};

export default GenerateQuizStep;


