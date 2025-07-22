import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface SimpleRadioOption {
  value: string;
  label: string;
  description: string;
}

interface SimpleRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleRadioOption[];
  name: string; // Used for generating unique IDs
}

export function SimpleRadioGroup({ 
  value, 
  onValueChange, 
  options, 
  name
}: SimpleRadioGroupProps) {
  const handleCardClick = (optionValue: string) => {
    onValueChange(optionValue);
  };

  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      {options.map((option) => (
        <div 
          key={option.value} 
          className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
          onClick={() => handleCardClick(option.value)}
        >
          <RadioGroupItem value={option.value} id={`${name}-${option.value}`} className="mt-1" />
          <div className="flex-1">
            <Label htmlFor={`${name}-${option.value}`} className="text-sm sm:text-base font-medium cursor-pointer">
              {option.label}
            </Label>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
} 