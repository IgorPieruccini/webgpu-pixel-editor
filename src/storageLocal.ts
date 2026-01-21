import type { Layers } from "./pixelPainter/types";
import { generateUUID } from "./utils";

const getLayers = (projectName: string) => {
  return window.localStorage.getItem(`${projectName}-layers`);
};

const saveLayers = (projectName: string, layers: string | Layers) => {
  if (typeof layers !== "string") {
    layers = JSON.stringify(layers);
  }
  window.localStorage.setItem(`${projectName}-layers`, layers);
};

const createLayers = (projectName: string): Layers => {
  let stringLayers = getLayers(projectName);
  if (!stringLayers) {
    const layer: Layers = [
      { id: generateUUID(), name: "Layer", display: true, opacity: 1 },
    ];
    stringLayers = JSON.stringify(layer);
    saveLayers(projectName, stringLayers);
  }

  return JSON.parse(stringLayers);
};

export const storageLocal = {
  getLayers,
  saveLayers,
  createLayers,
};
