import type { Accessor, Setter } from "solid-js";
import type { EditorType } from "../editor/editor";
import type { ProjectType } from "../editor/types";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type { Vec2 } from "../pixelPainter/types";
import type { LoadedProject } from "../serialization/project";

export type ProjectConfigStorage = {
  getActiveProject: () => string | null;
  setActiveProject: (project: ProjectType) => void;
  getProjects: () => ProjectType[];
  addProject: (project: ProjectType) => void;
  deleteProject: (projectName: string) => void;
};

export type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  setProjectGridSize: Setter<Vec2>;
  getProjectGridSize: Accessor<Vec2>;
  createNewProject: (project: ProjectType & Partial<LoadedProject>) => void;
  deleteProject: (projectName: string) => Promise<void>;
  pixel: Accessor<PixelPainterMethods>;
  getActiveProject: () => ProjectType | null;
  getProjects: () => ProjectType[];
};

export type ProjectConfigController = ProjectConfigContextType & {
  project: Accessor<EditorType>;
  mount: () => Promise<void>;
};

export type CreateProjectConfigControllerOptions = {
  canvas?: HTMLCanvasElement;
  canvasId?: string;
  storage?: ProjectConfigStorage;
  storageDB?: {
    delete: (projectName: string) => Promise<void>;
  };
  onProjectOpened?: () => void;
  autoLoadActiveProject?: boolean;
  initialProjectName?: string;
  initialGridSize?: Vec2;
};
