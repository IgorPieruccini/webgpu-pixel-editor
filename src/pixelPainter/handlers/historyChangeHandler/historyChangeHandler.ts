import type { Vec2 } from "../../../editor/types";
import { serialization } from "../../../serialization";
import { type SerializedProject } from "../../../serialization/project";
import type { LayerHandler } from "../layerHandler";
import * as jsondiffpatch from "jsondiffpatch";
import type { HistoryDiffItem, LayerDiff } from "./types";
import {
  copyLayersBuffer,
  getBoundsOfPaintedPixels,
  getPortionOfBuffer,
  undoDiff,
  undoLayerDiff,
  undoSnapshot,
} from "./utils";

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
    currentProject = serializedProject;

    historyDiff.push({
      index: historyIndex,
      type: "snapshot",
      project: serializedProject,
      buffers: copyLayersBuffer(layerHandler.buffers),
      layerDiff: layerDiff,
    });

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

    let currentSnapshot = Math.floor(historyIndex / SNAPSHOT_INTERVAL);
    const isAtSnapshot = historyIndex % SNAPSHOT_INTERVAL === 0;
    if (isAtSnapshot) {
      currentSnapshot = Math.floor((historyIndex - 1) / SNAPSHOT_INTERVAL);
    }

    const replaySteps = historyDiff.slice(
      currentSnapshot * SNAPSHOT_INTERVAL,
      historyIndex,
    );

    console.log("replay steps", replaySteps);

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
          undoSnapshot(currentProject, change, layerHandler, gridSize);
        }
      }

      if (change.type === "diff") {
        undoDiff(
          currentProject,
          change,
          jsondiffpatchInstance,
          layerHandler,
          gridSize,
        );
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
