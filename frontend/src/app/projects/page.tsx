"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectCard } from "./components/project-card";
import {
  CreateProjectCard,
  ProjectPlaceholderCard,
} from "./components/add-project-card";
import { fetchProjects } from "./api";
import { useEffect, useState } from "react";
import { ProjectType, ProjectV2 } from "./types";
import { WhiteBackground } from "@/components/common/backgrounds/white-background";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const projectTypes: ProjectType[] = [
  "biology",
  "chemistry",
  "physics",
  "math",
  "computer-science",
  "literature",
  "history",
  "geography",
];

export default function Projects() {
  const [selectedType, setSelectedType] = useState<ProjectType | "all">("all");
  const [projects, setProjects] = useState<ProjectV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const filteredProjects =
    selectedType === "all"
      ? projects || []
      : (projects || []).filter(
          (project) => project.type === selectedType,
        );

  // Calculate cards needed for exactly 2 rows
  const getPlaceholderCount = () => {
    // Determine cards per row based on screen size
    let cardsPerRow = 3; // Default for medium screens
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1536)
        cardsPerRow = 5; // 2xl
      else if (window.innerWidth >= 1280)
        cardsPerRow = 4; // xl
      else if (window.innerWidth >= 1024)
        cardsPerRow = 3; // lg
      else if (window.innerWidth >= 768)
        cardsPerRow = 2; // md
      else cardsPerRow = 1; // mobile
    }

    const totalCardsNeeded = cardsPerRow * 2; // Exactly 2 rows
    return Math.max(0, totalCardsNeeded - filteredProjects.length - 1);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err: any) {
        console.error("Failed to load projects:", err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [isAuthenticated]);

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
    <div className="flex flex-col h-screen relative">
      <WhiteBackground />
      <DashboardHeader />
      <main className="flex-1 p-8 flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          </div>
          {/* Project Type Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors
                ${
                  selectedType === "all"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800"
                }`}
            >
              All
            </button>
            {projectTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors
                  ${
                    selectedType === type
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800"
                  }`}
              >
                {type
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-[1400px] mx-auto w-full">
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">
                Loading projects...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 text-lg">
                {error}
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 h-full"
                style={{ gridTemplateRows: "repeat(2, 1fr)" }}
              >
                <CreateProjectCard />
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {Array.from({ length: getPlaceholderCount() }).map(
                  (_, index) => (
                    <ProjectPlaceholderCard key={`placeholder-${index}`} />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
