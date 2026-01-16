import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import "./rightPanel.css";

export const RightPanel = () => {
  const projectConfig = useProjectConfig();

  if (!projectConfig.projectName()) {
    return null;
  }

  return (
    <div id="right-panel">
      <div id="project-title">
        <span>{projectConfig.projectName()}</span>
        <span>
          {`${projectConfig.getProjectGridSize().x} x ${projectConfig.getProjectGridSize().y}`}
        </span>
      </div>
      <Layers />
      <div id="layer-preview">
        <p>Layer preview</p>
        <canvas id="preview-canvas" width={300} height={300} />
      </div>
      <LayerOpacity />
    </div>
  );
};
