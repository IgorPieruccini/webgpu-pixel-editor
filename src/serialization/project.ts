import { serialization } from ".";
import type { Vec2 } from "../editor/types";
import type { Layers } from "../pixelPainter/types";
import { API } from "../projectConfig/projectConfigProvider";

export type SerializedProject = {
  name: string;
  gridSize: Vec2;
  layers: Layers;
  buffers: Record<string, number[]>;
};

export const getSerializedBuffers = (
  buffers: Map<string, Uint8Array<ArrayBuffer>>,
  gridSize: Vec2,
): Record<string, number[]> => {
  let serialized: Record<string, number[]> = {};

  for (const [key, buffer] of buffers) {
    const serializedBuffer = serialization.layer.serialize(buffer, gridSize);
    serialized[key] = serializedBuffer;
  }

  return serialized;
};

export const serialize = (
  name: string,
  gridSize: Vec2,
  layers: Layers,
  buffers: Map<string, Uint8Array<ArrayBuffer>>,
): SerializedProject => {
  const serializedBuffers = getSerializedBuffers(buffers, gridSize);

  // We need to make a deep copy of the buffers and layers to avoid issues with mutable data when applying the project
  const copyBuffers: Record<string, number[]> = JSON.parse(
    JSON.stringify(serializedBuffers),
  );
  // Make sure to return a new object and not a reference to the original layers,
  // to avoid issues with mutable data when applying the project
  const copyLayer = JSON.parse(JSON.stringify(layers));

  const project = {
    name,
    gridSize,
    layers: copyLayer,
    buffers: copyBuffers,
  };

  return project;
};

export const project = {
  serialize,
};
