import type { Vec2 } from "../../../editor/types";
import { serialization } from "../../../serialization";
import { type SerializedProject } from "../../../serialization/project";
import type { LayerHandler } from "../layerHandler";
import * as jsondiffpatch from "jsondiffpatch";
import type { HistoryDiffItem, LayerDiff } from "./types";
import {
  copyLayersBuffer,
  copyProject,
  getBoundsOfPaintedPixels,
  getPortionOfBuffer,
  undoLayerDiff,
} from "./utils";
import { storageLocal } from "../../../storageLocal";

const SNAPSHOT_INTERVAL = 5;

export type HistoryChangeHandler = ReturnType<
  typeof createHistoryChangeHandler
>;

const emptyBufferMap = new Map<string, Uint8Array<ArrayBuffer>>();

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

  const getDiffData = (
    paintedPixels?: Set<number>,
  ): {
    diff: jsondiffpatch.Delta;
    layerDiff: LayerDiff | null;
    project: SerializedProject;
  } => {
    const serializedProject = getSerializedProject();
    const diff = jsondiffpatchInstance.diff(currentProject, serializedProject);

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

    return {
      diff,
      layerDiff:
        paintedBuffer && bounds
          ? {
              id: layerHandler.getActive().id,
              binary: paintedBuffer,
              bounds: bounds,
            }
          : null,
      project: serializedProject,
    };
  };

  const addSnapshot = (
    project?: SerializedProject,
    layerDiff: LayerDiff | null = null,
  ) => {
    const serializedProject = project ?? getSerializedProject();

    const diff = jsondiffpatchInstance.diff(currentProject, serializedProject);

    historyDiff.push({
      index: historyIndex,
      type: "snapshot",
      diff,
      buffers: copyLayersBuffer(layerHandler.buffers),
      layerDiff: layerDiff,
    });

    currentProject = serializedProject;
    historyIndex++;
  };

  const addAction = (paintedPixels?: Set<number>): void => {
    if (historyIndex < historyDiff.length && historyIndex > 0) {
      historyDiff.splice(historyIndex);
    }

    const { diff, layerDiff, project } = getDiffData(paintedPixels);

    const isSnapshot = historyIndex % SNAPSHOT_INTERVAL === 0;

    if (isSnapshot) {
      addSnapshot(project, layerDiff);
      return;
    }

    currentProject = project;

    historyDiff.push({
      index: historyIndex,
      type: "diff",
      diff,
      layerDiff,
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

    const cureDiff = historyDiff[historyIndex];
    jsondiffpatchInstance.unpatch(currentProject, cureDiff.diff);
    if (currentProject) {
      const project = copyProject(currentProject);
      layerHandler.setList(project.layers);
      storageLocal.saveLayers(project.name, project.layers);

      const activeLayer = layerHandler.getActive();
      if (activeLayer) {
        const layers = layerHandler.getList();
        const activeLayerInProject = layers.find(
          (layer) => layer.id === activeLayer.id,
        );

        if (!activeLayerInProject) {
          layerHandler.setActive(layers[layers.length - 1]);
        }
      }
    }

    let currentSnapshot = Math.floor(historyIndex / SNAPSHOT_INTERVAL);
    const isAtSnapshot = historyIndex % SNAPSHOT_INTERVAL === 0;
    if (isAtSnapshot) {
      currentSnapshot = Math.floor((historyIndex - 1) / SNAPSHOT_INTERVAL);
    }

    const replaySteps = historyDiff.slice(
      currentSnapshot * SNAPSHOT_INTERVAL,
      historyIndex,
    );

    if (!currentProject) {
      return;
    }

    for (const change of replaySteps) {
      if (change.type === "snapshot") {
        if (change.index >= historyIndex) {
          if (change.layerDiff) {
            undoLayerDiff(change.layerDiff, layerHandler, gridSize);
          }
        } else {
          const bufferEntries = Array.from(change.buffers.entries());

          for (const [key, buffer] of bufferEntries) {
            const copiedBuffer = new Uint8Array(buffer.length);
            copiedBuffer.set(buffer);
            layerHandler.setLayerBuffer(key, copiedBuffer);
          }

          if (change.layerDiff) {
            undoLayerDiff(change.layerDiff, layerHandler, gridSize);
          }
        }
      }

      if (change.type === "diff") {
        if (change.layerDiff) {
          undoLayerDiff(change.layerDiff, layerHandler, gridSize);
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
