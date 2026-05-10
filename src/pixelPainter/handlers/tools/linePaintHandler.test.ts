import { describe, expect, it } from "vitest";
import { createLinePaintHandler } from "./linePaintHanlder";
import type { Vec2 } from "../../types";

describe("Line", () => {
  it("getPixelsToPaint", () => {
    const gridSize: Vec2 = { x: 100, y: 100 };
    const uniformBufferHandler = {
      setLineStartPosition: () => {},
      resetStartLinePosition: () => {},
      getStartLinePosition: () => ({ x: 0, y: 0 }),
    } as never;
    const layerHandler = {
      saveCurrentBuffer: () => {},
    } as never;
    const brushHandler = {
      getThickness: () => 1,
      paint: () => true,
      clearCurrentPaintedPixels: () => {},
    } as never;

    const lineHandler = createLinePaintHandler(
      gridSize,
      uniformBufferHandler,
      layerHandler,
      brushHandler,
    );

    const line = lineHandler.getPixelToPaint({
      a: {
        x: 0,
        y: 0,
      },
      b: {
        x: 8,
        y: 2,
      },
    });

    console.log(line);

    expect(line).not.toBeUndefined();
  });
});
