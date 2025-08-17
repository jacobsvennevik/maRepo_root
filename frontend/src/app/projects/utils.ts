import { ProjectApiResponse, ProjectV2, SchoolMeta, SelfStudyMeta } from './types';

/**
 * Type guard to check if a project is a school project
 */
export function isSchoolProject(project: unknown): project is ProjectV2 & { kind: "school" } {
  return project.kind === "school" && project.school_meta;
}

/**
 * Type guard to check if a project is a self-study project
 */
export function isSelfStudyProject(project: unknown): project is ProjectV2 & { kind: "self_study" } {
  return project.kind === "self_study" && project.self_study_meta;
}

/**
 * Map backend API response to frontend ProjectV2 format
 */
export function mapApiResponseToProjectV2(apiResponse: ProjectApiResponse): ProjectV2 {
  const baseProject = {
    id: apiResponse.id,
    description: apiResponse.name, // Use name as description for now
    lastUpdated: new Date(apiResponse.updated_at).toLocaleDateString(),
    type: 'biology' as const, // Default type, could be enhanced later
    progress: 0,
    collaborators: 0,
  };

  if (apiResponse.project_type === 'school') {
    const schoolMeta: SchoolMeta = {
      course_name: apiResponse.school_data?.course_name || apiResponse.course_name || '',
      course_code: apiResponse.school_data?.course_code || apiResponse.course_code || '',
      teacher_name: apiResponse.school_data?.teacher_name || apiResponse.teacher_name || '',
    };

    return {
      ...baseProject,
      kind: 'school',
      school_meta: schoolMeta,
    };
  } else {
    const selfStudyMeta: SelfStudyMeta = {
      goal_description: apiResponse.self_study_data?.goal_description || apiResponse.goal_description || '',
      study_frequency: apiResponse.self_study_data?.study_frequency || apiResponse.study_frequency || '',
    };

    return {
      ...baseProject,
      kind: 'self_study',
      self_study_meta: selfStudyMeta,
    };
  }
}

/**
 * Get display name for a project based on its type
 */
export function getProjectDisplayName(project: ProjectV2): string {
  if (isSchoolProject(project)) {
    return project.school_meta.course_name || project.description;
  }
  if (isSelfStudyProject(project)) {
    return project.self_study_meta.goal_description || project.description;
  }
  // This should never happen due to discriminated union, but TypeScript needs this
  return (project as Record<string, unknown>).description as string || 'Unknown Project';
}

/**
 * Check if STI mode is enabled via environment variable
 */
export function isStiModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_PROJECT_V2 === 'true';
} 