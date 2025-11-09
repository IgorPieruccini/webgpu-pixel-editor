import type { Accessor, Setter } from "solid-js";
import type { ACTIVATE_TOOL } from "./constant";

export type ProjectType = {
  setBrushColor: (_color: string) => void;
  getCurrentColor: Accessor<string>;
  activeTool: Accessor<number>;
  setActiveTool: Setter<number>;
};

export type ToolType = keyof typeof ACTIVATE_TOOL;
