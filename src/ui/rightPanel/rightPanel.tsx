import { API, useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import { AiOutlineExport } from 'solid-icons/ai'
import "./rightPanel.css";

export const RightPanel = () => {
  const projectConfig = useProjectConfig();

  const exportHandler = API.export();

  if (!projectConfig.projectName()) {
    return null;
  }

  const onExport = () => {
    exportHandler().image();
  }

  return (
    <div id="right-panel">
      <div id="project-title">
        <span>{projectConfig.projectName()}</span>
        <span class="left-container">
          <span>
            {`${projectConfig.getProjectGridSize().x} x ${projectConfig.getProjectGridSize().y}`}
          </span>
          <button onClick={onExport} id="export"><AiOutlineExport /></button>
        </span>
      </div>
      <hr />
      <Layers />
      <hr />
      <div id="layer-preview">
        <p>Layer preview</p>
        <canvas id="preview-canvas" width={300} height={300} />
      </div>
      <hr />
      <LayerOpacity />
    </div>
  );
};
