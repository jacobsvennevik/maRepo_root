import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number; // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
        <span className="text-xs sm:text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-gray-200"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Getting Started</span>
        <span>Almost Done</span>
      </div>
    </div>
  );
} 