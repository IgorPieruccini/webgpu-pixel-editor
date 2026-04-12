import {
  BiRegularBrush,
  BiRegularEraser,
  BiSolidBrush,
  BiSolidEraser,
} from "solid-icons/bi";
import { BsBrushFill, BsBrush } from "solid-icons/bs";
import { FiMenu } from "solid-icons/fi";

import "./index.css";
import { useEditor } from "../../editor/editortContext";
import { ACTIVATE_TOOL } from "../../editor/constant";
import { MenuOptions } from "./menu/menuOptions";
import { createSignal } from "solid-js";

export const Tools = () => {
  const project = useEditor();
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div id="tools">
      <button id="menu" class="menu-btn" onClick={() => setIsOpen(!isOpen())}>
        <FiMenu />
      </button>
      {isOpen() ? <MenuOptions /> : null}
      <hr />
      <button
        class="menu-btn"
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
      </button>
      <button
        class="menu-btn"
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
      </button>
      <button
        class="menu-btn"
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
      </button>
    </div>
  );
};
