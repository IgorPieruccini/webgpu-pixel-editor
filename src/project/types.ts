import type { Accessor } from "solid-js";
import type { ACTIVATE_TOOL } from "./constant";

export type ProjectType = {
  setBrushColor: (_color: string) => void;
  getCurrentColor: Accessor<string>;
};

export type ToolType = keyof typeof ACTIVATE_TOOL;
