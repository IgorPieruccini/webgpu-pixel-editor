import type { Vec2 } from "../../../editor/types";

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
export const createLineHandler = (gridSize: Vec2) => {
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

  return {
    getPixelToPaint,
  };
};
