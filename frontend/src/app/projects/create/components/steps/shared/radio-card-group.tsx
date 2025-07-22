import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioCardGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: RadioCardOption[];
  name: string; // Used for generating unique IDs
  className?: string;
}

export function RadioCardGroup({ 
  value, 
  onValueChange, 
  options, 
  name,
  className = "grid grid-cols-1 md:grid-cols-2 gap-4"
}: RadioCardGroupProps) {
  return (
    <RadioGroup value={value} onValueChange={onValueChange} className={className}>
      {options.map((option) => (
        <Label key={option.value} htmlFor={`${name}-${option.value}`} className="cursor-pointer">
          <Card className={`transition-all ${value === option.value ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
            <CardContent className="p-4 flex items-center">
              <RadioGroupItem value={option.value} id={`${name}-${option.value}`} className="mr-4" />
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
  );
} 