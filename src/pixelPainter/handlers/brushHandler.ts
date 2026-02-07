import { createSignal } from "solid-js";
import type { Vec2 } from "../../editor/types";
import type { LayerHandler } from "./layerHandler";
import { alphaComposite, numberToRGBA, rgbaToHex } from "../utils";
import type { HistoryChangeHandler } from "./historyChangeHandler";
import { BYTES_PER_PIXEL, RGBA_OFFSET } from "../../constants";

export type BrushHandler = ReturnType<typeof createBrushHandler>;

export const createBrushHandler = (
  layerHandler: LayerHandler,
  historyChangeHandler: HistoryChangeHandler,
  gridSize: Vec2,
) => {
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas");
  if (!canvas) {
    throw new Error("Could not find main canvas");
  }

  const currentPaintedPixels = new Set<number>();
  canvas.addEventListener("mouseup", () => {
    clearCurrentPaintedPixels();
    layerHandler.saveCurrentBuffer();
    historyChangeHandler.addAction();
  });

  // Default color: magenta RGB (0xff00ff), will be converted to ABGR when set
  const [_getSelectedColor, _setSelectedColor] = createSignal(0xff00ff);
  const [getOpacity, setOpacity] = createSignal(100);
  const [getThickness, setThickness] = createSignal(1);

  const clearCurrentPaintedPixels = () => {
    currentPaintedPixels.clear();
  };

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
    const _r = curBuffer[index + RGBA_OFFSET.RED];
    const _g = curBuffer[index + RGBA_OFFSET.GREEN];
    const _b = curBuffer[index + RGBA_OFFSET.BLUE];
    const _a = curBuffer[index + RGBA_OFFSET.ALPHA] / 255;

    const destRGBA = { r: _r, g: _g, b: _b, a: _a };

    const sourceRGBA = numberToRGBA(_getSelectedColor());
    sourceRGBA.a = getOpacity() / 100;

    const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

    const rgba = rgbaToHex(blendedRGBA);

    const r = (rgba >>> 24) & 0xff;
    const g = (rgba >>> 16) & 0xff;
    const b = (rgba >>> 8) & 0xff;
    const a = rgba & 0xff;

    layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.RED] = r;
    layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.GREEN] = g;
    layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.BLUE] = b;
    layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.ALPHA] = a;

    currentPaintedPixels.add(index);
  };

  const paint = (
    cellPos: { x: number; y: number },
    defaultThickness?: number,
    forcePaint = false,
  ): boolean => {
    // We use this variable to check if we applied paint in at least one pixel,
    // so we can decide whether to add the paint action to the history or not
    let hasAppliedPaint = false;
    const thickness = defaultThickness ?? getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x * BYTES_PER_PIXEL;
        const _y = cellPos.y + y * BYTES_PER_PIXEL;
        const i = _x + _y * gridSize.x;

        if (!forcePaint && currentPaintedPixels.has(i)) {
          continue;
        }

        const distance = Math.hypot(cellPos.x - _x, cellPos.y - _y);
        if (distance < thickness) {
          composeColors(i);
          hasAppliedPaint = true;
        }
      }
    }
    return hasAppliedPaint;
  };

  const erase = (cellPos: { x: number; y: number }) => {
    const thickness = getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x * BYTES_PER_PIXEL;
        const _y = cellPos.y + y * BYTES_PER_PIXEL;
        const index = _x + _y * gridSize.x;

        if (currentPaintedPixels.has(index)) {
          continue;
        }

        const distance = Math.hypot(cellPos.x - _x, cellPos.y - _y);
        if (distance < thickness) {
          const curBuffer = layerHandler.getCurrentBuffer();
          const _r = curBuffer[index + RGBA_OFFSET.RED];
          const _g = curBuffer[index + RGBA_OFFSET.GREEN];
          const _b = curBuffer[index + RGBA_OFFSET.BLUE];
          const _a = curBuffer[index + RGBA_OFFSET.ALPHA] / 255;

          const destRGBA = { r: _r, g: _g, b: _b, a: _a };

          if (destRGBA.a === 0) {
            continue;
          }

          const opacity = destRGBA.a - Math.fround(getOpacity() / 100);
          const resultRGBA = { ...destRGBA, a: opacity >= 0 ? opacity : 0 };

          if (resultRGBA.a === 0) {
            layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.ALPHA] = 0;
            currentPaintedPixels.add(index);
            continue;
          }

          const blendedHex = rgbaToHex(resultRGBA);
          layerHandler.getCurrentBuffer()[index + RGBA_OFFSET.ALPHA] =
            blendedHex;
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
    clearCurrentPaintedPixels,
  };
};
