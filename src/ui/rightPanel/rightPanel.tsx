import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import { AiOutlineExport } from "solid-icons/ai";
import { useMenu } from "../tools/menuProvider";
import { OPENED_OPTIONS } from "../tools/constants";
import "./rightPanel.css";
import { SquareButton } from "../shared/squareButton";

export const RightPanel = () => {
  const projectConfig = useProjectConfig();
  const menu = useMenu();

  if (!projectConfig.projectName()) {
    return null;
  }

  const onExport = () => {
    menu.openOption(OPENED_OPTIONS.EXPORT_PNG);
  };

  return (
    <div id="right-panel">
      <div id="project-title">
        <span>{projectConfig.projectName()}</span>
        <span class="left-container">
          <span>
            {`${projectConfig.getProjectGridSize().x} x ${projectConfig.getProjectGridSize().y}`}
          </span>
          <SquareButton onClick={onExport} size="md">
            <AiOutlineExport />
          </SquareButton>
        </span>
      </div>
      <hr />
      <Layers />
      <hr />
      <div id="layer-preview">
        <p>Layer preview</p>
        <canvas id="preview-canvas" width={250} height={250} />
      </div>
      <hr />
      <LayerOpacity />
    </div>
  );
};
