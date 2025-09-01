import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";
import { CreateFlashcardSetWizard } from "@/components/diagnostic/CreateFlashcardSetWizard";

interface QuickActionsProps {
  projectId: string;
}

export function QuickActions({ projectId }: QuickActionsProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Study Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-8 relative z-10">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Quick Study</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Jump into studying your existing flashcard decks with smart review algorithms
              </p>
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold px-6 py-3 rounded-xl"
              >
                <Link href={`/projects/${projectId}/flashcards/study`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Studying
                </Link>
              </Button>
            </div>
          </CardContent>
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/10 rounded-full"></div>
        </Card>

        {/* Create Flashcard Deck Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-8 relative z-10">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Plus className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Create Flashcard Deck</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Build a new collection of flashcards with custom categories and smart organization
              </p>
              <Button
                onClick={() => setIsWizardOpen(true)}
                className="bg-white text-emerald-600 hover:bg-emerald-50 border-0 font-semibold px-6 py-3 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Deck
              </Button>
            </div>
          </CardContent>
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/10 rounded-full"></div>
        </Card>
      </div>

      {/* Flashcard Creation Wizard */}
      <CreateFlashcardSetWizard
        projectId={projectId}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
    </div>
  );
}
