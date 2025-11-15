import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
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
    </div>
  );
};
