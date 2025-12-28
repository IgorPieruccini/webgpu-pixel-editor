import type { Accessor, Setter } from "solid-js";
import type { ACTIVATE_TOOL } from "./constant";
import type { PixelPainterMethods } from "../pixelPainter/types";

export type EditorContextType = {
  activeTool: Accessor<number>;
  setActiveTool: Setter<number>;
  createNewPainter: (name: string) => Promise<PixelPainterMethods>;
};

export type ToolType = keyof typeof ACTIVATE_TOOL;

export type Vec2 = { x: number; y: number };
export type Vec4 = { x: number; y: number; z: number; w: number };
