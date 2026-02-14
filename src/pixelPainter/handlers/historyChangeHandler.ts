import type { Vec2 } from "../../editor/types";
import { serialization } from "../../serialization";
import { type SerializedProject } from "../../serialization/project";
import type { LayerHandler } from "./layerHandler";
import * as jsondiffpatch from "jsondiffpatch";

export type HistoryChangeHandler = ReturnType<
  typeof createHistoryChangeHandler
>;

type HistoryDiffItem = Array<jsondiffpatch.Delta>;

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
      layerHandler.buffers,
    );
  };

  const addSnapshot = (): void => {
    const serializedProject = getSerializedProject();
    currentProject = serializedProject;
  };

  const addAction = (): void => {
    if (historyIndex < historyDiff.length && historyIndex > 0) {
      historyDiff.splice(historyIndex);
    }
    const serializedProject = getSerializedProject();
    const diff = jsondiffpatchInstance.diff(currentProject, serializedProject);
    currentProject = serializedProject;

    historyDiff.push(diff);
    historyIndex++;
  };

  const undo = (): void => {
    if (historyIndex === 0) return;

    historyIndex--;

    if (!historyDiff[historyIndex]) {
      console.log("No diff found for this index, cannot undo");
      return;
    }

    jsondiffpatchInstance.unpatch(currentProject, historyDiff[historyIndex]);

    if (currentProject) {
      layerHandler.load(currentProject.layers, currentProject.buffers);
    }
  };

  const redo = (): void => {
    historyIndex++;

    if (historyIndex > historyDiff.length) {
      historyIndex = historyDiff.length;
      return;
    }

    jsondiffpatchInstance.patch(currentProject, historyDiff[historyIndex]);

    if (currentProject) {
      layerHandler.load(currentProject.layers, currentProject.buffers);
    }
  };

  return {
    addSnapshot,
    addAction,
    undo,
    redo,
  };
};
