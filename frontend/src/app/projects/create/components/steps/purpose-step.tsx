import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";

export interface PurposeOption {
  value: string;
  label: string;
  description: string;
}

interface PurposeStepProps {
  purpose: string;
  customDescription?: string;
  onPurposeChange: (purpose: string) => void;
  onCustomDescriptionChange: (description: string) => void;
  purposeOptions: PurposeOption[];
  preSelectedPurpose?: string;
}

export function PurposeStep({ 
  purpose, 
  customDescription, 
  onPurposeChange, 
  onCustomDescriptionChange,
  purposeOptions,
  preSelectedPurpose
}: PurposeStepProps) {
  const handleCardClick = (value: string) => {
    onPurposeChange(value);
  };

  return (
    <div className="space-y-4">
      {preSelectedPurpose && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Pre-selected purpose:</strong> {preSelectedPurpose === 'school-course' ? 'School Course' : 'Self Study'}
          </p>
        </div>
      )}
      
      <RadioGroup value={purpose} onValueChange={onPurposeChange}>
        {purposeOptions.map((option) => (
          <div 
            key={option.value} 
            className={`flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
              preSelectedPurpose && option.value === preSelectedPurpose ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleCardClick(option.value)}
          >
            <RadioGroupItem 
              value={option.value} 
              id={option.value} 
              className="mt-1"
              disabled={preSelectedPurpose ? option.value !== preSelectedPurpose : false}
            />
            <div className="flex-1">
              <Label 
                htmlFor={option.value} 
                className={`text-sm sm:text-base font-medium cursor-pointer ${
                  preSelectedPurpose && option.value !== preSelectedPurpose ? 'text-gray-400' : ''
                }`}
              >
                {option.label}
              </Label>
              <p className={`text-xs sm:text-sm mt-1 ${
                preSelectedPurpose && option.value !== preSelectedPurpose ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {purpose === 'other' && (
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