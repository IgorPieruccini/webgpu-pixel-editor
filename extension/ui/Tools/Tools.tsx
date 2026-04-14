import "@kittl/ui/Button";
import "@kittl/ui/Icons/pencil";
import "@kittl/ui/Icons/ratioOneByOne";
import "@kittl/ui/Icons/eraser";
import "@kittl/ui/Icons/sliders";
import "@kittl/ui/Icons/plus";
import { createSignal } from "solid-js";
import { API } from "../../../src/lib";
import { ACTIVATE_TOOL } from "../../../src/editor/constant";
import { useEditor } from "../../../src/editor/editortContext";
import { ColorPicker } from "./ColorPicker";
import "./tools.css";

export const Tools = () => {
  const project = useEditor();
  const brush = API.brush();
  const layers = API.layers();
  const [showBrushThickness, setShowBrushThickness] = createSignal(false);

  const onBrushChangeThickness = (e: InputEvent) => {
    const target = e.target as HTMLInputElement | null;
    if (!target) {
      return;
    }

    brush().setThickness(target.valueAsNumber);
  };

  return (
    <div id="tools">
      <div
        classList={{
          "brush-thickness-popover": true,
          open: showBrushThickness(),
        }}
      >
        <input
          class="brush-thickness-input"
          type="range"
          min={1}
          max={100}
          value={brush().getThickness()}
          onInput={onBrushChangeThickness}
        />
      </div>

      <ColorPicker />

      <kittl-button
        variant="ghost"
        class="icon-button tool-btn"
        classList={{
          active: showBrushThickness(),
        }}
        onClick={() => {
          setShowBrushThickness(!showBrushThickness());
        }}
      >
        <kittl-icon-sliders class="icon" />
      </kittl-button>

      <hr class="tools-separator" />

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

      <hr class="tools-separator" />

      <kittl-button
        variant="ghost"
        class="icon-button tool-btn"
        onClick={() => {
          layers().add();
        }}
      >
        <kittl-icon-plus class="icon" />
      </kittl-button>
    </div>
  );
};
