// LEGACY COMPONENT - DO NOT IMPORT
// This component has been deprecated and moved to legacy
// Use the new simplified wizard flow instead
export default function LegacyStepGuard() {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Legacy step imported by mistake. Use the new simplified wizard flow instead.");
  }
  return null;
}

import { SimpleRadioGroup, type SimpleRadioOption } from "./shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface CollaborationStepProps {
  collaboration: string;
  onCollaborationChange: (collaboration: string) => void;
  collaborationOptions: SimpleRadioOption[];
}

export function CollaborationStep({
  collaboration,
  onCollaborationChange,
  collaborationOptions,
}: CollaborationStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Style
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose how you prefer to study and collaborate with others
          </p>
        </CardHeader>
        <CardContent>
          <SimpleRadioGroup
            value={collaboration}
            onValueChange={onCollaborationChange}
            options={collaborationOptions}
            name="collaboration"
          />
        </CardContent>
      </Card>
    </div>
  );
}
