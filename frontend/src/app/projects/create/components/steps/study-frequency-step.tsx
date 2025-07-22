import { SimpleRadioGroup, type SimpleRadioOption } from './shared';

interface StudyFrequencyStepProps {
  studyFrequency: string;
  onStudyFrequencyChange: (frequency: string) => void;
  frequencyOptions: SimpleRadioOption[];
}

export function StudyFrequencyStep({
  studyFrequency,
  onStudyFrequencyChange,
  frequencyOptions
}: StudyFrequencyStepProps) {
  return (
    <SimpleRadioGroup
      value={studyFrequency}
      onValueChange={onStudyFrequencyChange}
      options={frequencyOptions}
      name="frequency"
    />
  );
} 