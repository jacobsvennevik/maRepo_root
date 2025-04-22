import { LoginForm } from "../components/LoginForm"
import { EmeraldBackground } from "@/components/common/backgrounds/emerald-background"

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      {/* Emerald Background */}
      <EmeraldBackground />

      {/* Main Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-[900px]">
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 