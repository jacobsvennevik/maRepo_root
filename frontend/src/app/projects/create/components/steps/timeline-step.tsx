import { SimpleRadioGroup, type SimpleRadioOption } from './shared';

interface TimelineStepProps {
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  timeframeOptions: SimpleRadioOption[];
}

export function TimelineStep({
  timeframe,
  onTimeframeChange,
  timeframeOptions
}: TimelineStepProps) {
  return (
    <SimpleRadioGroup
      value={timeframe}
      onValueChange={onTimeframeChange}
      options={timeframeOptions}
      name="timeline"
    />
  );
} 