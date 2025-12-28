import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { initializeEditor } from "../editor/editor";
import { ProjectContext, editorInitialValue } from "../editor/editortContext";
import { type EditorContextType } from "../editor/types";
import { useMenu } from "../ui/tools/menuProvider";
import { INITIAL_PIXEL_PAINTER } from "../editor/constant";
import type { PixelPainterMethods } from "../pixelPainter/types";

type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  createNewProject: (name: string) => void;
  pixel: Accessor<PixelPainterMethods>;
};

const initialProjectConfig: ProjectConfigContextType = {
  pixel: () => INITIAL_PIXEL_PAINTER,
  projectName: () => "new project",
  setProjectName: () => {
    console.warn("not implemented");
  },
  createNewProject: () => {
    console.warn("nt implemented");
  },
};

const ProjectConfigContext = createContext(initialProjectConfig);

type ProjectConfigProviderProps = {
  children?: JSX.Element;
};

export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
  const [projectName, setProjectName] = createSignal("new-project");
  const [project, setProject] =
    createSignal<EditorContextType>(editorInitialValue);
  const [pixel, setPixel] = createSignal<PixelPainterMethods>(
    INITIAL_PIXEL_PAINTER,
  );

  const menu = useMenu();

  const createOrOpenProject = (name: string) => {
    project()
      .createNewPainter(name)
      .then((value) => {
        setPixel(value);
        menu.openOption(-1);
        window.localStorage.setItem("active_project", name);
        const projectsString = window.localStorage.getItem("projects");
        const projectsName: Array<string> = projectsString
          ? JSON.parse(projectsString)
          : null;

        if (!projectsName?.includes(name)) {
          window.localStorage.setItem(
            "projects",
            JSON.stringify([...(projectsName ?? []), name]),
          );
        }
      });
  };

  onMount(() => {
    initializeEditor().then((result) => {
      setProject(result);
      const activeProjectName = window.localStorage.getItem("active_project");
      if (activeProjectName) {
        setProjectName(activeProjectName);
        createOrOpenProject(activeProjectName);
      }
    });
  });

  return (
    <ProjectConfigContext.Provider
      value={{
        pixel,
        projectName,
        setProjectName,
        createNewProject: createOrOpenProject,
      }}
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
