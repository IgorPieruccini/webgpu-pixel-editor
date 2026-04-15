import type { Accessor, Setter } from "solid-js";
import type { EditorType } from "../editor/editor";
import type { ProjectType, Vec2 } from "../editor/types";
import type { PixelPainterMethods } from "../pixelPainter/types";
import type { LoadedProject } from "../serialization/project";

export type ProjectConfigStorage = {
  getActiveProject: () => string | null;
  setActiveProject: (project: ProjectType) => void;
  addProject: (project: ProjectType) => void;
};

export type ProjectConfigContextType = {
  projectName: Accessor<string>;
  setProjectName: Setter<string>;
  setProjectGridSize: Setter<Vec2>;
  getProjectGridSize: Accessor<Vec2>;
  createNewProject: (project: ProjectType & Partial<LoadedProject>) => void;
  pixel: Accessor<PixelPainterMethods>;
  getActiveProject: () => ProjectType | null;
};

export type ProjectConfigController = ProjectConfigContextType & {
  project: Accessor<EditorType>;
  mount: () => Promise<void>;
};

export type CreateProjectConfigControllerOptions = {
  canvas?: HTMLCanvasElement;
  canvasId?: string;
  storage?: ProjectConfigStorage;
  onProjectOpened?: () => void;
  autoLoadActiveProject?: boolean;
  initialProjectName?: string;
  initialGridSize?: Vec2;
};
