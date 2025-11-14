import { createContext, useContext, type Accessor } from "solid-js";

import type { ProjectType } from "./types";
import { initialPixelPainter } from "./project";

export const projectInitialValue: ProjectType = {
  activeTool: () => 0,
  setActiveTool: () => {},
  createNewPainter: async () => initialPixelPainter,
};

export const ProjectContext = createContext<Accessor<ProjectType>>();

export function useProject() {
  const context = useContext(ProjectContext);

  return context;
}
