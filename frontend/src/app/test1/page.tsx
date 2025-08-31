import { ProjectWizard } from "@/components/wizard/ProjectWizard";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// Modern Card-Based Design
export default function Test1Page() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Test 1: Modern Card-Based Design
        </h1>
        <p className="text-gray-600">
          Clean, card-based layout with clear visual hierarchy and subtle
          animations.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <ProjectWizard variant="modern" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
