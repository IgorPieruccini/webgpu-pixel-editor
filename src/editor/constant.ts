import { INITIAL_PIXEL_PAINTER } from "../pixelPainter/constants";
import type { EditorType } from "./editor";

export type ActiveToolType = keyof typeof ACTIVATE_TOOL;
export type ActiveToolValue = (typeof ACTIVATE_TOOL)[ActiveToolType];

export const ACTIVATE_TOOL = {
  PAINT: 0,
  PAINT_SELECTION: 1,
  DELETE: 2,
  LINE: 3,
  BUCKET_PAINT: 4,
  EYE_DROPPER: 5,
  MOVE_LAYER: 6,
};

const createInitialCanvas = (): HTMLCanvasElement => {
  if (typeof document !== "undefined") {
    return document.createElement("canvas");
  }

  return {} as HTMLCanvasElement;
};

export const INITIAL_EDITOR: EditorType = {
  canvas: createInitialCanvas(),
  createNewPainter: async () => INITIAL_PIXEL_PAINTER,
  activeTool: () => ACTIVATE_TOOL.PAINT,
  setActiveTool: () => {},
};
