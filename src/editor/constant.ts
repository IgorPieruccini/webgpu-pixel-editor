import type { Setter } from "solid-js";
import type { PixelPainterReturnType } from "../pixelPainter/types";

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
  DELETE: 2,
};

export const INITIAL_PIXEL_PAINTER: PixelPainterReturnType = {
  drawFrame: () => {},
  paintPixel: () => {},
  deletePixel: () => {},
  setBrushColor: () => {},
  getColorFrom: () => 0,
  getCurrentColor: () => "",
  addLayer: () => {},
  removeLayer: () => {},
  toggleLayerDisplay: () => {},
  sortLayers: () => {},
  renameLayer: () => {},
  getLayers: () => [],
  selectLayer: () => {},
  getActiveLayer: () => ({
    name: "",
    opacity: 1,
    display: true,
    id: "",
  }),
  setLayerOpacity: () => {},
  getBrushOpacity: () => 100,
  setBrushOpacity: (() => {}) as unknown as Setter<number>,
};
