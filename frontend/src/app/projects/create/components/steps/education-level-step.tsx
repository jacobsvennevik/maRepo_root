import { RadioCardGroup, type RadioCardOption } from './shared';

interface EducationLevelStepProps {
  value: string;
  onSelect: (value: string) => void;
  options: RadioCardOption[];
}

export function EducationLevelStep({ value, onSelect, options }: EducationLevelStepProps) {
  return (
    <div className="space-y-4">
      <RadioCardGroup
        value={value}
        onValueChange={onSelect}
        options={options}
        name="level"
      />
    </div>
  );
} 