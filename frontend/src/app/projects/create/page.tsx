"use client";

import { useRouter } from "next/navigation";
import { PageLayout } from "./components/layout";
import { ProjectTypeCards } from "./components/project-type-cards";
import { NavigationService } from "@/services/NavigationService";
import { performComprehensiveCleanup } from "./utils/cleanup-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function CreateProject() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleProjectTypeSelect = async (type: "school" | "self-study") => {
    try {
      await NavigationService.navigateWithCleanup(
        router,
        type === "self-study" ? "/projects/create-self-study" : "/projects/create-school",
        performComprehensiveCleanup
      );
    } catch (error) {
      console.error("Navigation failed:", error);
      // Show user-friendly error message
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout
      title="Create New Project"
      subtitle="Choose the type of project you want to create."
    >
      <ProjectTypeCards onProjectTypeSelect={handleProjectTypeSelect} />
    </PageLayout>
  );
}
