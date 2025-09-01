// LEGACY COMPONENT - DO NOT IMPORT
// This component has been deprecated and moved to legacy
// Use the new simplified wizard flow instead
export default function LegacyStepGuard() {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Legacy step imported by mistake. Use the new simplified wizard flow instead.");
  }
  return null;
}

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpText } from "./shared";

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
      <HelpText>
        Be specific about what you want to achieve. This helps us create a more
        targeted learning plan.
      </HelpText>
    </div>
  );
}
