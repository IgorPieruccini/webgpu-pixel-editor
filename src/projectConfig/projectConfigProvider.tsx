import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { initializeProject } from "../project/project";
import { ProjectContext, projectInitialValue } from "../project/projectContext";
import type { ProjectType } from "../project/types";
import { useMenu } from "../ui/tools/menuProvider";
import { OPENED_OPTIONS } from "../ui/tools/constants";

type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  createNewProject: (name: string) => void;
};

const initialValue: ProjectConfigContextType = {
  projectName: () => "new project",
  setProjectName: () => {
    console.warn("not implemented");
  },
  createNewProject: () => {
    console.warn("nt implemented");
  },
};

const ProjectConfigContext = createContext(initialValue);

type ProjectConfigProviderProps = {
  children?: JSX.Element;
};

export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
  const [projectName, setProjectName] = createSignal("new-project");
  const [project, setProject] = createSignal<ProjectType>(projectInitialValue);
  const menu = useMenu();

  const createNewProject = (name: string) => {
    initializeProject(name).then((result) => {
      setProject({ ...result });
    });
    menu.openOption(-1);
  };

  return (
    <ProjectConfigContext.Provider
      value={{ projectName, setProjectName, createNewProject }}
    >
      <ProjectContext.Provider value={project}>
        {props.children}
      </ProjectContext.Provider>
    </ProjectConfigContext.Provider>
  );
};

export const useProjectConfig = () => {
  const context = useContext(ProjectConfigContext);
  return context;
};
