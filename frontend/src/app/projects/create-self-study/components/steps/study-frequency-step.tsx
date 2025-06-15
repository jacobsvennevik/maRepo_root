import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FrequencyOption } from '../../types';

interface StudyFrequencyStepProps {
  studyFrequency: string;
  onStudyFrequencyChange: (frequency: string) => void;
  frequencyOptions: FrequencyOption[];
}

export function StudyFrequencyStep({
  studyFrequency,
  onStudyFrequencyChange,
  frequencyOptions
}: StudyFrequencyStepProps) {
  const handleCardClick = (value: string) => {
    onStudyFrequencyChange(value);
  };

  return (
    <RadioGroup value={studyFrequency} onValueChange={onStudyFrequencyChange}>
      {frequencyOptions.map((option) => (
        <div 
          key={option.value} 
          className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
          onClick={() => handleCardClick(option.value)}
        >
          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
          <div className="flex-1">
            <Label htmlFor={option.value} className="text-sm sm:text-base font-medium cursor-pointer">
              {option.label}
            </Label>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
} 