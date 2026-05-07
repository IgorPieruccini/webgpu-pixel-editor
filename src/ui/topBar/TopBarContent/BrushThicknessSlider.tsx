import { API } from "../../../projectConfig/projectConfigProvider";
import { Slider } from "../../shared/slider";

export const BrushThicknessSlider = () => {
  const brush = API.brush();

  const onBrushChangeThickness = (e: InputEvent) => {
    if (e.target) {
      // @ts-expect-error - Figure out the correct type
      brush().setThickness(e.target.valueAsNumber);
    }
  };

  return (
    <Slider
      key="brush-thickness"
      label="Thickness"
      min={1}
      max={100}
      value={brush().getThickness()}
      valueText={brush().getThickness().toString()}
      onChange={onBrushChangeThickness}
    />
  );
};
