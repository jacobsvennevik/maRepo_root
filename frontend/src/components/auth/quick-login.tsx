"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/(auth)/services/auth";
import { Button } from "@/components/ui/button";

export function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.login({
        email: "test@example.com",
        password: "testpass123",
      });

      setSuccess(true);
      
      // Redirect after a short delay to show success state
      setTimeout(() => {
        router.push("/projects");
      }, 1000);
    } catch (error: any) {
      console.error("Quick login failed:", error);
      setError(error.message || "Login failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={handleQuickLogin}
        disabled={isLoading}
        className={`${
          success 
            ? "bg-green-600 hover:bg-green-700" 
            : "bg-emerald-600 hover:bg-emerald-700"
        } text-white`}
      >
        {isLoading ? "Logging in..." : success ? "✓ Logged in!" : "Quick Login (Dev)"}
      </Button>
      {error && (
        <div className="mt-2 text-red-500 text-sm bg-white p-2 rounded shadow max-w-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-2 text-green-600 text-sm bg-white p-2 rounded shadow">
          Redirecting to projects...
        </div>
      )}
    </div>
  );
} 