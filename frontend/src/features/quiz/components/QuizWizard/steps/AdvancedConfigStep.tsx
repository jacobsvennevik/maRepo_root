/**
 * AdvancedConfigStep
 */

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DELIVERY_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
  TEST_STYLE_OPTIONS,
} from '../../../constants';
import { getQuestionMixTotal } from '../../../utils';

interface AdvancedConfigStepProps {
  form: any;
}

export const AdvancedConfigStep: React.FC<AdvancedConfigStepProps> = ({ form }) => {
  const { register, watch, setValue } = form;

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Advanced Configuration</h2>
          <p className="text-sm text-slate-600">Fine-tune your quiz settings</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="delivery_mode">Feedback Mode</Label>
            <Select 
              value={watch('delivery_mode')} 
              onValueChange={(value) => setValue('delivery_mode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback mode" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_MODE_OPTIONS.map((option: any) => (
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
            <Label>Question Mix</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="MCQ" className="text-xs">Multiple Choice</Label>
                <Input 
                  id="MCQ" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...register('question_mix.MCQ', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="SHORT_ANSWER" className="text-xs">Short Answer</Label>
                <Input 
                  id="SHORT_ANSWER" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...register('question_mix.SHORT_ANSWER', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="PRINCIPLE" className="text-xs">Principle</Label>
                <Input 
                  id="PRINCIPLE" 
                  type="number" 
                  min={0} 
                  max={50}
                  {...register('question_mix.PRINCIPLE', { valueAsNumber: true })}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total: {getQuestionMixTotal(watch('question_mix'))} questions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={watch('language')} 
                onValueChange={(value) => setValue('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test_style">Test Style</Label>
              <Select 
                value={watch('test_style') || ''} 
                onValueChange={(value) => setValue('test_style', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test style" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_STYLE_OPTIONS.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Quiz Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allow_retakes" 
                  checked={watch('allow_retakes')}
                  onCheckedChange={(checked) => setValue('allow_retakes', checked)}
                />
                <Label htmlFor="allow_retakes" className="text-sm">Allow multiple attempts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show_hints" 
                  checked={watch('show_hints')}
                  onCheckedChange={(checked) => setValue('show_hints', checked)}
                />
                <Label htmlFor="show_hints" className="text-sm">Show hints during quiz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="randomize_questions" 
                  checked={watch('randomize_questions')}
                  onCheckedChange={(checked) => setValue('randomize_questions', checked)}
                />
                <Label htmlFor="randomize_questions" className="text-sm">Randomize question order</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="randomize_choices" 
                  checked={watch('randomize_choices')}
                  onCheckedChange={(checked) => setValue('randomize_choices', checked)}
                />
                <Label htmlFor="randomize_choices" className="text-sm">Randomize answer choices</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default AdvancedConfigStep;


