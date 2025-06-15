'use client';

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PurposeOption } from '../../types';

interface PurposeStepProps {
  value: string;
  onSelect: (value: string) => void;
  onCustomChange: (value: string) => void;
  options: PurposeOption[];
  customValue: string;
}

export function PurposeStep({ value, onSelect, onCustomChange, options, customValue }: PurposeStepProps) {
  return (
    <div className="space-y-4">
      <RadioGroup value={value} onValueChange={onSelect} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <Label key={option.value} htmlFor={`purpose-${option.value}`} className="cursor-pointer">
            <Card className={`transition-all ${value === option.value ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
              <CardContent className="p-4 flex items-center">
                <RadioGroupItem value={option.value} id={`purpose-${option.value}`} className="mr-4" />
                <div className="flex flex-col">
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-sm text-gray-500">{option.description}</span>
                </div>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
      {value === 'custom' && (
        <div className="pt-4">
          <Label htmlFor="custom-purpose" className="font-semibold">
            Please describe your purpose
          </Label>
          <Input
            id="custom-purpose"
            placeholder="e.g., Preparing for a specific certification"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
} 