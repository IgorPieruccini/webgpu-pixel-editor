import { createSignal } from "solid-js";
import { ACTIVATE_TOOL } from "../../../editor/constant";
import { useEditor } from "../../../editor/editortContext";
import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import "./ToolSettings.css";
import { MenuOptions } from "../menu/menuOptions";
import { FiMenu } from "solid-icons/fi";
import { SquareButton } from "../../shared/squareButton";

export const ToolSettings = () => {
  const project = useEditor();
  const showThickness =
    project?.().activeTool() !== ACTIVATE_TOOL.PAINT_SELECTION;

  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div id="tool-settings">
      <div id="tool-menu">
        <SquareButton
          id="menu"
          class="square-tool-button"
          size="sm"
          onClick={() => setIsOpen(!isOpen())}
        >
          <FiMenu />
        </SquareButton>
        {isOpen() ? <MenuOptions /> : null}
      </div>
      <div class="separator separator-vertical" aria-hidden="true" />
      {showThickness && <BrushThicknessSlider />}
      {showThickness && (
        <div class="separator separator-vertical" aria-hidden="true" />
      )}
      <BrushOpacitySlider />
    </div>
  );
};
