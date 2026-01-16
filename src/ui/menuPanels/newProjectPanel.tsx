import { createSignal } from "solid-js";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { useMenu } from "../tools/menuProvider";
import "./menuPanels.css";
import { AiFillCloseSquare } from "solid-icons/ai";
import type { Vec2 } from "../../editor/types";
import {
  DEFAULT_GRID_SIZE,
  MAX_GRID_SIZE,
  MIN_GRID_SIZE,
} from "../../constants";

export const NewProjectPanel = () => {
  const [getProjectName, setProjectName] = createSignal("new project");
  const [getGridSize, setGridSize] = createSignal<Vec2>(DEFAULT_GRID_SIZE);
  const menu = useMenu();
  const projectConfig = useProjectConfig();

  const onCreate = () => {
    projectConfig.createNewProject({
      name: getProjectName(),
      gridSize: getGridSize(),
    });
  };

  const onUpdateName = (e: { target: HTMLInputElement }) => {
    setProjectName(e.target.value);
  };

  const updateGridSize = (axis: keyof Vec2, value: string) => {
    const gridSize = { ...getGridSize() };
    gridSize[axis] = parseInt(value);
    setGridSize(gridSize);
  };

  const onFocusOut = (axis: keyof Vec2) => {
    const gridSize = { ...getGridSize() };
    console.log({ gridSize });

    if (gridSize[axis] > MAX_GRID_SIZE) {
      gridSize[axis] = MAX_GRID_SIZE;
    }

    if (gridSize[axis] < MIN_GRID_SIZE) {
      gridSize[axis] = MIN_GRID_SIZE;
    }

    setGridSize(gridSize);
  };

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Project Name:</label>
      <input type="text" id="project-name-input" onInput={onUpdateName} />
      <div id="grid-size-container">
        <div class="grid-size-input">
          <label for="grid-x-input">Width:</label>
          <input
            id="grid-x-input"
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={getGridSize().x}
            onInput={(e) => updateGridSize("x", e.target.value)}
            onFocusOut={() => onFocusOut("x")}
          />
        </div>
        <div class="grid-size-input">
          <label for="grid-y">Height:</label>
          <input
            id="grid-y-input"
            type="number"
            min={MIN_GRID_SIZE}
            max={MAX_GRID_SIZE}
            value={getGridSize().y}
            onInput={(e) => updateGridSize("y", e.target.value)}
            onFocusOut={() => onFocusOut("y")}
          />
        </div>
      </div>
      <button onClick={onCreate}>Create</button>
    </div>
  );
};
