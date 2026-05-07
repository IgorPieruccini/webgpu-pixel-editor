import {
  BiRegularBrush,
  BiRegularEraser,
  BiSolidBrush,
  BiSolidEraser,
  BiRegularPencil,
  BiSolidPencil,
} from "solid-icons/bi";
import { BsBrushFill, BsBrush } from "solid-icons/bs";

import "./index.css";
import { useEditor } from "../../editor/editortContext";
import { ACTIVATE_TOOL } from "../../editor/constant";
import { ColorPicker } from "../color/colorPicker";
import { SquareButton } from "../shared/squareButton";

export const Tools = () => {
  const project = useEditor();

  return (
    <div id="tools">
      <div id="tools-container">
        <SquareButton
          class="square-tool-button"
          size="lg"
          classList={{
            active: project?.().activeTool() === ACTIVATE_TOOL.PAINT,
          }}
          onClick={() => {
            project?.().setActiveTool(ACTIVATE_TOOL.PAINT);
          }}
        >
          {project?.().activeTool() === ACTIVATE_TOOL.PAINT ? (
            <BsBrushFill />
          ) : (
            <BsBrush />
          )}
        </SquareButton>
        <SquareButton
          class="square-tool-button"
          size="lg"
          classList={{
            active: project?.().activeTool() === ACTIVATE_TOOL.PAINT_SELECTION,
          }}
          onClick={() => {
            project?.().setActiveTool(ACTIVATE_TOOL.PAINT_SELECTION);
          }}
        >
          {project?.().activeTool() === ACTIVATE_TOOL.PAINT_SELECTION ? (
            <BiSolidBrush />
          ) : (
            <BiRegularBrush />
          )}
        </SquareButton>
        <SquareButton
          class="square-tool-button"
          size="lg"
          classList={{
            active: project?.().activeTool() === ACTIVATE_TOOL.DELETE,
          }}
          onClick={() => {
            project?.().setActiveTool(ACTIVATE_TOOL.DELETE);
          }}
        >
          {project?.().activeTool() === ACTIVATE_TOOL.DELETE ? (
            <BiSolidEraser />
          ) : (
            <BiRegularEraser />
          )}
        </SquareButton>

        <SquareButton
          class="square-tool-button"
          size="lg"
          classList={{
            active: project?.().activeTool() === ACTIVATE_TOOL.LINE,
          }}
          onClick={() => {
            project?.().setActiveTool(ACTIVATE_TOOL.LINE);
          }}
        >
          {project?.().activeTool() === ACTIVATE_TOOL.LINE ? (
            <BiSolidPencil />
          ) : (
            <BiRegularPencil />
          )}
        </SquareButton>
      </div>

      <hr />
      <ColorPicker />
    </div>
  );
};
