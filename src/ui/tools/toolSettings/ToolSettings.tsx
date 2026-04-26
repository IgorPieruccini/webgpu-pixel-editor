import { ACTIVATE_TOOL } from "../../../editor/constant";
import { useEditor } from "../../../editor/editortContext";
import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import "./ToolSettings.css";
import { MenuOptions } from "../menu/menuOptions";
import { FiMenu } from "solid-icons/fi";
import { SquareButton } from "../../shared/squareButton";
import { AnchoredPopover } from "../../shared/anchoredPopover";

export const ToolSettings = () => {
  const project = useEditor();

  const showThickness = () =>
    project?.().activeTool() !== ACTIVATE_TOOL.PAINT_SELECTION;

  return (
    <div id="tool-settings">
      <div id="menu-section">
        <AnchoredPopover
          side="bottom"
          trigger={({ toggle }) => (
            <SquareButton
              id="menu"
              class="square-tool-button"
              size="sm"
              onClick={toggle}
            >
              <FiMenu />
            </SquareButton>
          )}
        >
          <MenuOptions />
        </AnchoredPopover>
      </div>
      <div class="separator separator-vertical" aria-hidden="true" />
      {showThickness() && <BrushThicknessSlider />}
      {showThickness() && (
        <div class="separator separator-vertical" aria-hidden="true" />
      )}
      <BrushOpacitySlider />
    </div>
  );
};
