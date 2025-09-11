import { useContext } from "react";
import { ProjectContext } from "../components/overview/project-context";

/** Safe version of useProject – returns null when no provider */
export function useOptionalProject() {
  return useContext(ProjectContext) ?? null;
}
