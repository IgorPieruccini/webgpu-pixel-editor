import { createSignal } from "solid-js";
import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { useMenu } from "../tools/menuProvider";
import "./menuPanels.css";
import { AiFillCloseSquare } from "solid-icons/ai";

export const NewProjectPanel = () => {
  const [projectName, setProjectName] = createSignal("new project");
  const menu = useMenu();
  const projectConfig = useProjectConfig();

  const onCreate = () => {
    projectConfig.setProjectName(projectName());
    projectConfig.createNewProject(projectName());
  };

  const onUpdateName = (e: { target: HTMLInputElement }) => {
    setProjectName(e.target.value);
  };

  return (
    <div class="menu-panel">
      <div id="top-section">
        <AiFillCloseSquare onClick={() => menu.openOption(-1)} />
      </div>
      <label for="project-name-input">Project Name:</label>
      <input type="text" id="project-name-input" onInput={onUpdateName} />
      <button onClick={onCreate}>Create</button>
    </div>
  );
};
