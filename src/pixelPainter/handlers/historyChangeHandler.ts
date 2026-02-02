import type { Vec2 } from "../../editor/types";
import { serialization } from "../../serialization";
import type { SerializedProject } from "../../serialization/project";
import type { LayerHandler } from "./layerHandler";

const MILESTONE_FREQUENCY = 10;
type historyAction = () => void;

export const createHistoryChangeHandler = (
  layerHandler: LayerHandler,
  projectName: string,
  gridSize: Vec2,
) => {
  const historyActions = Array<historyAction>();
  const milestones = Array<SerializedProject>();

  let historyIndex = 0;

  const addAction = (action: historyAction): void => {
    if (historyIndex < historyActions.length) {
      historyActions.splice(historyIndex);
    }

    const count = milestones.length + historyIndex;

    const isMilestone = count !== 0 && count % MILESTONE_FREQUENCY === 0;
    console.log({ isMilestone });

    if (isMilestone) {
      milestones.push(
        serialization.project.serialize(
          projectName,
          gridSize,
          layerHandler.getList(),
          layerHandler.buffers,
        ),
      );
      return;
    }

    historyActions.push(action);

    historyIndex++;

    console.log("Added action, history index:", historyIndex);
    console.log(historyActions.length);
    console.log(milestones.length);
  };

  const loadFromSerializedProject = (
    serializedProject: SerializedProject,
  ): void => {
    layerHandler.load(serializedProject.layers, serializedProject.buffers);
  };

  const undo = (): void => {
    if (historyIndex === 0) return;

    const currentMilestoneIndex = Math.floor(
      historyIndex / MILESTONE_FREQUENCY,
    );

    const milestone = milestones.at(currentMilestoneIndex - 1);
    if (milestone) {
      loadFromSerializedProject(milestone);
    }

    const actionsToReplay = historyActions.slice(
      currentMilestoneIndex * MILESTONE_FREQUENCY,
      historyIndex - 1,
    );

    actionsToReplay.forEach((action) => {
      console.log(action);
      action();
    });

    historyIndex--;
  };

  const redo = (): void => {
    if (historyIndex >= historyActions.length) return;

    const action = historyActions[historyIndex];
    action();

    historyIndex++;
  };

  return {
    addAction,
    undo,
    redo,
  };
};
