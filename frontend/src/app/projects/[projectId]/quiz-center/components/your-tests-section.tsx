import { Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestCard } from "./test-card";
import { TestListItem } from "./test-list-item";

interface Test {
  id: string;
  title: string;
  subject: string;
  type: string;
  questions: number;
  timeEstimate: number;
  lastScore?: number;
  status: "completed" | "upcoming" | "needs-review";
  icon: string;
}

interface YourTestsSectionProps {
  tests: Test[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onStartTest: (id: string) => void;
}

export function YourTestsSection({
  tests,
  viewMode,
  onViewModeChange,
  onStartTest,
}: YourTestsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Your Quizzes</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <TestListItem key={test.id} test={test} onStart={onStartTest} />
          ))}
        </div>
      )}
    </div>
  );
}
