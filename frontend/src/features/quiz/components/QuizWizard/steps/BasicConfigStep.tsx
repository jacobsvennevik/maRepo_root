/**
 * BasicConfigStep
 */

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DIFFICULTY_OPTIONS,
  QUIZ_TYPE_OPTIONS,
} from '../../../constants';
import { 
  getSuggestedTimeLimit,
} from '../../../utils';

interface BasicConfigStepProps {
  form: any;
  suggestedDifficulty?: string;
}

export const BasicConfigStep: React.FC<BasicConfigStepProps> = ({
  form,
  suggestedDifficulty,
}) => {
  const { register, watch, setValue, formState } = form;

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Basic Quiz Settings</h2>
          <p className="text-sm text-slate-600">Configure the basic parameters for your quiz</p>
        </div>

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
    </FormProvider>
  );
};

export default BasicConfigStep;


