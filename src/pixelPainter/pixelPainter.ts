import { createLayerHandler } from "./handlers/layerHandler";
import { createBrushHandler } from "./handlers/brushHandler";
import { createRenderHandler } from "./handlers/renderHandler";
import { createUniformBufferHandler } from "./handlers/uniformBuffersHandler";
import { createMiddlewareHandler } from "./handlers/middlewareHandler";
import { createHistoryChangeHandler } from "./handlers/historyChangeHandler/historyChangeHandler";
import { createExportHandler } from "./handlers/exportHandler";
import { createLayerPreview } from "./layerPreview";
import { LAYER_PREVIEW_SIZE } from "../constants";
import { calculateZoomFromGridAndCanvasSize } from "../utils";
import { createColorPaletteHandler } from "./handlers/colorPaletteHandler";
import { createLinePaintHandler } from "./handlers/tools/linePaintHanlder";
import { createBucketPaintHandler } from "./handlers/tools/bucketPaintHandler";
import type { Vec2 } from "../lib";
import { createEyeDropperHandler } from "./handlers/EyeDropperHandler";

export const pixelPainter = async (
  projectName: string,
  gridSize: Vec2,
  canvasSize: Vec2,
  canvas: HTMLCanvasElement,
) => {
  const layerHandler = await createLayerHandler(projectName, gridSize);
  const colorPaletteHandler = createColorPaletteHandler(layerHandler);

  const uniformBufferHandler = createUniformBufferHandler(canvasSize, gridSize);

  const renderHandler = await createRenderHandler(
    layerHandler,
    uniformBufferHandler,
    gridSize,
    canvas,
  );

  const layerPreview = await createLayerPreview(
    layerHandler,
    gridSize,
    calculateZoomFromGridAndCanvasSize(gridSize, LAYER_PREVIEW_SIZE),
  );

  const historyChangeHandler = createHistoryChangeHandler(
    layerHandler,
    renderHandler,
    projectName,
    gridSize,
  );

  const brushHandler = createBrushHandler(
    layerHandler,
    historyChangeHandler,
    colorPaletteHandler,
    gridSize,
    canvas,
  );

  const eyeDropperHandler = createEyeDropperHandler(
    layerHandler,
    brushHandler,
    uniformBufferHandler,
    gridSize,
  );

  const lineHandler = createLinePaintHandler(
    gridSize,
    uniformBufferHandler,
    layerHandler,
    brushHandler,
  );

  const bucketPaint = createBucketPaintHandler(
    gridSize,
    layerHandler,
    brushHandler,
    historyChangeHandler,
  );

  const middlewareHandler = createMiddlewareHandler(
    brushHandler,
    uniformBufferHandler,
    renderHandler,
    layerHandler,
    historyChangeHandler,
    layerPreview,
  );

  const exportHandler = createExportHandler(
    projectName,
    gridSize,
    layerHandler,
  );

  middlewareHandler.loadTextureLayers();
  historyChangeHandler.addSnapshot();
  colorPaletteHandler.calculateColorPalette();

  return {
    layer: {
      add: middlewareHandler.addLayer,
      remove: middlewareHandler.removeLayer,
      duplicate: middlewareHandler.duplicateLayer,
      sort: layerHandler.sort,
      rename: layerHandler.rename,
      toggleDisplay: layerHandler.toggleDisplay,
      select: layerHandler.select,
      setOpacity: middlewareHandler.setOpacity,
      getList: layerHandler.getList,
      getActive: layerHandler.getActive,
      getBufferById: layerHandler.getBufferById,
      setLayerBuffer: layerHandler.setLayerBuffer,
      buffers: layerHandler.buffers,
      load: middlewareHandler.loadLayers,
      set: layerHandler.set,
    },
    brush: {
      setColor: middlewareHandler.setBrushColor,
      getColor: brushHandler.getColor,
      paint: brushHandler.paint,
      erase: brushHandler.erase,
      getOpacity: brushHandler.getOpacity,
      setOpacity: middlewareHandler.setBrushOpacity,
      getSelectedColor: brushHandler.getSelectedColor,
      getThickness: brushHandler.getThickness,
      setThickness: middlewareHandler.setBrushThickness,
    },
    line: {
      setLineStartPosition: lineHandler.setStartLinePosition,
      resetLineStartPosition: lineHandler.resetStartLinePosition,
      draw: lineHandler.draw,
    },
    bucketPaint: {
      paint: bucketPaint.floodFill,
    },
    render: {
      draw: middlewareHandler.draw,
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
    export: {
      image: exportHandler.exportImage,
      getBlob: exportHandler.getBlob,
    },
    colorPalette: {
      getColors: colorPaletteHandler.getColors,
      isLoading: colorPaletteHandler.isLoadingColors,
    },
    tool: {
      set: uniformBufferHandler.setActiveTool,
      get: uniformBufferHandler.getActiveTool,
    },
    eyeDropper: {
      eyeDropAtCell: eyeDropperHandler.eyeDropAtCell,
    },
  };
};
