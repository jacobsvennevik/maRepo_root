/**
 * ReviewCreateStep
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ReviewCreateStepProps {
  form: any;
  method: 'auto' | 'files' | 'manual';
  generatedQuiz: any;
  isSubmitting: boolean;
  error: string | null;
  onCreate: () => void;
}

export const ReviewCreateStep: React.FC<ReviewCreateStepProps> = ({
  form,
  method,
  generatedQuiz,
  isSubmitting,
  error,
  onCreate,
}) => {
  const { getValues } = form;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Review & Create</h2>
        <p className="text-sm text-slate-600">Final review before creating your quiz</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Final Review</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Quiz Title:</span>
                <span>{getValues('title') || 'Untitled Quiz'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Topic:</span>
                <span>{getValues('topic') || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Difficulty:</span>
                <span>{getValues('difficulty')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Questions:</span>
                <span>{getValues('max_questions')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Limit:</span>
                <span>{getValues('time_limit_sec') ? Math.round(getValues('time_limit_sec')! / 60) : 'No limit'} min</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Feedback Mode:</span>
                <span>{getValues('delivery_mode')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Language:</span>
                <span>{getValues('language')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Creation Method:</span>
                <span className="capitalize">{method}</span>
              </div>
            </div>

            {generatedQuiz && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Quiz Generated Successfully</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {generatedQuiz.questions?.length || 0} questions ready
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={onCreate}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Quiz...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Quiz
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ReviewCreateStep;


