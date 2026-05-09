import { BYTES_PER_PIXEL, RGBA_OFFSET } from "../../../constants";
import type { Vec2 } from "../../../lib";
import { numberToRGBA } from "../../utils";
import type { BrushHandler } from "../brushHandler";
import type { HistoryChangeHandler } from "../historyChangeHandler";
import type { LayerHandler } from "../layerHandler";

export const createBucketPaintHandler = (
  gridSize: Vec2,
  layerHandler: LayerHandler,
  brushHandler: BrushHandler,
  historyChangeHandler: HistoryChangeHandler,
) => {
  const floodFill = (cell: Vec2) => {
    const getIndex = (pos: Vec2) =>
      (pos.y * gridSize.x + pos.x) * BYTES_PER_PIXEL;

    const startIndex = getIndex(cell);

    const currentBuffer = layerHandler.getCurrentBuffer();

    const targetColor = [
      currentBuffer[startIndex + RGBA_OFFSET.RED],
      currentBuffer[startIndex + RGBA_OFFSET.GREEN],
      currentBuffer[startIndex + RGBA_OFFSET.BLUE],
      currentBuffer[startIndex + RGBA_OFFSET.ALPHA],
    ];

    const currentColor = brushHandler.getSelectedColor();

    const { r, g, b, a } = numberToRGBA(currentColor);

    // Avoid infinity fill
    if (
      targetColor[0] === r &&
      targetColor[1] === g &&
      targetColor[2] === b &&
      targetColor[3] === a * 255
    ) {
      return;
    }

    const stack: Vec2[] = [cell];
    const paintedPixels = new Set<number>();

    while (stack.length > 0) {
      const cell = stack.pop();
      if (!cell) {
        continue;
      }

      const { x, y } = cell;

      // Check if is outside inside bounds
      if (x < 0 || x >= gridSize.x || y < 0 || y >= gridSize.y) {
        continue;
      }

      const i = getIndex(cell);

      // Only paint pixels that still match the original target color.
      if (
        targetColor[0] !== currentBuffer[i + RGBA_OFFSET.RED] ||
        targetColor[1] !== currentBuffer[i + RGBA_OFFSET.GREEN] ||
        targetColor[2] !== currentBuffer[i + RGBA_OFFSET.BLUE] ||
        targetColor[3] !== currentBuffer[i + RGBA_OFFSET.ALPHA]
      ) {
        continue;
      }

      // Paint cell
      currentBuffer[i + RGBA_OFFSET.RED] = r;
      currentBuffer[i + RGBA_OFFSET.GREEN] = g;
      currentBuffer[i + RGBA_OFFSET.BLUE] = b;
      currentBuffer[i + RGBA_OFFSET.ALPHA] = a * 255;

      paintedPixels.add(i);

      //add neighbors to stack
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    layerHandler.makeCurrentLayerDirty();
    layerHandler.saveCurrentBuffer();
    historyChangeHandler.addAction({ paintedPixels });
  };

  return {
    floodFill,
  };
};
