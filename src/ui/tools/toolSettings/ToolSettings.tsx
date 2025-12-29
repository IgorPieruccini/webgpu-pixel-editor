import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import "./ToolSettings.css";

export const ToolSettings = () => {
  return (
    <div id="tool-settings">
      <BrushThicknessSlider />
      <BrushOpacitySlider />
    </div>
  );
};
