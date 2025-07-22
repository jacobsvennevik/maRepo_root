import { SimpleRadioGroup, type SimpleRadioOption } from './shared';

interface CollaborationStepProps {
  collaboration: string;
  onCollaborationChange: (collaboration: string) => void;
  collaborationOptions: SimpleRadioOption[];
}

export function CollaborationStep({
  collaboration,
  onCollaborationChange,
  collaborationOptions
}: CollaborationStepProps) {
  return (
    <SimpleRadioGroup
      value={collaboration}
      onValueChange={onCollaborationChange}
      options={collaborationOptions}
      name="collaboration"
    />
  );
} 