import type { Vec2 } from "../../../editor/types";
import { serialization } from "../../../serialization";
import { type SerializedProject } from "../../../serialization/project";
import type { LayerHandler } from "../layerHandler";
import * as jsondiffpatch from "jsondiffpatch";
import { storageLocal } from "../../../storageLocal";
import type { HistoryDiffItem, LayerDiff } from "./types";
import {
  copyLayersBuffer,
  copyProject,
  getBoundsOfPaintedPixels,
  getPortionOfBuffer,
  patchPortionOfBuffer,
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
      type: "snapshot",
      project: serializedProject,
      buffers: copyLayersBuffer(layerHandler.buffers),
      layerDiff: layerDiff ?? null,
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
