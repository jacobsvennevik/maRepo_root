import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { EducationLevelOption } from '../../types';

interface EducationLevelStepProps {
  value: string;
  onSelect: (value: string) => void;
  options: EducationLevelOption[];
}

export function EducationLevelStep({ value, onSelect, options }: EducationLevelStepProps) {
  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onSelect} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(option => (
          <Label key={option.value} htmlFor={`level-${option.value}`} className="cursor-pointer">
            <Card className={`transition-all ${value === option.value ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
              <CardContent className="p-4 flex items-center">
                <RadioGroupItem value={option.value} id={`level-${option.value}`} className="mr-4" />
                <div className="flex flex-col">
                  <span className="font-semibold">{option.label}</span>
                  {option.description && (
                    <span className="text-sm text-gray-500">{option.description}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
} 