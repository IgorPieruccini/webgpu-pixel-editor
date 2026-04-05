import { AiOutlineDownload } from "solid-icons/ai";
import { FiFilePlus } from 'solid-icons/fi'
import "./ProjectTool.css";
import { serialization } from "../../../serialization";
import {
  API,
  useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";

export const ProjectTool = () => {
  const project = useProjectConfig();
  const layerAPI = API.layers();

  const onDownloadProject = () => {
    const serializeProject = serialization.project.serialize(
      project.projectName(),
      project.getProjectGridSize(),
      layerAPI().getList(),
      layerAPI().buffers
    )
    serialization.project.saveProject(serializeProject)
  };

  const importProject = () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pxart";

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
    <div id="project-tool" class="tool">
      <h3>Project Tool</h3>
      <div id="project-tool-buttons">
        <button onClick={onDownloadProject}>
          <AiOutlineDownload />
        </button>
        <button onClick={importProject}>
          <FiFilePlus />
        </button>
      </div>
    </div>
  );
};
