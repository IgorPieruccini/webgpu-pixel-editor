import { AiOutlineDownload } from "solid-icons/ai";
import { FiFilePlus } from 'solid-icons/fi'
import "./ProjectTool.css";
import { serialization } from "../../../serialization";
import {
  API,
  useProjectConfig,
} from "../../../projectConfig/projectConfigProvider";
import type { SerializedProject } from "../../../serialization/project";

export const ProjectTool = () => {
  const project = useProjectConfig();
  const layerAPI = API.layers();

  const onDownloadProject = () => {
    const serializedProject = serialization.project.serialize(
      project.projectName(),
      project.getProjectGridSize(),
      layerAPI().getList(),
      layerAPI().buffers,
    );

    // Stringify the serialized layer buffer
    const jsonString = JSON.stringify(serializedProject);
    const name = project.projectName();

    // Create a blob and download it as "layer.px"
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importProject = () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check if the file has .px extension
      if (!file.name.endsWith(".json")) {
        alert("Please select a .px file");
        return;
      }

      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const serializedProject: SerializedProject = JSON.parse(content);
          project.createNewProject(serializedProject);
        } catch (error) {
          console.error("Error parsing .json file:", error);
          alert("Invalid .json file format");
        }
      };

      reader.readAsText(file);
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
