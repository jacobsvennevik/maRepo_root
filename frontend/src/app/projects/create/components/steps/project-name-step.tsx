import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpText } from "./shared";

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
      <HelpText>
        Choose a descriptive name that will help you identify this project later.
      </HelpText>
    </div>
  );
} 