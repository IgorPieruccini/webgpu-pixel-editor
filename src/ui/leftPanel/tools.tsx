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

export const Tools = () => {
  const project = useEditor();

  const activeTool = createMemo(() => {
    return project().activeTool();
  });

  createEffect(() => {
    const currentProject = project();
    if (
      currentProject &&
      (currentProject.activeTool() !== ACTIVATE_TOOL.EYE_DROPPER ||
        currentProject.activeTool() !== ACTIVATE_TOOL.BUCKET_PAINT)
    ) {
      currentProject.canvas.style.cursor = "default";
    }
  }, project().activeTool());

  return (
    <div class={styles.tools}>
      <div class={styles.toolsContainer}>
        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: activeTool() === ACTIVATE_TOOL.PAINT,
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.PAINT);
          }}
        >
          {activeTool() === ACTIVATE_TOOL.PAINT ? <BsBrushFill /> : <BsBrush />}
        </SquareButton>
        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: activeTool() === ACTIVATE_TOOL.PAINT_SELECTION,
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
            [styles.active]: activeTool() === ACTIVATE_TOOL.DELETE,
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.DELETE);
          }}
        >
          {activeTool() === ACTIVATE_TOOL.DELETE ? (
            <BiSolidEraser />
          ) : (
            <BiRegularEraser />
          )}
        </SquareButton>

        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: activeTool() === ACTIVATE_TOOL.LINE,
          }}
          onClick={() => {
            project().setActiveTool(ACTIVATE_TOOL.LINE);
          }}
        >
          {activeTool() === ACTIVATE_TOOL.LINE ? (
            <BiSolidPencil />
          ) : (
            <BiRegularPencil />
          )}
        </SquareButton>

        <SquareButton
          class={styles.toolButton}
          size="lg"
          classList={{
            [styles.active]: activeTool() === ACTIVATE_TOOL.BUCKET_PAINT,
          }}
          onClick={() => {
            const currentProject = project();
            if (currentProject) {
              currentProject.setActiveTool(ACTIVATE_TOOL.BUCKET_PAINT);
              currentProject.canvas.style.cursor =
                "url('bucket-icon.svg') 30 30, auto";
            }
          }}
        >
          {activeTool() === ACTIVATE_TOOL.BUCKET_PAINT ? (
            <RiDesignPaintFill />
          ) : (
            <RiDesignPaintLine />
          )}
        </SquareButton>

        <SquareButton
          classList={{
            [styles.active]: activeTool() === ACTIVATE_TOOL.EYE_DROPPER,
          }}
          onClick={() => {
            const currentProject = project();
            if (currentProject) {
              currentProject.setActiveTool(ACTIVATE_TOOL.EYE_DROPPER);
              currentProject.canvas.style.cursor =
                "url('eye-drop-icon.svg') 4 24, auto";
            }
          }}
        >
          {activeTool() === ACTIVATE_TOOL.EYE_DROPPER ? (
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
