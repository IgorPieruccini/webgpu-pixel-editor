import { AiOutlineDownload } from "solid-icons/ai";
import { FiFilePlus } from "solid-icons/fi";
import "./ProjectTool.css";
import { serialization } from "../../../serialization";
import {
  API,
  useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";
import { generateUUID } from "../../../utils";
import type { Layer } from "../../../lib";

export const ProjectTool = () => {
  const project = useProjectConfig();
  const layerAPI = API.layers();
  const imageImporter = API.imageImporter();

  const onDownloadProject = () => {
    const serializeProject = serialization.project.serialize(
      project.projectName(),
      project.getProjectGridSize(),
      layerAPI().getList(),
      layerAPI().buffers,
    );
    serialization.project.saveProject(serializeProject);
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

      project.createNewProject(loadedProject);
    };

    // Trigger the file dialog
    input.click();
  };

  const importImage = () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png";

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const name = file.name;

      const { buffer, width, height } = await imageImporter().readImage(file);

      const id = generateUUID();

      const layer: Layer = {
        id,
        name: "imported Image",
        display: true,
        opacity: 1,
      };

      project.createNewProject({
        name,
        gridSize: { x: width, y: height },
        layers: [layer],
        buffers: {
          [id]: buffer,
        },
      });
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
        <button onClick={importImage}>Import image</button>
      </div>
    </div>
  );
};
