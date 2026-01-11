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

  const [_getSelectedColor, _setSelectedColor] = createSignal(0xff00ff);
  const [getOpacity, setOpacity] = createSignal(100);
  const [getThickness, setThickness] = createSignal(1);
  const [getDefaultThickness, setDefaultThickness] = createSignal<
    null | number
  >(null);

  const setColor = (_color: number | string) => {
    if (typeof _color === "string") {
      _setSelectedColor(parseInt(_color.replace("#", ""), 16));
    }

    if (typeof _color === "number") {
      _setSelectedColor(_color);
    }
  };

  const getColor = (pos: Vec2, format: "number" | "string" = "number") => {
    const i = pos.x + pos.y * gridSize.x;
    const color = layerHandler.getCurrentBuffer()[i];
    if (format === "string") {
      return `#${(color >> 0).toString(16).padStart(6, "0")}`;
    }
    return color;
  };

  const composeColors = (index: number) => {
    let destColor = layerHandler.getCurrentBuffer().at(index) ?? 0xffffffff;

    const destRGBA =
      destColor === 0
        ? { r: 255, g: 255, b: 255, a: 0 }
        : numberToRGBA(destColor);

    const sourceRGBA = numberToRGBA(_getSelectedColor());
    sourceRGBA.a = getOpacity() / 100;

    const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

    const blendedHex = rgbaToHex(blendedRGBA);

    layerHandler.getCurrentBuffer()[index] = blendedHex;

    currentPaintedPixels.add(index);
  };

  const paint = (cellPos: { x: number; y: number }) => {
    const thickness = getDefaultThickness() ?? getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x;
        const _y = cellPos.y + y;
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
    const thickness = getDefaultThickness() ?? getThickness();

    for (let y = -thickness; y <= thickness; y++) {
      for (let x = -thickness; x <= thickness; x++) {
        const _x = cellPos.x + x;
        const _y = cellPos.y + y;
        const index = _x + _y * gridSize.x;

        if (currentPaintedPixels.has(index)) {
          continue;
        }

        const distance = Math.hypot(cellPos.x - _x, cellPos.y - _y);
        if (distance < thickness) {
          let destColor =
            layerHandler.getCurrentBuffer().at(index) ?? 0xffffffff;

          const destRGBA =
            destColor === 0
              ? { r: 255, g: 255, b: 255, a: 0 }
              : numberToRGBA(destColor);

          if (destRGBA.a === 0) {
            continue;
          }

          const opacity = destRGBA.a - Math.fround(getOpacity() / 100);
          const resultRGBA = { ...destRGBA, a: opacity >= 0 ? opacity : 0 };

          if (resultRGBA.a === 0) {
            layerHandler.getCurrentBuffer()[index] = 0;
            currentPaintedPixels.add(index);
            continue;
          }

          const blendedHex = rgbaToHex(resultRGBA);
          layerHandler.getCurrentBuffer()[index] = blendedHex;
          currentPaintedPixels.add(index);
        }
      }
    }
  };

  const setSelectedColor = (color: number | string) => {
    if (typeof color === "string") {
      _setSelectedColor(parseInt(color.replace("#", ""), 16));
      return;
    }

    _setSelectedColor(color);
  };

  const getSelectedColor = (format: "number" | "string" = "number") => {
    if (format === "string") {
      return `#${(_getSelectedColor() >> 0).toString(16).padStart(6, "0")}`;
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
    getDefaultThickness,
    setDefaultThickness,
  };
};
