import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { initializeEditor, type EditorType } from "../editor/editor";
import { editorContext, editorInitialValue } from "../editor/editortContext";
import { type ProjectType } from "../editor/types";
import { useMenu } from "../ui/tools/menuProvider";
import { INITIAL_PIXEL_PAINTER } from "../editor/constant";
import type { PixelPainterMethods } from "../pixelPainter/types";

type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  createNewProject: (project: ProjectType) => void;
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
  const [project, setProject] = createSignal<EditorType>(editorInitialValue);
  const [pixel, setPixel] = createSignal<PixelPainterMethods>(
    INITIAL_PIXEL_PAINTER,
  );

  const menu = useMenu();

  const createOrOpenProject = ({ name, gridSize }: ProjectType) => {
    project()
      .createNewPainter(name, gridSize)
      .then((value) => {
        setPixel(value);
        menu.openOption(-1);
        window.localStorage.setItem(
          "active_project",
          JSON.stringify({ name, gridSize }),
        );
        const projectsString = window.localStorage.getItem("projects");
        const projectsName: Array<string> = projectsString
          ? JSON.parse(projectsString)
          : null;

        if (!projectsName?.includes(name)) {
          window.localStorage.setItem(
            "projects",
            JSON.stringify([...(projectsName ?? []), { name, gridSize }]),
          );
        }
      });
  };

  onMount(() => {
    initializeEditor().then((result) => {
      setProject(result);
      const activeProject = window.localStorage.getItem("active_project");
      if (activeProject) {
        const parsedActiveProject: ProjectType = JSON.parse(activeProject);

        if (!parsedActiveProject.name || !parsedActiveProject.gridSize) {
          throw new Error(
            "Could not initialize project, data is corrupt, please open project manually",
          );
          // TODO: Show a toaster or a window to the user with the error message
        }

        setProjectName(parsedActiveProject.name);
        createOrOpenProject(parsedActiveProject);
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
      <editorContext.Provider value={project}>
        {props.children}
      </editorContext.Provider>
    </ProjectConfigContext.Provider>
  );
};

export const useProjectConfig = () => {
  const context = useContext(ProjectConfigContext);
  return context;
};

const getLayers = () => {
  const context = useContext(ProjectConfigContext);
  return () => context.pixel().layer;
};

const getBrush = () => {
  const context = useContext(ProjectConfigContext);
  return () => context.pixel().brush;
};

export const API = {
  layers: getLayers,
  brush: getBrush,
};
