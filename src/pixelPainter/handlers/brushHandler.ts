import { createSignal } from "solid-js";
import type { Vec2 } from "../../editor/types";
import type { LayerHandler } from "./layerHandler";
import { alphaComposite, numberToRGBA, rgbaToHex } from "../utils";

export type BrushHandler = ReturnType<typeof createBrushHandler>;

export const createBrushHandler = (
  layerHandler: LayerHandler,
  gridSize: number,
) => {
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas");
  if (!canvas) {
    throw new Error("Could not find main canvas");
  }

  const currentPaintedPixels = new Set<number>();
  canvas.addEventListener("mouseup", () => {
    currentPaintedPixels.clear();
  });

  const [_getSelectedColor, _setSelectedColor] = createSignal(0xff00ff);
  const [getOpacity, setOpacity] = createSignal(100);

  const setColor = (_color: number | string) => {
    if (typeof _color === "string") {
      _setSelectedColor(parseInt(_color.replace("#", ""), 16));
    }

    if (typeof _color === "number") {
      _setSelectedColor(_color);
    }
  };

  const getColor = (pos: Vec2, format: "number" | "string" = "number") => {
    const i = pos.x + pos.y * gridSize;
    const color = layerHandler.getCurrentBuffer()[i];
    if (format === "string") {
      return `#${(color >> 0).toString(16).padStart(6, "0")}`;
    }
    return color;
  };

  const paint = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;

    if (currentPaintedPixels.has(arrayIndex)) {
      return;
    }

    let destColor =
      layerHandler.getCurrentBuffer().at(arrayIndex) ?? 0xffffffff;

    const destRGBA =
      destColor === 0
        ? { r: 255, g: 255, b: 255, a: 0 }
        : numberToRGBA(destColor);

    const sourceRGBA = numberToRGBA(_getSelectedColor());
    sourceRGBA.a = getOpacity() / 100;

    const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

    const blendedHex = rgbaToHex(blendedRGBA);

    layerHandler.getCurrentBuffer()[arrayIndex] = blendedHex;
    layerHandler.saveCurrentBuffer();

    currentPaintedPixels.add(arrayIndex);
  };

  const erase = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    layerHandler.getCurrentBuffer()[arrayIndex] = 0;
    layerHandler.saveCurrentBuffer();
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
  };
};
