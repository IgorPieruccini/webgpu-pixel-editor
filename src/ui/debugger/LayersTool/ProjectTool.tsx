import { AiOutlineDownload } from "solid-icons/ai";
import { TbFileImport } from "solid-icons/tb";
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

  return (
    <div id="project-tool" class="tool">
      <h3>Project Tool</h3>
      <div id="project-tool-buttons">
        <button onClick={onDownloadProject}>
          <AiOutlineDownload />
        </button>
        <button>
          <TbFileImport />
        </button>
      </div>
    </div>
  );
};
