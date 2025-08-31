import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Sparkles, FileText, Brain } from "lucide-react";
import { useProjectFlashcards } from "../hooks/use-project-flashcards";

interface QuickActionsProps {
  projectId: string;
}

export function QuickActions({ projectId }: QuickActionsProps) {
  const { generateFlashcards } = useProjectFlashcards(projectId);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFlashcards = async (sourceType: string) => {
    try {
      setIsGenerating(true);
      await generateFlashcards(sourceType, 10, "medium");
      // Success message could be shown here
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      // Error message could be shown here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Quick Actions
            </h3>
            <p className="text-sm text-slate-600">
              Generate new flashcards or start studying
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Link href={`/projects/${projectId}/flashcards/study`}>
                <Zap className="h-4 w-4 mr-2" />
                Quick Study
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Link href={`/projects/${projectId}/flashcards/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Set
              </Link>
            </Button>
          </div>
        </div>

        {/* Generation Options */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Generate from Project Materials
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleGenerateFlashcards("files")}
              disabled={isGenerating}
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <div className="font-medium text-sm">From Files</div>
                <div className="text-xs text-slate-500">Uploaded documents</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleGenerateFlashcards("extractions")}
              disabled={isGenerating}
            >
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div className="text-center">
                <div className="font-medium text-sm">From Extractions</div>
                <div className="text-xs text-slate-500">
                  Test questions & notes
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              asChild
            >
              <Link href={`/projects/${projectId}/flashcards/create/manual`}>
                <Brain className="h-5 w-5 text-emerald-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Manual Entry</div>
                  <div className="text-xs text-slate-500">Create your own</div>
                </div>
              </Link>
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Generating flashcards...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
