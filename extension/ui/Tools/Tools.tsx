import "@kittl/ui/Button";
import "@kittl/ui/Icons/pencil";
import "@kittl/ui/Icons/ratioOneByOne";
import "@kittl/ui/Icons/eraser";
import { ACTIVATE_TOOL } from "../../../src/editor/constant";
import { useEditor } from "../../../src/editor/editortContext";
import { ColorPicker } from "./ColorPicker";
import "./tools.css";

export const Tools = () => {
  const project = useEditor();

  return (
    <div id="tools">
      <ColorPicker />
      <kittl-button
        variant="ghost"
        class="icon-button tool-btn"
        classList={{
          active: project?.().activeTool() === ACTIVATE_TOOL.PAINT,
        }}
        onClick={() => {
          project?.().setActiveTool(ACTIVATE_TOOL.PAINT);
        }}
      >
        <kittl-icon-pencil class="icon" />
      </kittl-button>
      <kittl-button
        variant="ghost"
        class="icon-button tool-btn"
        classList={{
          active: project?.().activeTool() === ACTIVATE_TOOL.PAINT_SELECTION,
        }}
        onClick={() => {
          project?.().setActiveTool(ACTIVATE_TOOL.PAINT_SELECTION);
        }}
      >
        <kittl-icon-ratio-one-by-one class="icon" />
      </kittl-button>
      <kittl-button
        variant="ghost"
        class="icon-button tool-btn"
        classList={{
          active: project?.().activeTool() === ACTIVATE_TOOL.DELETE,
        }}
        onClick={() => {
          project?.().setActiveTool(ACTIVATE_TOOL.DELETE);
        }}
      >
        <kittl-icon-eraser class="icon" />
      </kittl-button>
    </div>
  );
};
