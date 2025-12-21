import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import "./LayerOpacity.css";

export const LayerOpacity = () => {
  const projectConfig = useProjectConfig();

  const onChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      const activeLayerId = projectConfig.pixel().getActiveLayer().id;

      projectConfig
        .pixel()
        //@ts-expect-error - test
        .setLayerOpacity(activeLayerId, e.target.valueAsNumber / 100 ?? 1);
    }
  };

  return (
    <div id="layer-opacity-container">
      <label for="layer-opacity-input">Layer opacity</label>
      <div class="layer-opacity-input-content">
        <input
          id="layer-opacity-input"
          type="range"
          min={0}
          max={100}
          value={projectConfig.pixel().getActiveLayer().opacity * 100}
          onInput={onChangeOpacity}
        />
        <p>
          {Math.floor(projectConfig.pixel().getActiveLayer().opacity * 100)}%
        </p>
      </div>
    </div>
  );
};
