import { BYTES_PER_PIXEL } from "../../constants";
import type { Vec2 } from "../../editor/types";
import { serialization } from "../../serialization";
import { type SerializedProject } from "../../serialization/project";
import type { LayerHandler } from "./layerHandler";
import * as jsondiffpatch from "jsondiffpatch";
import { storageLocal } from "../../storageLocal";

const SNAPSHOT_INTERVAL = 5;

export type HistoryChangeHandler = ReturnType<
  typeof createHistoryChangeHandler
>;

type LayerDiff = {
  id: string;
  binary: Uint8Array<ArrayBuffer>;
  bounds: { tl: Vec2; br: Vec2 };
};

type Diff = {
  type: "diff";
  diff: jsondiffpatch.Delta;
  layerDiff: LayerDiff | null;
};

type SerializedProjectSnapshot = {
  type: "snapshot";
  project: SerializedProject;
  buffers: Map<string, Uint8Array<ArrayBuffer>>;
  layerDiff: LayerDiff | null;
};

type HistoryDiffItem = Array<Diff | SerializedProjectSnapshot>;
const emptyBufferMap = new Map<string, Uint8Array<ArrayBuffer>>();

const getPortionOfBuffer = (
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

const getBoundsOfPaintedPixels = (
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

const patchPortionOfBuffer = (
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

const copyLayersBuffer = (
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

const copyProject = (project: SerializedProject): SerializedProject => {
  return structuredClone(project);
};

export const createHistoryChangeHandler = (
  layerHandler: LayerHandler,
  projectName: string,
  gridSize: Vec2,
) => {
  const historyDiff: HistoryDiffItem = [];
  let historyIndex = 0;

  const jsondiffpatchInstance = jsondiffpatch.create();
  let currentProject: SerializedProject | null = null;

  const getSerializedProject = (): SerializedProject => {
    return serialization.project.serialize(
      projectName,
      gridSize,
      layerHandler.getList(),
      emptyBufferMap,
    );
  };

  const addSnapshot = () => {
    const serializedProject = getSerializedProject();
    currentProject = serializedProject;

    historyDiff.push({
      type: "snapshot",
      project: currentProject,
      buffers: copyLayersBuffer(layerHandler.buffers),
      layerDiff: null,
    });

    historyIndex++;
  };

  const addAction = (paintedPixels?: Set<number>): void => {
    if (historyIndex < historyDiff.length && historyIndex > 0) {
      historyDiff.splice(historyIndex);
    }

    const serializedProject = getSerializedProject();

    const diff = jsondiffpatchInstance.diff(currentProject, serializedProject);

    const isSnapshot = historyIndex % SNAPSHOT_INTERVAL === 0;

    if (isSnapshot) {
      addSnapshot();
      return;
    }

    currentProject = serializedProject;

    let paintedBuffer: Uint8Array<ArrayBuffer> | null = null;
    let bounds: { tl: Vec2; br: Vec2 } | null = null;
    if (paintedPixels) {
      bounds = getBoundsOfPaintedPixels(paintedPixels, gridSize);
      paintedBuffer = getPortionOfBuffer(
        layerHandler.getCurrentBuffer(),
        bounds.tl,
        bounds.br,
        gridSize,
      );
    }

    historyDiff.push({
      type: "diff",
      diff,
      layerDiff:
        paintedBuffer && bounds
          ? {
            id: layerHandler.getActive().id,
            binary: paintedBuffer,
            bounds: bounds,
          }
          : null,
    });

    historyIndex++;
  };

  const undo = (): void => {
    if (historyIndex === 1) return;

    historyIndex--;

    if (!historyDiff[historyIndex]) {
      console.log("No diff found for this index, cannot undo");
      return;
    }

    const currentSnapshot = Math.floor(historyIndex / SNAPSHOT_INTERVAL);

    const replaySteps = historyDiff.slice(
      currentSnapshot * SNAPSHOT_INTERVAL,
      historyIndex,
    );

    for (const change of replaySteps) {
      if (change.type === "snapshot") {
        currentProject = copyProject(change.project);

        layerHandler.setList(currentProject.layers);
        storageLocal.saveLayers(projectName, currentProject.layers);
        const bufferEntries = Array.from(change.buffers.entries());
        for (const [key, buffer] of bufferEntries) {
          const copiedBuffer = new Uint8Array(buffer.length);
          copiedBuffer.set(buffer);
          layerHandler.setLayerBuffer(key, copiedBuffer);
        }
      }

      if (change.type === "diff") {
        if (!currentProject) {
          console.log("No project found while undoing diff");
          return;
        }

        jsondiffpatchInstance.unpatch(currentProject, change.diff);

        if (change.layerDiff) {
          const buffer = layerHandler.getBufferById(change.layerDiff.id);
          if (!buffer) {
            console.log(
              `No buffer found for layer id ${change.layerDiff.id}, cannot apply layer diff`,
            );
            return;
          }

          console.log("Applying layer diff for layer id", change.layerDiff.id);
          patchPortionOfBuffer(
            buffer,
            change.layerDiff.bounds.tl,
            change.layerDiff.bounds.br,
            change.layerDiff.binary,
            gridSize,
          );

          layerHandler.setLayerBuffer(change.layerDiff.id, buffer);
        }
      }
    }
  };

  const redo = (): void => {
    // TO BE IMPLEMENTED
  };

  return {
    addSnapshot,
    addAction,
    undo,
    redo,
  };
};
