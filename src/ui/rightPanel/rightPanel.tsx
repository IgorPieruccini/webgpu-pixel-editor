import { useProjectConfig } from "../../projectConfig/projectConfigProvider";
import { LayerOpacity } from "./LayerOpacity/LayerOpacity";
import { Layers } from "./Layers/Layers";
import styles from "./RightPanel.module.css";

export const RightPanel = () => {
  const projectConfig = useProjectConfig();

  if (!projectConfig.projectName()) {
    return null;
  }

  return (
    <div class={styles.rightPanel}>
      <div class={styles.projectTitle}>
        <span>{projectConfig.projectName()}</span>
        <span class={styles.meta}>
          <span>
            {`${projectConfig.getProjectGridSize().x} x ${projectConfig.getProjectGridSize().y}`}
          </span>
        </span>
      </div>
      <hr />
      <Layers />
      <hr />
      <div class={styles.layerPreview}>
        <p>Layer preview</p>
        <canvas
          id={"preview-canvas"}
          class={styles.previewCanvas}
          width={250}
          height={250}
        />
      </div>
      <hr />
      <LayerOpacity />
    </div>
  );
};
