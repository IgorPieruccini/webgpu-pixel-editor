import { createContext, onMount, useContext, type JSX } from "solid-js";
import { editorContext } from "../editor/editortContext";
import { useMenu } from "../ui/tools/menuProvider";
import { storageLocal } from "../storageLocal";
import { storageDB } from "../storageDB";
import { DEFAULT_GRID_SIZE } from "../constants";
import { INITIAL_PIXEL_PAINTER } from "../editor/constant";
import { createProjectConfigController } from "./createProjectConfigController";
import type { ProjectConfigContextType, ProjectConfigStorage } from "./types";

const notImplemented = () => {
  console.warn("not implemented");
};

const initialProjectConfig: ProjectConfigContextType = {
  pixel: () => INITIAL_PIXEL_PAINTER,
  projectName: () => "new-project",
  setProjectName: notImplemented,
  setProjectGridSize: notImplemented,
  getProjectGridSize: () => DEFAULT_GRID_SIZE,
  createNewProject: notImplemented,
  deleteProject: async () => undefined,
  getActiveProject: () => null,
  getProjects: () => [],
};

const ProjectConfigContext = createContext(initialProjectConfig);

type ProjectConfigProviderProps = {
  children?: JSX.Element;
  canvas?: HTMLCanvasElement;
  canvasId?: string;
  storage?: ProjectConfigStorage;
  autoLoadActiveProject?: boolean;
  onProjectOpened?: () => void;
};

export const ProjectConfigProvider = (props: ProjectConfigProviderProps) => {
  const menu = useMenu();
  const controller = createProjectConfigController({
    canvas: props.canvas,
    canvasId: props.canvasId,
    storage: props.storage ?? storageLocal,
    storageDB,
    autoLoadActiveProject: props.autoLoadActiveProject ?? true,
    onProjectOpened: () => {
      props.onProjectOpened?.();
      menu.openOption(-1);
    },
  });

  onMount(() => {
    void controller.mount();
  });

  return (
    <ProjectConfigContext.Provider
      value={{
        pixel: controller.pixel,
        projectName: controller.projectName,
        setProjectName: controller.setProjectName,
        setProjectGridSize: controller.setProjectGridSize,
        getProjectGridSize: controller.getProjectGridSize,
        createNewProject: controller.createNewProject,
        deleteProject: controller.deleteProject,
        getActiveProject: controller.getActiveProject,
        getProjects: controller.getProjects,
      }}
    >
      <editorContext.Provider value={controller.project}>
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
  const context = useContext(ProjectConfigContext);
  return () => context.pixel().export;
};

const getColorPalette = () => {
  const context = useContext(ProjectConfigContext);
  return () => context.pixel().colorPalette;
};

export const API = {
  layers: getLayers,
  brush: getBrush,
  export: getExport,
  colorPalette: getColorPalette,
};
