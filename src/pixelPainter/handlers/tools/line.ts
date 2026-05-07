import { BYTES_PER_PIXEL, RGBA_OFFSET } from "../../../constants";
import type { Vec2 } from "../../../editor/types";
import type { UniformBufferHandler } from "../../uniformBuffersHandler";
import { numberToRGBA, rgbaToHex } from "../../utils";
import type { BrushHandler } from "../brushHandler";
import type { HistoryChangeHandler } from "../historyChangeHandler";
import type { LayerHandler } from "../layerHandler";

export type Line = {
  a: Vec2;
  b: Vec2;
};

/**
 * Creates a line handler for a given grid size.
 * Provides a method to determine which pixels should be painted to represent a line.
 *
 * @param gridSize - The size of the grid (width and height).
 * @returns An object with the getPixelToPaint method.
 */
export const createLineHandler = (
  gridSize: Vec2,
  uniformBufferHandler: UniformBufferHandler,
  layerHandler: LayerHandler,
  brushHandler: BrushHandler,
  historyChangeHandler: HistoryChangeHandler,
) => {
  /**
   * Calculates the set of pixel indices that should be painted to represent the given line.
   *
   * @param line - The line defined by two points (a and b).
   * @returns A set of pixel indices to paint.
   */
  const getPixelToPaint = (line: Line) => {
    const pixelsToPaint: Set<number> = new Set<number>();

    const dx = line.b.x - line.a.x;
    const dy = line.b.y - line.a.y;

    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) {
      // Single point
      const x = Math.round(line.a.x);
      const y = Math.round(line.a.y);
      if (x >= 0 && x < gridSize.x && y >= 0 && y < gridSize.y) {
        pixelsToPaint.add(y * gridSize.x + x);
      }
      return pixelsToPaint;
    }

    const xInc = dx / steps;
    const yInc = dy / steps;

    let x = line.a.x;
    let y = line.a.y;

    for (let i = 0; i <= steps; i++) {
      const xi = Math.round(x);
      const yi = Math.round(y);
      if (xi >= 0 && xi < gridSize.x && yi >= 0 && yi < gridSize.y) {
        pixelsToPaint.add(yi * gridSize.x + xi);
      }
      x += xInc;
      y += yInc;
    }

    return pixelsToPaint;
  };

  const setStartLinePosition = (cell: Vec2) => {
    uniformBufferHandler.setLineStartPosition(cell);
  };

  const resetStartLinePosition = () => {
    uniformBufferHandler.resetStartLinePosition();
  };

  const draw = (currentCell: Vec2) => {
    const startCell = uniformBufferHandler.getStartLinePosition();

    const cellsToPaint = getPixelToPaint({
      a: startCell,
      b: currentCell,
    });

    const color = brushHandler.getSelectedColor("number");

    const rgba = numberToRGBA(color);
    const hex = rgbaToHex(rgba);

    const r = (hex >>> 24) & 0xff;
    const g = (hex >>> 16) & 0xff;
    const b = (hex >>> 8) & 0xff;
    const a = hex & 0xff;

    const currentBuffer = layerHandler.getCurrentBuffer();

    for (const pixelIndex of cellsToPaint) {
      const bitIndex = pixelIndex * BYTES_PER_PIXEL;
      currentBuffer[bitIndex + RGBA_OFFSET.RED] = r;
      currentBuffer[bitIndex + RGBA_OFFSET.GREEN] = g;
      currentBuffer[bitIndex + RGBA_OFFSET.BLUE] = b;
      currentBuffer[bitIndex + RGBA_OFFSET.ALPHA] = a;
    }

    layerHandler.saveCurrentBuffer();
    historyChangeHandler.addAction({ paintedPixels: cellsToPaint });
    layerHandler.makeCurrentLayerDirty();
  };

  return {
    getPixelToPaint,
    setStartLinePosition,
    resetStartLinePosition,
    draw,
  };
};
