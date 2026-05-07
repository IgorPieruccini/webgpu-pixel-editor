import type { Vec2 } from "../../../editor/types";
import { describe, expect, it } from "vitest";
import { createLineHandler } from "./line";

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
    const historyChangeHandler = {
      addAction: () => {},
    } as never;

    const lineHandler = createLineHandler(
      gridSize,
      uniformBufferHandler,
      layerHandler,
      brushHandler,
      historyChangeHandler,
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
