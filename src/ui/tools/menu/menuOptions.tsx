import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import {
  createProjectFromImage,
  loadProject,
  saveProject,
} from "../../../projectConfig/projectUtils";
import { OPENED_OPTIONS } from "../constants";
import { useMenu } from "../menuProvider";
import "./menu.css";

export const MenuOptions = () => {
  const menu = useMenu();

  const project = useProjectConfig();

  const onLoadProject = () => {
    loadProject(project);
  };

  const onSaveProject = () => {
    saveProject(project);
  };

  const onCreatingProjectFromImage = () => {
    createProjectFromImage(project);
  };

  return (
    <div id="menu-options">
      <button
        onClick={() => {
          menu.openOption(OPENED_OPTIONS.NEW_PROJECT);
        }}
      >
        New project
      </button>
      <button onClick={() => menu.openOption(OPENED_OPTIONS.MY_PROJECTS)}>
        My projects
      </button>
      <button onClick={onSaveProject}>Load Project from file</button>
      <button onClick={onLoadProject}>Save Project Locally</button>
      <button onClick={onCreatingProjectFromImage}>
        Create Project from Image
      </button>
    </div>
  );
};
