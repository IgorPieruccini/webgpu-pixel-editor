import { API } from "../../../projectConfig/projectConfigProvider";
import "./BrushOpacitySlider.css";

export const BrushOpacitySlider = () => {
  const brush = API.brush();

  const onBrushChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setOpacity(e.target.valueAsNumber);
    }
  };

  return (
    <div id="brush-opacity-container" class="tool-input">
      <label for="layer-opacity-input">Layer opacity</label>
      <input
        id="brush-opacity-input"
        type="range"
        min={0}
        max={100}
        value={brush().getOpacity()}
        onInput={onBrushChangeOpacity}
      />
      <p>{Math.floor(brush().getOpacity())}%</p>
    </div>
  );
};
