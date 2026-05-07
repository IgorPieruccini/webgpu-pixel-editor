import { API } from "../../../projectConfig/projectConfigProvider";
import { Slider } from "../../shared/slider";

export const BrushOpacitySlider = () => {
  const brush = API.brush();

  const onBrushChangeOpacity = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setOpacity(e.target.valueAsNumber);
    }
  };

  return (
    <Slider
      key="brush-opacity"
      label="Opacity"
      min={0}
      max={100}
      value={brush().getOpacity()}
      valueText={`${Math.floor(brush().getOpacity())}%`}
      onChange={onBrushChangeOpacity}
    />
  );
};
