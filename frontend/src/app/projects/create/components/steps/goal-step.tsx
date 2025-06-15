import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";

interface GoalStepProps {
  goal: string;
  onGoalChange: (goal: string) => void;
}

export function GoalStep({ goal, onGoalChange }: GoalStepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe your main learning goal for this project..."
        value={goal}
        onChange={(e) => onGoalChange(e.target.value)}
        className="min-h-[100px] sm:min-h-[120px]"
      />
      <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <HelpCircle className="inline h-4 w-4 mr-1" />
        Be specific about what you want to achieve. This helps us create a more targeted learning plan.
      </div>
    </div>
  );
} 