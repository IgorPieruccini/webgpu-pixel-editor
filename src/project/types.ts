import type { Accessor, Setter } from "solid-js";
import type { ACTIVATE_TOOL } from "./constant";

export type ProjectType = {
  setBrushColor: (_color: string) => void;
  getCurrentColor: Accessor<string>;
  activeTool: Accessor<number>;
  setActiveTool: Setter<number>;
  createNewPainter: (name: string) => Promise<void>;
};

export type ToolType = keyof typeof ACTIVATE_TOOL;

export type PixelPainterReturnType = {
  drawFrame: (
    cellPos: Vec2,
    pan: Vec2,
    zoom: number,
    selectedCells: Vec4,
  ) => void;
  paintPixel: (cellPos: Vec2) => void;
  setBrushColor: (color: number | string) => void;
  getColorFrom: (pos: Vec2) => number;
  getCurrentColor: Accessor<string>;
};

export type Vec2 = { x: number; y: number };
export type Vec4 = { x: number; y: number; z: number; w: number };
