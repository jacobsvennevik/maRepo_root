import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";

interface ProjectNameStepProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function ProjectNameStep({ projectName, onProjectNameChange }: ProjectNameStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectName" className="text-sm sm:text-base font-medium">
          Project Name *
        </Label>
        <Input
          id="projectName"
          placeholder="Enter your project name..."
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="text-base"
          autoComplete="off"
        />
      </div>
      <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <HelpCircle className="inline h-4 w-4 mr-1" />
        Choose a descriptive name that will help you identify this project later.
      </div>
    </div>
  );
} 