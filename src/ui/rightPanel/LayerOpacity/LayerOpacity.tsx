import { API } from "../../../projectConfig/projectConfigProvider";
import "./LayerOpacity.css";

export const LayerOpacity = () => {
  const layersAPI = API.layers();

  const onChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      const activeLayerId = layersAPI().getActive().id;

      //@ts-expect-error - fix input type
      layersAPI().setOpacity(activeLayerId, e.target.valueAsNumber / 100 ?? 1);
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
          value={layersAPI().getActive().opacity * 100}
          onInput={onChangeOpacity}
        />
        <p>{Math.floor(layersAPI().getActive().opacity * 100)}%</p>
      </div>
    </div>
  );
};
