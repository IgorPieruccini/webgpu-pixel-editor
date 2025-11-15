import type { PixelPainterReturnType } from "../pixelPainter/types";

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
};

export const INITIAL_PIXEL_PAINTER: PixelPainterReturnType = {
  drawFrame: () => {},
  paintPixel: () => {},
  setBrushColor: () => {},
  getColorFrom: () => 0,
  getCurrentColor: () => "",
  addLayer: () => {},
};
