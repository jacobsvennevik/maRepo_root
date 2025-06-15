import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CollaborationOption } from '../../types';

interface CollaborationStepProps {
  collaboration: string;
  collaborators?: string;
  onCollaborationChange: (collaboration: string) => void;
  onCollaboratorsChange: (collaborators: string) => void;
  collaborationOptions: CollaborationOption[];
}

export function CollaborationStep({
  collaboration,
  collaborators,
  onCollaborationChange,
  onCollaboratorsChange,
  collaborationOptions
}: CollaborationStepProps) {
  const handleCardClick = (value: string) => {
    onCollaborationChange(value);
  };

  const showCollaboratorsField = collaboration === 'small-group' || 
                                 collaboration === 'large-group' || 
                                 collaboration === 'mentor';

  return (
    <div className="space-y-6">
      <RadioGroup value={collaboration} onValueChange={onCollaborationChange}>
        {collaborationOptions.map((option) => (
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

      {showCollaboratorsField && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <Label htmlFor="collaborators" className="text-sm sm:text-base font-medium">
            {collaboration === 'mentor' ? 'Mentor Name' : 'Collaborator Names'}
          </Label>
          <Input
            id="collaborators"
            placeholder={collaboration === 'mentor' 
              ? "Enter your mentor's name..." 
              : "Enter collaborator names (comma-separated)..."}
            value={collaborators || ''}
            onChange={(e) => onCollaboratorsChange(e.target.value)}
            className="text-base"
          />
          <p className="text-xs text-gray-600">
            {collaboration === 'mentor' 
              ? "This helps us personalize your learning experience."
              : "You can add or remove collaborators later."}
          </p>
        </div>
      )}
    </div>
  );
} 