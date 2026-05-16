import {
  BiRegularBrush,
  BiRegularEraser,
  BiSolidBrush,
  BiSolidEraser,
  BiRegularPencil,
  BiSolidPencil,
} from "solid-icons/bi";
import { RiDesignPaintLine, RiDesignPaintFill } from "solid-icons/ri";
import { BsBrushFill, BsBrush } from "solid-icons/bs";

import styles from "./Tools.module.css";
import { useEditor } from "../../editor/editortContext";
import { ACTIVATE_TOOL } from "../../editor/constant";
import { ColorPicker } from "../color/colorPicker";
import { SquareButton } from "../shared/squareButton";
import { TbOutlineColorPicker, TbOutlineColorPickerOff } from "solid-icons/tb";
import { createEffect, createMemo } from "solid-js";
import { createActiveObjectGuard } from "../guard";

export const Tools = () => {
  const project = useEditor();

  const activeTool = createMemo(() => {
    return project().activeTool();
  });

  const { isActiveTool } = createActiveObjectGuard();

  createEffect(() => {
    if (
      !isActiveTool(ACTIVATE_TOOL.EYE_DROPPER) ||
      !isActiveTool(ACTIVATE_TOOL.BUCKET_PAINT)
    ) {
      project().canvas.style.cursor = "default";
    }
  }, project().activeTool());

  return (
    <div class={styles.tools}>
      <div class={styles.toolsContainer}>
        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.PAINT),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.PAINT);
          }}
        >
          {isActiveTool(ACTIVATE_TOOL.PAINT) ? <BsBrushFill /> : <BsBrush />}
        </SquareButton>
        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.PAINT_SELECTION),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.PAINT_SELECTION);
          }}
        >
          {activeTool() === ACTIVATE_TOOL.PAINT_SELECTION ? (
            <BiSolidBrush />
          ) : (
            <BiRegularBrush />
          )}
        </SquareButton>
        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.DELETE),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.DELETE);
          }}
        >
          {isActiveTool(ACTIVATE_TOOL.DELETE) ? (
            <BiSolidEraser />
          ) : (
            <BiRegularEraser />
          )}
        </SquareButton>

        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.LINE),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.LINE);
          }}
        >
          {isActiveTool(ACTIVATE_TOOL.LINE) ? (
            <BiSolidPencil />
          ) : (
            <BiRegularPencil />
          )}
        </SquareButton>

        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.BUCKET_PAINT),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.BUCKET_PAINT);
            project().canvas.style.cursor =
              "url('bucket-icon.svg') 30 30, auto";
          }}
        >
          {isActiveTool(ACTIVATE_TOOL.BUCKET_PAINT) ? (
            <RiDesignPaintFill />
          ) : (
            <RiDesignPaintLine />
          )}
        </SquareButton>

        <SquareButton
          classList={{
            [styles.active]: isActiveTool(ACTIVATE_TOOL.EYE_DROPPER),
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.EYE_DROPPER);
            project().canvas.style.cursor =
              "url('eye-drop-icon.svg') 4 24, auto";
          }}
        >
          {isActiveTool(ACTIVATE_TOOL.EYE_DROPPER) ? (
            <TbOutlineColorPicker />
          ) : (
            <TbOutlineColorPickerOff />
          )}
        </SquareButton>
      </div>

      <hr />
      <ColorPicker />
    </div>
  );
};
