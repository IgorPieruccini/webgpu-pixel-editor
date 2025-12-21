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
      <p>{projectConfig.projectName()}</p>
      <Layers />
      <div id="layer-preview">
        <p>Layer preview</p>
        <canvas id="preview-canvas" width={300} height={300} />
      </div>
      <LayerOpacity />
    </div>
  );
};
