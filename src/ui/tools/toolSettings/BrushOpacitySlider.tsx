import { useProjectConfig } from "../../../projectConfig/projectConfigProvider";
import "./BrushOpacitySlider.css";

export const BrushOpacitySlider = () => {
  const projectConfig = useProjectConfig();

  const onBrushChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      projectConfig.pixel().setBrushOpacity(e.target.valueAsNumber);
    }
  };

  return (
    <div id="brush-opacity-container">
      <label for="layer-opacity-input">Layer opacity</label>
      <input
        id="brush-opacity-input"
        type="range"
        min={0}
        max={100}
        value={projectConfig.pixel().getBrushOpacity()}
        onInput={onBrushChangeOpacity}
      />
      <p>{Math.floor(projectConfig.pixel().getBrushOpacity())}%</p>
    </div>
  );
};
