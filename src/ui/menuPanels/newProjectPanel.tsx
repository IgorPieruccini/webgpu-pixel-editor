import { UseMenu } from "../tools/menuProvider";
import "./menuPanels.css";
import { AiFillCloseSquare } from "solid-icons/ai";

export const NewProjectPanel = () => {
  const menu = UseMenu();

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Project Name:</label>
      <input type="text" id="project-name-input"></input>
      <button>Create</button>
    </div>
  );
};
