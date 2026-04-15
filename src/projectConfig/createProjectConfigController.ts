import { createSignal } from "solid-js";
import {
  initializeEditor,
  type EditorType,
  type InitializeEditorOptions,
} from "../editor/editor";
import { editorInitialValue } from "../editor/editortContext";
import { DEFAULT_GRID_SIZE } from "../constants";
import { INITIAL_PIXEL_PAINTER } from "../editor/constant";
import type { LoadedProject } from "../serialization/project";
import type { ProjectType } from "../editor/types";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type {
  CreateProjectConfigControllerOptions,
  ProjectConfigController,
} from "./types";

export const createProjectConfigController = (
  options: CreateProjectConfigControllerOptions = {},
): ProjectConfigController => {
  const [projectName, setProjectName] = createSignal(
    options.initialProjectName ?? "new-project",
  );
  const [getProjectGridSize, setProjectGridSize] = createSignal(
    options.initialGridSize ?? DEFAULT_GRID_SIZE,
  );
  const [project, setProject] = createSignal<EditorType>(editorInitialValue);
  const [pixel, setPixel] = createSignal<PixelPainterMethods>(
    INITIAL_PIXEL_PAINTER,
  );

  const initializeEditorOptions: InitializeEditorOptions = {
    canvas: options.canvas,
    canvasId: options.canvasId,
  };

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
        options.onProjectOpened?.();

        setProjectName(name);
        setProjectGridSize(gridSize);
        options.storage?.setActiveProject({ name, gridSize });
        options.storage?.addProject({ name, gridSize });

        if (layers && buffers) {
          value.layer.load(layers, buffers);
        }
      });
  };

  const mount = async () => {
    const result = await initializeEditor(initializeEditorOptions);
    setProject(result);

    if (!options.autoLoadActiveProject || !options.storage) {
      return;
    }

    const activeProject = options.storage.getActiveProject();
    if (!activeProject) {
      return;
    }

    const parsedActiveProject: ProjectType = JSON.parse(activeProject);

    if (!parsedActiveProject.name || !parsedActiveProject.gridSize) {
      throw new Error(
        "Could not initialize project, data is corrupt, please open project manually",
      );
    }

    setProjectName(parsedActiveProject.name);
    createOrOpenProject(parsedActiveProject);
  };

  const getActiveProject = (): ProjectType | null => {
    const activeProjectJson = options.storage?.getActiveProject();
    if (!activeProjectJson) {
      return null;
    }
    return JSON.parse(activeProjectJson);
  };

  const getProjects = () => {
    const projects = options.storage?.getProjects();
    if (projects === undefined) {
      return [];
    }
    return projects;
  };

  return {
    pixel,
    projectName,
    setProjectName,
    setProjectGridSize,
    getProjectGridSize,
    createNewProject: createOrOpenProject,
    project,
    getActiveProject,
    getProjects,
    mount,
  };
};
