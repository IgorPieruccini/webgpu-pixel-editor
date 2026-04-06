import { FILE_FORMAT } from "../../../constants";
import { API, useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import { serialization } from "../../../serialization";
import { OPENED_OPTIONS } from "../constants";
import { useMenu } from "../menuProvider";
import "./menu.css";

export const MenuOptions = () => {
  const menu = useMenu();

  const project = useProjectConfig();
  const layerAPI = API.layers();

  const onLoadProject = () => {
    const serializeProject = serialization.project.serialize(
      project.projectName(),
      project.getProjectGridSize(),
      layerAPI().getList(),
      layerAPI().buffers
    )
    serialization.project.saveProject(serializeProject)


  };

  const onSaveProject = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = FILE_FORMAT;

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const loadedProject = await serialization.project.loadProject(file);


      project.createNewProject(loadedProject)
    };

    // Trigger the file dialog
    input.click();
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
      <button onClick={onSaveProject}>
        Load Project from file
      </button>
      <button onClick={onLoadProject}>
        Save Project Locally
      </button>
    </div>
  );
};
