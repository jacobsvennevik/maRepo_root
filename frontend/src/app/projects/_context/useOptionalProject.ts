import { useContext } from "react";
import { ProjectContext } from "../[projectId]/_context/project-context";

/** Safe version of useProject – returns null when no provider */
export function useOptionalProject() {
  return useContext(ProjectContext) ?? null;
}
