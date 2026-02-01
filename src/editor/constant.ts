import type { PixelPainterMethods } from "../pixelPainter/types";

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
  DELETE: 2,
};

export const INITIAL_PIXEL_PAINTER: PixelPainterMethods = {
  layer: {
    add: () => "",
    remove: (id: string) => id,
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
    duplicate: (id: string) => id,
    setLayerBuffer: () => {},
    buffers: new Map<string, Uint8Array<ArrayBuffer>>(),
    load: () => Promise.resolve(),
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
  },
  render: {
    draw: () => {},
    setCanvasSize: () => {},
    setPan: () => {},
    setZoom: () => {},
    setCellPos: () => {},
    setSelectedCellsPosition: () => {},
    setSelectedCellsSize: () => {},
    getZoom: () => 1,
    getCellPosition: () => ({ x: 0, y: 0 }),
    getPan: () => ({ x: 0, y: 0 }),
    getSelectedCellsRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
    setSelectionTool: () => {},
    isSelectionToolEnabled: () => false,
  },
};
