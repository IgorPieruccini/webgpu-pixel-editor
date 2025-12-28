import type { Setter } from "solid-js";
import type { PixelPainterMethods } from "../pixelPainter/types";

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
  DELETE: 2,
};

export const INITIAL_PIXEL_PAINTER: PixelPainterMethods = {
  layer: {
    add: () => {},
    remove: () => {},
    toggleDisplay: () => {},
    sort: () => {},
    rename: () => {},
    getList: () => [],
    select: () => {},
    getActive: () => ({
      name: "",
      opacity: 1,
      display: true,
      id: "",
    }),
    setOpacity: () => {},
  },
  drawFrame: () => {},
  paintPixel: () => {},
  deletePixel: () => {},
  setBrushColor: () => {},
  getColorFrom: () => 0,
  getCurrentColor: () => "",
  getBrushOpacity: () => 100,
  setBrushOpacity: (() => {}) as unknown as Setter<number>,
};
