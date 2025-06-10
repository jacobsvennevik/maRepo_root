import { ProjectWizard } from "@/components/wizard/ProjectWizard"

// Gradient-Rich Interactive Design
export default function Test3Page() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto py-12 relative">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 mb-4">
            Test 3: Gradient-Rich Design
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A modern, engaging interface with beautiful gradients and interactive elements.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ProjectWizard variant="gradient" />
        </div>
      </div>
    </div>
  )
} 