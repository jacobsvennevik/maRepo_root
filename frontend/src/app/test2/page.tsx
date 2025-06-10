import { ProjectWizard } from "@/components/wizard/ProjectWizard"

// Minimal Typography-Focused Design
export default function Test2Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-3">Test 2: Minimal Typography Design</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A clean, distraction-free interface focusing on typography and content hierarchy.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <ProjectWizard variant="minimal" />
        </div>
      </div>
    </div>
  )
} 