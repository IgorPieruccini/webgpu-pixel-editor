import { createSignal } from "solid-js";
import {
  initializeEditor,
  type EditorType,
  type InitializeEditorOptions,
} from "../editor/editor";
import { DEFAULT_GRID_SIZE } from "../constants";
import { INITIAL_PIXEL_PAINTER } from "../pixelPainter/constants";
import type { LoadedProject } from "../serialization/project";
import type { ProjectType } from "../editor/types";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type {
  CreateProjectConfigControllerOptions,
  ProjectConfigController,
} from "./types";
import { INITIAL_EDITOR } from "../editor/constant";

export const createProjectConfigController = (
  options: CreateProjectConfigControllerOptions = {},
): ProjectConfigController => {
  const parseActiveProject = (activeProjectJson: string | null) => {
    if (!activeProjectJson) {
      return null;
    }

    return JSON.parse(activeProjectJson) as ProjectType;
  };

  const [projectName, setProjectName] = createSignal(
    options.initialProjectName ?? "new-project",
  );
  const [getProjectGridSize, setProjectGridSize] = createSignal(
    options.initialGridSize ?? DEFAULT_GRID_SIZE,
  );
  const [activeProject, setActiveProject] = createSignal<ProjectType | null>(
    parseActiveProject(options.storage?.getActiveProject() ?? null),
  );
  const [projects, setProjects] = createSignal<ProjectType[]>(
    options.storage?.getProjects() ?? [],
  );
  const [project, setProject] = createSignal<EditorType>(INITIAL_EDITOR);
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
        setActiveProject({ name, gridSize });
        setProjects(options.storage?.getProjects() ?? []);

        if (layers && buffers) {
          value.layer.load(layers, buffers);
        }
      });
  };

  const deleteProject = async (projectName: string) => {
    options.storage?.deleteProject(projectName);
    const nextProjects = options.storage?.getProjects() ?? [];
    const storedActiveProject = parseActiveProject(
      options.storage?.getActiveProject() ?? null,
    );
    const nextProject = storedActiveProject ?? nextProjects[0] ?? null;

    setProjects(nextProjects);
    setActiveProject(nextProject);

    if (nextProject) {
      createOrOpenProject(nextProject);
    } else {
      setProjectName(options.initialProjectName ?? "new-project");
      setProjectGridSize(options.initialGridSize ?? DEFAULT_GRID_SIZE);
    }

    await options.storageDB?.delete(projectName);
  };

  const mount = async () => {
    const result = await initializeEditor(initializeEditorOptions);
    setProject(result);
    setActiveProject(
      parseActiveProject(options.storage?.getActiveProject() ?? null),
    );
    setProjects(options.storage?.getProjects() ?? []);

    if (!options.autoLoadActiveProject || !options.storage) {
      return;
    }

    const storedActiveProject = options.storage.getActiveProject();
    if (!storedActiveProject) {
      return;
    }

    const parsedActiveProject: ProjectType = JSON.parse(storedActiveProject);

    if (!parsedActiveProject.name || !parsedActiveProject.gridSize) {
      throw new Error(
        "Could not initialize project, data is corrupt, please open project manually",
      );
    }

    setProjectName(parsedActiveProject.name);
    createOrOpenProject(parsedActiveProject);
  };

  const getActiveProject = (): ProjectType | null => {
    return activeProject();
  };

  const getProjects = () => {
    return projects();
  };

  return {
    pixel,
    projectName,
    setProjectName,
    setProjectGridSize,
    getProjectGridSize,
    createNewProject: createOrOpenProject,
    deleteProject,
    project,
    getActiveProject,
    getProjects,
    mount,
  };
};
