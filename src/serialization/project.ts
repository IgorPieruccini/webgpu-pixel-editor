import { serialization } from ".";
import type { Vec2 } from "../editor/types";
import type { Layers } from "../pixelPainter/types";

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

  const project = {
    name,
    gridSize,
    layers,
    buffers: serializedBuffers,
  };

  return project;
};

export const project = {
  serialize,
};
