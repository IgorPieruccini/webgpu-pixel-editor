import { createContext, useContext, type Accessor } from "solid-js";

import type { ProjectType } from "./types";

export const projectInitialValue: ProjectType = {
  setBrushColor: () => {},
  getCurrentColor: () => "",
  activeTool: () => 0,
  setActiveTool: () => {},
};

export const ProjectContext = createContext<Accessor<ProjectType>>();

export function useProject() {
  const context = useContext(ProjectContext);

  return context;
}
