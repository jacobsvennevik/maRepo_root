/**
 * MethodSelectionStep
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  FileText, 
  ListChecks,
  Sparkles,
} from 'lucide-react';

interface MethodSelectionStepProps {
  onMethodSelect: (method: 'auto' | 'files' | 'manual') => void;
  isTestMode?: boolean;
}

export const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({
  onMethodSelect,
  isTestMode = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">How would you like to create your quiz?</h2>
        <p className="text-sm text-slate-600">Choose a method that works best for your content</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-200" 
          onClick={() => onMethodSelect('auto')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">AI Auto-Generate</h3>
                <p className="text-sm text-slate-600">Let AI create a quiz from your project content automatically</p>
                <Badge variant="secondary" className="mt-1">Recommended</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-200" 
          onClick={() => onMethodSelect('files')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">From Files</h3>
                <p className="text-sm text-slate-600">Generate quiz based on specific uploaded documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-emerald-200" 
          onClick={() => onMethodSelect('manual')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <ListChecks className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Manual Setup</h3>
                <p className="text-sm text-slate-600">Define questions and settings yourself</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isTestMode && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            🧪 Test mode is active - AI calls will be mocked with predefined responses
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MethodSelectionStep;


