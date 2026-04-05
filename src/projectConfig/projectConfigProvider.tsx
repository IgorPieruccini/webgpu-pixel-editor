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
import { type ProjectType, type Vec2 } from "../editor/types";
import { useMenu } from "../ui/tools/menuProvider";
import { INITIAL_PIXEL_PAINTER } from "../editor/constant";
import type { PixelPainterMethods } from "../pixelPainter/types";
import { DEFAULT_GRID_SIZE } from "../constants";
import type { LoadedProject } from "../serialization/project";
import { storageLocal } from "../storageLocal";

type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  setProjectGridSize: Setter<Vec2>;
  getProjectGridSize: Accessor<Vec2>;
  createNewProject: (project: LoadedProject) => void;
  pixel: Accessor<PixelPainterMethods>;
};

const initialProjectConfig: ProjectConfigContextType = {
  pixel: () => INITIAL_PIXEL_PAINTER,
  projectName: () => "new project",
  setProjectName: () => {
    console.warn("not implemented");
  },
  setProjectGridSize: () => {
    console.warn("not implemented");
  },
  getProjectGridSize: () => {
    return DEFAULT_GRID_SIZE;
  },
  createNewProject: () => {
    console.warn("not implemented");
  },
};

const ProjectConfigContext = createContext(initialProjectConfig);

type ProjectConfigProviderProps = {
  children?: JSX.Element;
};

export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
  const [projectName, setProjectName] = createSignal("new-project");
  const [getProjectGridSize, setProjectGridSize] =
    createSignal(DEFAULT_GRID_SIZE);
  const [project, setProject] = createSignal<EditorType>(editorInitialValue);
  const [pixel, setPixel] = createSignal<PixelPainterMethods>(
    INITIAL_PIXEL_PAINTER,
  );

  const menu = useMenu();

  const createOrOpenProject = ({
    name,
    gridSize,
    layers,
    buffers,
  }: ProjectType & Partial<LoadedProject>): void => {
    project()
      .createNewPainter(name, gridSize)
      .then((value) => {
        setPixel(value);
        menu.openOption(-1);

        setProjectName(name);
        setProjectGridSize(gridSize);
        storageLocal.setActiveProject({ name, gridSize });
        storageLocal.addProject({ name, gridSize });

        if (layers && buffers) {
          value.layer.load(layers, buffers);
        }
      });
  };

  onMount(() => {
    initializeEditor().then((result) => {
      setProject(result);
      const activeProject = storageLocal.getActiveProject();
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
        setProjectGridSize,
        getProjectGridSize,
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

export const useProject = () => {
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

const getExport = () => {
  const context = useContext((ProjectConfigContext));
  return () => context.pixel().export
}

export const API = {
  layers: getLayers,
  brush: getBrush,
  export: getExport
};
