import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";
import { PurposeOption } from '../../types';

interface PurposeStepProps {
  purpose: string;
  customDescription?: string;
  onPurposeChange: (purpose: string) => void;
  onCustomDescriptionChange: (description: string) => void;
  purposeOptions: PurposeOption[];
}

export function PurposeStep({ 
  purpose, 
  customDescription, 
  onPurposeChange, 
  onCustomDescriptionChange,
  purposeOptions 
}: PurposeStepProps) {
  const handleCardClick = (value: string) => {
    onPurposeChange(value);
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={purpose} onValueChange={onPurposeChange}>
        {purposeOptions.map((option) => (
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
      
      {purpose === 'custom' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <Label htmlFor="customDescription" className="text-sm sm:text-base font-medium mb-2 block">
            Describe your purpose
          </Label>
          <Textarea
            id="customDescription"
            placeholder="Tell us about your specific learning purpose..."
            value={customDescription || ''}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px]"
          />
        </div>
      )}
    </div>
  );
} 