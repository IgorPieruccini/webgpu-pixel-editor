import { API } from "../../../projectConfig/projectConfigProvider";
import "./BrushThicknessSlider.css";

export const BrushThicknessSlider = () => {
  const brush = API.brush();

  const onBrushChangeThickness = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setThickness(e.target.valueAsNumber);
    }
  };

  return (
    <div id="brush-thickness-container" class="tool-input">
      <label for="layer-thickness-input">Thickness</label>
      <input
        id="brush-thickness-input"
        type="range"
        min={1}
        max={100}
        value={brush().getThickness()}
        onInput={onBrushChangeThickness}
      />
      <p>{brush().getThickness()}</p>
    </div>
  );
};
