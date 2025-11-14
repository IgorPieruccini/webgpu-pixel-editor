import { createContext, useContext, type Accessor } from "solid-js";

import type { ProjectType } from "./types";
import { INITIAL_PIXEL_PAINTER } from "./constant";

export const projectInitialValue: ProjectType = {
  activeTool: () => 0,
  setActiveTool: () => {},
  createNewPainter: async () => INITIAL_PIXEL_PAINTER,
};

export const ProjectContext = createContext<Accessor<ProjectType>>();

export function useProject() {
  const context = useContext(ProjectContext);

  return context;
}
