import { ACTIVATE_TOOL } from "../../../editor/constant";
import { useEditor } from "../../../editor/editortContext";
import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import "./ToolSettings.css";

export const ToolSettings = () => {
  const project = useEditor();

  return (
    <div id="tool-settings">
      {project?.().activeTool() !== ACTIVATE_TOOL.PAINT_SELECTION && (
        <BrushThicknessSlider />
      )}

      <BrushOpacitySlider />
    </div>
  );
};
