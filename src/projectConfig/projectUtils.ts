import { FILE_FORMAT } from "../constants";
import { API, type Layer } from "../lib";
import { parseBlobToUint8Array } from "../pixelPainter/utils";
import { serialization } from "../serialization";
import { generateUUID } from "../utils";
import type { ProjectConfigContextType } from "./types";

export const saveProject = (projectContext: ProjectConfigContextType) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = FILE_FORMAT;

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const loadedProject = await serialization.project.loadProject(file);

    projectContext.createNewProject(loadedProject);
  };

  // Trigger the file dialog
  input.click();
};

export const createProjectFromImage = (
  projectContext: ProjectConfigContextType,
) => {
  // Create a file input element
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".png";

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const name = file.name;

    const { buffer, width, height } = await parseBlobToUint8Array(file);

    const id = generateUUID();

    const layer: Layer = {
      id,
      name: "imported Image",
      display: true,
      opacity: 1,
    };

    projectContext.createNewProject({
      name,
      gridSize: { x: width, y: height },
      layers: [layer],
      buffers: {
        [id]: buffer,
      },
    });
  };

  // Trigger the file dialog
  input.click();
};

export const loadProject = (projectContext: ProjectConfigContextType) => {
  const layerAPI = API.layers();

  const serializeProject = serialization.project.serialize(
    projectContext.projectName(),
    projectContext.getProjectGridSize(),
    layerAPI().getList(),
    layerAPI().buffers,
  );
  serialization.project.saveProject(serializeProject);
};
