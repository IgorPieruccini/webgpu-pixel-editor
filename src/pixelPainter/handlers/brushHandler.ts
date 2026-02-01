import { createSignal } from "solid-js";
import type { Vec2 } from "../../editor/types";
import type { LayerHandler } from "./layerHandler";
import { alphaComposite, numberToRGBA, rgbaToHex } from "../utils";

export type BrushHandler = ReturnType<typeof createBrushHandler>;

export const createBrushHandler = (
  layerHandler: LayerHandler,
  gridSize: Vec2,
) => {
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas");
  if (!canvas) {
    throw new Error("Could not find main canvas");
  }

  const currentPaintedPixels = new Set<number>();
  canvas.addEventListener("mouseup", () => {
    currentPaintedPixels.clear();
    layerHandler.saveCurrentBuffer();
  });

  // Default color: magenta RGB (0xff00ff), will be converted to ABGR when set
  const [_getSelectedColor, _setSelectedColor] = createSignal(0xff00ff);
  const [getOpacity, setOpacity] = createSignal(100);
  const [getThickness, setThickness] = createSignal(1);

  const setColor = (_color: number | string) => {
    if (typeof _color === "string") {
      const hex = parseInt(_color.replace("#", ""), 16);
      _setSelectedColor(hex);
    }

    if (typeof _color === "number") {
      _setSelectedColor(_color);
    }
  };

  const getColor = (pos: Vec2, format: "number" | "string" = "number") => {
    const i = pos.x + pos.y * gridSize.x;
    const color = layerHandler.getCurrentBuffer()[i];
    if (format === "string") {
      return `#${color.toString(16).padStart(6, "0")}`;
    }
    return color;
  };

  const composeColors = (index: number) => {
    index;
    const curBuffer = layerHandler.getCurrentBuffer();
    const _r = curBuffer[index + 0];
    const _g = curBuffer[index + 1];
    const _b = curBuffer[index + 2];
    const _a = curBuffer[index + 3] / 255;

    const destRGBA = { r: _r, g: _g, b: _b, a: _a };

    const sourceRGBA = numberToRGBA(_getSelectedColor());
    sourceRGBA.a = getOpacity() / 100;

    const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

    const rgba = rgbaToHex(blendedRGBA);

    const r = (rgba >>> 24) & 0xff;
    const g = (rgba >>> 16) & 0xff;
    const b = (rgba >>> 8) & 0xff;
    const a = rgba & 0xff;

    layerHandler.getCurrentBuffer()[index + 0] = r;
    layerHandler.getCurrentBuffer()[index + 1] = g;
    layerHandler.getCurrentBuffer()[index + 2] = b;
    layerHandler.getCurrentBuffer()[index + 3] = a;

    currentPaintedPixels.add(index);
  };

  const paint = (
    cellPos: { x: number; y: number },
    defaultThickness?: number,
  ) => {
    const thickness = defaultThickness ?? getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x * 4;
        const _y = cellPos.y + y * 4;
        const i = _x + _y * gridSize.x;

        if (currentPaintedPixels.has(i)) {
          continue;
        }

        const distance = Math.hypot(cellPos.x - _x, cellPos.y - _y);
        if (distance < thickness) {
          composeColors(i);
        }
      }
    }
  };

  const erase = (cellPos: { x: number; y: number }) => {
    const thickness = getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x * 4;
        const _y = cellPos.y + y * 4;
        const index = _x + _y * gridSize.x;

        if (currentPaintedPixels.has(index)) {
          continue;
        }

        const distance = Math.hypot(cellPos.x - _x, cellPos.y - _y);
        if (distance < thickness) {
          const curBuffer = layerHandler.getCurrentBuffer();
          const _r = curBuffer[index + 0];
          const _g = curBuffer[index + 1];
          const _b = curBuffer[index + 2];
          const _a = curBuffer[index + 3] / 255;

          const destRGBA = { r: _r, g: _g, b: _b, a: _a };

          if (destRGBA.a === 0) {
            continue;
          }

          const opacity = destRGBA.a - Math.fround(getOpacity() / 100);
          const resultRGBA = { ...destRGBA, a: opacity >= 0 ? opacity : 0 };

          if (resultRGBA.a === 0) {
            layerHandler.getCurrentBuffer()[index + 3] = 0;
            currentPaintedPixels.add(index);
            continue;
          }

          const blendedHex = rgbaToHex(resultRGBA);
          layerHandler.getCurrentBuffer()[index + 3] = blendedHex;
          currentPaintedPixels.add(index);
        }
      }
    }
  };

  const setSelectedColor = (color: number | string) => {
    if (typeof color === "string") {
      const hex = parseInt(color.replace("#", ""), 16);
      _setSelectedColor(hex);
      return;
    }

    _setSelectedColor(color);
  };

  const getSelectedColor = (format: "number" | "string" = "number") => {
    if (format === "string") {
      return `#${_getSelectedColor().toString(16).padStart(6, "0")}`;
    }

    return _getSelectedColor();
  };

  return {
    setColor,
    getColor,
    paint,
    erase,
    getOpacity,
    setOpacity,
    getSelectedColor,
    setSelectedColor,
    getThickness,
    setThickness,
  };
};
