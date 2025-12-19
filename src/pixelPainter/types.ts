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
  removeLayer: (id: string) => void;
  sortLayers: (dragged: string, dropped: string) => void;
  renameLayer: (name: string) => void;
  getLayers: Accessor<Layers>;
  selectLayer: (layerId: string) => void;
  getActiveLayer: Accessor<string>;
};

export type Layer = {
  id: string;
  name: string;
};

export type Layers = Layer[];
