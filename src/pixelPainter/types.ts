import type { Accessor } from "solid-js";
import type { Vec2, Vec4 } from "../editor/types";

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
  addLayer: () => void;
};

export type Layer = {
  id: string;
  name: string;
};

export type Layers = Layer[];
