import { LucideIcon } from "lucide-react";
import { Dna } from "lucide-react";
import { Atom } from "lucide-react";
import { Calculator } from "lucide-react";
import { BookOpen } from "lucide-react";
import { Code2 } from "lucide-react";
import { History } from "lucide-react";
import { Globe } from "lucide-react";
import { TestTubes } from "lucide-react";

export type ProjectType =
  | "biology"
  | "chemistry"
  | "physics"
  | "math"
  | "history"
  | "computer-science"
  | "geography"
  | "literature";

// Legacy project interface (current structure)
export interface Project {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  type: ProjectType;
  progress?: number;
  collaborators?: number;
}

// STI-specific interfaces
export interface SchoolMeta {
  course_name: string;
  course_code: string;
  teacher_name: string;
}

export interface SelfStudyMeta {
  goal_description: string;
  study_frequency: string;
}

// Backend API response interface
export interface ProjectApiResponse {
  id: string;
  name: string;
  project_type: "school" | "self_study";
  course_name?: string;
  course_code?: string;
  teacher_name?: string;
  goal_description?: string;
  study_frequency?: string;
  school_data?: SchoolMeta;
  self_study_data?: SelfStudyMeta;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// AI-generated metadata interface
export interface ProjectMeta {
  ai_generated_tags?: string[];
  content_summary?: string;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  ai_model_used?: string;
  ai_prompt_version?: string;
  [key: string]: any; // Allow for additional metadata fields
}

// Enhanced project interface with STI support
export type ProjectV2 =
  | ({ kind: "school"; school_meta: SchoolMeta; meta?: ProjectMeta } & Omit<
      Project,
      "title"
    >)
  | ({
      kind: "self_study";
      self_study_meta: SelfStudyMeta;
      meta?: ProjectMeta;
    } & Omit<Project, "title">);

export const projectIcons: Record<string, LucideIcon> = {
  biology: Dna,
  chemistry: TestTubes,
  physics: Atom,
  math: Calculator,
  literature: BookOpen,
  "computer-science": Code2,
  history: History,
  geography: Globe,
} as const;

export const projectColors: Record<string, string> = {
  biology: "bg-green-50 text-green-600",
  chemistry: "bg-blue-50 text-blue-600",
  physics: "bg-purple-50 text-purple-600",
  math: "bg-orange-50 text-orange-600",
  literature: "bg-red-50 text-red-600",
  "computer-science": "bg-indigo-50 text-indigo-600",
  history: "bg-amber-50 text-amber-600",
  geography: "bg-teal-50 text-teal-600",
} as const;
