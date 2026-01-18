/// <reference types="@webgpu/types" />

import { createLayerHandler } from "./handlers/layerHandler";
import { createBrushHandler } from "./handlers/brushHandler";
import { createRenderHandler } from "./handlers/renderHandler";
import type { Vec2 } from "../editor/types";

export const pixelPainter = async (
  projectName: string,
  gridSize: Vec2,
  canvasSize: Vec2,
) => {
  const canvas = document.querySelector<HTMLCanvasElement>("#" + "main-canvas");
  if (!canvas) {
    throw new Error("Could not find main canvas");
  }

  const layerHandler = await createLayerHandler(projectName, gridSize);
  const brush = createBrushHandler(layerHandler, gridSize);
  const { render } = await createRenderHandler(
    layerHandler,
    brush,
    gridSize,
    canvasSize,
  );

  return {
    layer: {
      add: layerHandler.add,
      remove: layerHandler.remove,
      duplicate: layerHandler.duplicate,
      sort: layerHandler.sort,
      rename: layerHandler.rename,
      toggleDisplay: layerHandler.toggleDisplay,
      select: layerHandler.select,
      setOpacity: layerHandler.setOpacity,
      getList: layerHandler.getList,
      getActive: layerHandler.getActive,
      getBufferById: layerHandler.getBufferById,
      setLayerBuffer: layerHandler.setLayerBuffer,
      buffers: layerHandler.buffers,
    },
    brush: {
      setColor: brush.setColor,
      getColor: brush.getColor,
      paint: brush.paint,
      erase: brush.erase,
      getOpacity: brush.getOpacity,
      setOpacity: brush.setOpacity,
      getSelectedColor: brush.getSelectedColor,
      setSelectedColor: brush.setSelectedColor,
      getThickness: brush.getThickness,
      setThickness: brush.setThickness,
      getDefaultThickness: brush.getDefaultThickness,
      setDefaultThickness: brush.setDefaultThickness,
    },
    render,
  };
};
