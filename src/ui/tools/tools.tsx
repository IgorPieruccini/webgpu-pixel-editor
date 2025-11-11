import { BiRegularBrush, BiSolidBrush } from "solid-icons/bi";
import { BsBrushFill, BsBrush } from "solid-icons/bs";
import { FiMenu } from "solid-icons/fi";

import "./index.css";
import { useProject } from "../../project/projectContext";
import { ACTIVATE_TOOL } from "../../project/constant";
import { MenuOptions } from "./menu/menuOptions";
import { createSignal } from "solid-js";

export const Tools = () => {
  const project = useProject();
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div id="tools">
      <button id="menu" class="menu-btn" onClick={() => setIsOpen(!isOpen())}>
        <FiMenu />
      </button>
      {isOpen() ? <MenuOptions /> : null}
      <br />
      <button
        class={`${
          project?.().activeTool() === ACTIVATE_TOOL.PAINT ? "active" : ""
        } menu-btn`}
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
        class={`${
          project?.().activeTool() === ACTIVATE_TOOL.PAINT_SELECTION
            ? "active"
            : ""
        } menu-btn`}
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
    </div>
  );
};
