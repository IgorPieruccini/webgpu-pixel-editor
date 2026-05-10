import { ACTIVATE_TOOL } from "../../../editor/constant";
import { BrushOpacitySlider } from "./BrushOpacitySlider";
import { BrushThicknessSlider } from "./BrushThicknessSlider";
import styles from "./ToolSettings.module.css";
import { MenuOptions } from "../../menuPanels/menu/menuOptions";
import { FiMenu } from "solid-icons/fi";
import { SquareButton } from "../../shared/squareButton";
import { AnchoredPopover } from "../../shared/anchoredPopover";
import { AiOutlineExport } from "solid-icons/ai";
import { useMenu } from "../../menuPanels/menuProvider";
import { OPENED_OPTIONS } from "../constants";
import { useEditor } from "../../../editor/editortContext";

export const ToolSettings = () => {
  const project = useEditor();
  const menu = useMenu();

  const showThickness = () => {
    const activeTool = project?.().activeTool();

    return (
      activeTool !== ACTIVATE_TOOL.PAINT_SELECTION &&
      activeTool !== ACTIVATE_TOOL.BUCKET_PAINT
    );
  };

  const onExport = () => {
    menu.openOption(OPENED_OPTIONS.EXPORT_PNG);
  };

  return (
    <div class={styles.toolSettings}>
      <div class={styles.menuSection}>
        <AnchoredPopover
          side="bottom"
          trigger={({ toggle }) => (
            <SquareButton size="sm" onClick={toggle}>
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

      <div class="separator separator-vertical" aria-hidden="true" />
      <div class={styles.generalSection}>
        <SquareButton onClick={onExport} size="sm">
          <AiOutlineExport />
        </SquareButton>
      </div>
    </div>
  );
};
