import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type JSX,
  type Accessor,
} from "solid-js";

import { initializeProject } from "./project";
import type { ProjectType } from "./types";

const initialValue: ProjectType = {
  setBrushColor: () => {},
  getCurrentColor: () => "",
  activeTool: () => 0,
  setActiveTool: () => {},
};

export const ProjectContext = createContext<Accessor<ProjectType>>();

export type ProjectProviderProps = {
  children?: JSX.Element;
};
export const ProjectProvider = (props: ProjectProviderProps) => {
  const [project, setProject] = createSignal<ProjectType>(initialValue);

  onMount(() => {
    initializeProject().then((result) => {
      setProject(result);
    });
  });

  return (
    <ProjectContext.Provider value={project}>
      {props.children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);

  return context;
}
