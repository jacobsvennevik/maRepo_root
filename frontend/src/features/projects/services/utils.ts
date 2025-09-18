import {
  ProjectApiResponse,
  ProjectV2,
  SchoolMeta,
  SelfStudyMeta,
  ProjectType,
} from "../types";

/**
 * Type guard to check if a project is a school project
 */
export function isSchoolProject(
  project: unknown,
): project is ProjectV2 & { kind: "school" } {
  return (
    typeof project === "object" &&
    project !== null &&
    "kind" in project &&
    "school_meta" in project &&
    (project as any).kind === "school" &&
    (project as any).school_meta
  );
}

/**
 * Type guard to check if a project is a self-study project
 */
export function isSelfStudyProject(
  project: unknown,
): project is ProjectV2 & { kind: "self_study" } {
  return (
    typeof project === "object" &&
    project !== null &&
    "kind" in project &&
    "self_study_meta" in project &&
    (project as any).kind === "self_study" &&
    (project as any).self_study_meta
  );
}

/**
 * Determine project type from course name or other metadata
 */
function determineProjectType(apiResponse: ProjectApiResponse): ProjectType {
  const courseName = ""; // course_name not available in ProjectApiResponse
  const projectName = apiResponse.title?.toLowerCase() || "";
  const goalDescription = apiResponse.description?.toLowerCase() || "";

  // Check for specific keywords in course names
  if (courseName.includes("math") || courseName.includes("mathematics") || courseName.includes("calculus")) {
    return "math";
  }
  if (courseName.includes("biology") || courseName.includes("bio")) {
    return "biology";
  }
  if (courseName.includes("chemistry") || courseName.includes("chem")) {
    return "chemistry";
  }
  if (courseName.includes("physics")) {
    return "physics";
  }
  if (courseName.includes("computer") || courseName.includes("programming") || courseName.includes("coding")) {
    return "computer-science";
  }
  if (courseName.includes("history") || courseName.includes("historical")) {
    return "history";
  }
  if (courseName.includes("geography") || courseName.includes("geo")) {
    return "geography";
  }
  if (courseName.includes("literature") || courseName.includes("english") || courseName.includes("writing")) {
    return "literature";
  }

  // Check project name as fallback
  if (projectName.includes("math") || projectName.includes("mathematics")) {
    return "math";
  }
  if (projectName.includes("biology") || projectName.includes("bio")) {
    return "biology";
  }
  if (projectName.includes("chemistry") || projectName.includes("chem")) {
    return "chemistry";
  }
  if (projectName.includes("physics")) {
    return "physics";
  }
  if (projectName.includes("computer") || projectName.includes("programming")) {
    return "computer-science";
  }
  if (projectName.includes("history")) {
    return "history";
  }
  if (projectName.includes("geography")) {
    return "geography";
  }
  if (projectName.includes("literature") || projectName.includes("english")) {
    return "literature";
  }

  // Check goal description for self-study projects
  if (goalDescription.includes("math") || goalDescription.includes("mathematics")) {
    return "math";
  }
  if (goalDescription.includes("biology") || goalDescription.includes("bio")) {
    return "biology";
  }
  if (goalDescription.includes("chemistry") || goalDescription.includes("chem")) {
    return "chemistry";
  }
  if (goalDescription.includes("physics")) {
    return "physics";
  }
  if (goalDescription.includes("computer") || goalDescription.includes("programming")) {
    return "computer-science";
  }
  if (goalDescription.includes("history")) {
    return "history";
  }
  if (goalDescription.includes("geography")) {
    return "geography";
  }
  if (goalDescription.includes("literature") || goalDescription.includes("english")) {
    return "literature";
  }

  // Default to biology if no specific type can be determined
  return "biology";
}

/**
 * Map backend API response to frontend ProjectV2 format
 */
export function mapApiResponseToProjectV2(
  apiResponse: ProjectApiResponse,
): ProjectV2 {
  const projectType = determineProjectType(apiResponse);
  
  const baseProject = {
    id: apiResponse.id,
    title: apiResponse.title, // Use title as title
    description: apiResponse.description || apiResponse.title, // Use description or title as fallback
    lastUpdated: new Date(apiResponse.updated_at).toLocaleDateString(),
    type: projectType,
    progress: 0,
    collaborators: 0,
  };

  if (apiResponse.type === "school") {
      const schoolMeta: SchoolMeta = {
        course_name: "", // school_data not available in ProjectApiResponse
        instructor: "", // school_data not available in ProjectApiResponse
      };

    return {
      ...baseProject,
      kind: "school",
      school_meta: schoolMeta,
    };
  } else {
    const selfStudyMeta: SelfStudyMeta = {
      goals: [], // self_study_data not available in ProjectApiResponse
      learning_style: "", // self_study_data not available in ProjectApiResponse
    };

    return {
      ...baseProject,
      kind: "self_study",
      self_study_meta: selfStudyMeta,
    };
  }
}

/**
 * Get display name for a project based on its type
 */
export function getProjectDisplayName(project: ProjectV2): string {
  if (isSchoolProject(project)) {
    return project.school_meta?.course_name || project.title || project.description;
  }
  if (isSelfStudyProject(project)) {
    return project.self_study_meta?.goals?.[0] || project.title || project.description;
  }
  // Fallback to title or description if type guards fail
  return project.title || project.description || "Unknown Project";
}
