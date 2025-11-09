import { BiRegularBrush, BiSolidBrush } from "solid-icons/bi";
import { BsBrushFill, BsBrush } from "solid-icons/bs";

import "./index.css";
import { useProject } from "../../project/projectContext";
import { ACTIVATE_TOOL } from "../../project/constant";

export const Tools = () => {
  const project = useProject();

  return (
    <div id="tools">
      <button
        class={project?.().activeTool() === ACTIVATE_TOOL.PAINT ? "active" : ""}
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
        class={
          project?.().activeTool() === ACTIVATE_TOOL.PAINT_SELECTION
            ? "active"
            : ""
        }
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
