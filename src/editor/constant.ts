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
    getBufferById: () => undefined,
    duplicate: () => {},
    setLayerBuffer: () => {},
    buffers: new Map<string, Uint32Array<ArrayBuffer>>(),
  },
  brush: {
    setColor: () => {},
    getColor: () => 0,
    paint: () => {},
    erase: () => {},
    getOpacity: () => 1,
    setOpacity: () => {},
    getSelectedColor: () => 0,
    setSelectedColor: () => {},
    getThickness: () => 1,
    setThickness: () => {},
    getDefaultThickness: () => 1,
    setDefaultThickness: () => {},
  },
  render: () => {},
};
