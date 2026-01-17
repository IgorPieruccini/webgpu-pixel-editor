import type { Vec2 } from "./editor/types";

export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const calculateZoomFromGridAndCanvasSize = (
  gridSize: Vec2,
  canvasSize: Vec2,
) => {
  if (gridSize.x > gridSize.y) {
    return canvasSize.x / canvasSize.y;
  } else {
    return gridSize.x / gridSize.y;
  }
};
