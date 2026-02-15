import { BYTES_PER_PIXEL } from "../../../constants";
import type { Vec2 } from "../../../editor/types";
import type { SerializedProject } from "../../../serialization/project";
import type { HistoryDiffItem } from "./types";

export const getPortionOfBuffer = (
  buffer: Uint8Array<ArrayBuffer>,
  tl: Vec2,
  br: Vec2,
  gridSize: Vec2,
) => {
  const width = br.x - tl.x + 1;
  const height = br.y - tl.y + 1;
  const portion = new Uint8Array(width * height * BYTES_PER_PIXEL);

  for (let y = tl.y; y <= br.y; y++) {
    for (let x = tl.x; x <= br.x; x++) {
      const bufferIndex = (x + y * gridSize.x) * BYTES_PER_PIXEL;
      const portionIndex = (x - tl.x + (y - tl.y) * width) * BYTES_PER_PIXEL;

      portion.set(
        buffer.subarray(bufferIndex, bufferIndex + BYTES_PER_PIXEL),
        portionIndex,
      );
    }
  }

  return portion;
};

export const getBoundsOfPaintedPixels = (
  paintedPixels: Set<number>,
  gridSize: Vec2,
) => {
  const tl = { x: Infinity, y: Infinity };
  const br = { x: -Infinity, y: -Infinity };

  paintedPixels.forEach((pixel) => {
    const pixelIndex = pixel / BYTES_PER_PIXEL;
    const x = pixelIndex % gridSize.x;
    const y = Math.floor(pixelIndex / gridSize.x);

    if (x < tl.x) {
      tl.x = x;
    }
    if (y < tl.y) {
      tl.y = y;
    }
    if (x > br.x) {
      br.x = x;
    }
    if (y > br.y) {
      br.y = y;
    }
  });

  return { tl, br };
};

export const patchPortionOfBuffer = (
  buffer: Uint8Array<ArrayBuffer>,
  tl: Vec2,
  br: Vec2,
  portion: Uint8Array<ArrayBuffer>,
  gridSize: Vec2,
) => {
  const width = br.x - tl.x + 1;

  for (let y = tl.y; y <= br.y; y++) {
    for (let x = tl.x; x <= br.x; x++) {
      const bufferIndex = (x + y * gridSize.x) * BYTES_PER_PIXEL;
      const portionIndex = (x - tl.x + (y - tl.y) * width) * BYTES_PER_PIXEL;

      buffer.set(
        portion.subarray(portionIndex, portionIndex + BYTES_PER_PIXEL),
        bufferIndex,
      );
    }
  }
};

export const copyLayersBuffer = (
  buffers: Map<string, Uint8Array<ArrayBuffer>>,
): Map<string, Uint8Array<ArrayBuffer>> => {
  const copy = new Map<string, Uint8Array<ArrayBuffer>>();

  buffers.forEach((buffer, key) => {
    const copiedBuffer = new Uint8Array(buffer.length);
    copiedBuffer.set(buffer);
    copy.set(key, copiedBuffer);
  });

  return copy;
};

export const copyProject = (project: SerializedProject): SerializedProject => {
  return structuredClone(project);
};
