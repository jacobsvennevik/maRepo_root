import { ProjectWizard } from "@/components/wizard/ProjectWizard"
import { NewProjectHeader } from "@/components/project/NewProjectHeader"
import { GradientBackground } from "@/components/ui/GradientBackground"

export default function NewProjectPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />

      <div className="container mx-auto py-12 relative">
        <div className="mb-8">
          <NewProjectHeader />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ProjectWizard variant="gradient" />
        </div>
      </div>
    </div>
  )
} 