'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioCardGroup, type RadioCardOption } from './shared';

interface PurposeStepProps {
  value: string;
  onSelect: (value: string) => void;
  onCustomChange: (value: string) => void;
  options: RadioCardOption[];
  customValue: string;
}

export function PurposeStep({ value, onSelect, onCustomChange, options, customValue }: PurposeStepProps) {
  return (
    <div className="space-y-4">
      <RadioCardGroup
        value={value}
        onValueChange={onSelect}
        options={options}
        name="purpose"
      />
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