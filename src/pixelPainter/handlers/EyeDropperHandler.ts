import { BYTES_PER_PIXEL, RGBA_OFFSET } from "../../constants";
import { alphaComposite, rgbaToHex } from "../utils";
import type { RGBA, Vec2 } from "../types";
import type { LayerHandler } from "./layerHandler";
import type { BrushHandler } from "./brushHandler";
import type { UniformBufferHandler } from "./uniformBuffersHandler";

export const createEyeDropperHandler = (
  layerHandler: LayerHandler,
  brushHandler: BrushHandler,
  uniformBufferHandler: UniformBufferHandler,
  gridSize: Vec2,
) => {
  const eyeDropAtCell = (pos: Vec2) => {
    if (pos.x < 0 || pos.x >= gridSize.x || pos.y < 0 || pos.y >= gridSize.y) {
      return;
    }

    const index = (pos.y * gridSize.x + pos.x) * BYTES_PER_PIXEL;
    let currentColor: RGBA = { r: 0, g: 0, b: 0, a: 0 };

    for (const layer of layerHandler.getList()) {
      if (!layer.display) {
        continue;
      }

      const buffer = layerHandler.getBufferById(layer.id);
      if (!buffer) {
        continue;
      }

      const alpha =
        (buffer[index + RGBA_OFFSET.ALPHA] / 255) *
        Math.max(0, Math.min(1, layer.opacity));

      if (alpha <= 0) {
        continue;
      }

      const sourceColor: RGBA = {
        r: buffer[index + RGBA_OFFSET.RED],
        g: buffer[index + RGBA_OFFSET.GREEN],
        b: buffer[index + RGBA_OFFSET.BLUE],
        a: alpha,
      };

      currentColor =
        currentColor.a === 0
          ? sourceColor
          : alphaComposite(sourceColor, currentColor);
    }

    const hex = rgbaToHex(currentColor);
    brushHandler.setColor(hex);
    uniformBufferHandler.updateSelectedColor(brushHandler.getSelectedColor());
  };

  return {
    eyeDropAtCell,
  };
};
