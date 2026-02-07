import { createLayerHandler } from "./handlers/layerHandler";
import { createBrushHandler } from "./handlers/brushHandler";
import { createRenderHandler } from "./handlers/renderHandler";
import type { Vec2 } from "../editor/types";
import { createUniformBufferHandler } from "./uniformBuffersHandler";
import { createMiddlewareHandler } from "./handlers/middlewareHandler";
import { createHistoryChangeHandler } from "./handlers/historyChangeHandler";

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
  const historyChangeHandler = createHistoryChangeHandler(
    layerHandler,
    projectName,
    gridSize,
  );
  const brushHandler = createBrushHandler(
    layerHandler,
    historyChangeHandler,
    gridSize,
  );
  const uniformBufferHandler = createUniformBufferHandler(canvasSize, gridSize);
  const renderHandler = await createRenderHandler(
    layerHandler,
    uniformBufferHandler,
    gridSize,
  );

  const middlewareHandler = createMiddlewareHandler(
    brushHandler,
    uniformBufferHandler,
    renderHandler,
    layerHandler,
    historyChangeHandler,
  );

  middlewareHandler.loadLayers();

  return {
    layer: {
      add: middlewareHandler.addLayer,
      remove: middlewareHandler.removeLayer,
      duplicate: middlewareHandler.duplicateLayer,
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
      load: middlewareHandler.loadLayers,
      set: layerHandler.set,
    },
    brush: {
      setColor: brushHandler.setColor,
      getColor: brushHandler.getColor,
      paint: brushHandler.paint,
      erase: brushHandler.erase,
      getOpacity: brushHandler.getOpacity,
      setOpacity: brushHandler.setOpacity,
      getSelectedColor: brushHandler.getSelectedColor,
      setSelectedColor: brushHandler.setSelectedColor,
      getThickness: brushHandler.getThickness,
      setThickness: middlewareHandler.setBrushThickness,
    },
    render: {
      draw: renderHandler.draw,
      setZoom: uniformBufferHandler.updateZoom,
      setPan: uniformBufferHandler.updatePan,
      setCanvasSize: uniformBufferHandler.updateCanvasSize,
      setCellPos: uniformBufferHandler.updateCellPos,
      setSelectedCellsSize: uniformBufferHandler.updateSelectedCellsSize,
      setSelectedCellsPosition:
        uniformBufferHandler.updateSelectedCellsPosition,
      getZoom: uniformBufferHandler.zoom,
      getCellPosition: uniformBufferHandler.cellPosition,
      getPan: uniformBufferHandler.pan,
      getSelectedCellsRect: uniformBufferHandler.selectedCellsRect,
      setSelectionTool: uniformBufferHandler.setSelectionTool,
      isSelectionToolEnabled: uniformBufferHandler.isSelectionToolEnabled,
    },
    history: {
      undo: historyChangeHandler.undo,
      redo: historyChangeHandler.redo,
    },
  };
};
