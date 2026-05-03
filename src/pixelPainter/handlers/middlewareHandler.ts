import type { LayerPreviewHandler } from "../layerPreview";
import type { Layers } from "../types";
import type { UniformBufferHandler } from "../uniformBuffersHandler";
import type { BrushHandler } from "./brushHandler";
import type { HistoryChangeHandler } from "./historyChangeHandler";
import type { LayerHandler } from "./layerHandler";
import type { RenderHandler } from "./renderHandler";

export const createMiddlewareHandler = (
  brushHandler: BrushHandler,
  uniformBufferHandler: UniformBufferHandler,
  renderHandler: RenderHandler,
  layerHandler: LayerHandler,
  historyChangeHandler: HistoryChangeHandler,
  layerPreview: LayerPreviewHandler,
) => {
  const loadTextureLayers = (layers?: Layers) => {
    const curLayers = layers ?? layerHandler.getList();

    for (const layer of curLayers) {
      renderHandler.addLayerTexture(layer.id);
    }
  };

  const addLayer = () => {
    const id = layerHandler.add();
    renderHandler.addLayerTexture(id);
    historyChangeHandler.addAction({ captureCurrentBuffer: true });
    return id;
  };

  const removeLayer = (id: string) => {
    layerHandler.remove(id);
    renderHandler.removeLayerTexture(id);
    historyChangeHandler.addAction({ captureCurrentBuffer: false });
    return id;
  };

  const duplicateLayer = (id: string) => {
    const layerId = layerHandler.duplicate(id);
    renderHandler.addLayerTexture(layerId);
    historyChangeHandler.addAction({ captureCurrentBuffer: true });
    return layerId;
  };

  const setBrushThickness = (value: number) => {
    brushHandler.setThickness(value);
    uniformBufferHandler.updateBrushThickness(value);
  };

  const setBrushColor = (color: number | string) => {
    brushHandler.setColor(color);
    uniformBufferHandler.updateSelectedColor(brushHandler.getSelectedColor());
  };

  const setBrushOpacity = (opacity: number) => {
    brushHandler.setOpacity(opacity);
    uniformBufferHandler.updateBrushOpacity(brushHandler.getOpacity());
  };

  const setOpacity = (
    layerId: string,
    opacity: number,
    registerHistoryChange: boolean = false,
  ) => {
    layerHandler.setOpacity(layerId, opacity);
    if (registerHistoryChange) {
      historyChangeHandler.addAction({ captureCurrentBuffer: true });
    }
  };

  const draw = () => {
    // Draw preview first, because preview does not invalidate dirty layers,
    // and render handler does, so if render handlers draws firs, the preview will
    // always get clean layer and draw nothing
    const currentLayer = layerHandler.getActive();
    if (currentLayer) {
      const currentBuffer = layerHandler.getBufferById(currentLayer.id);
      if (currentBuffer) {
        layerPreview.drawPreview(currentBuffer, currentLayer.opacity);
      }
    }
    renderHandler.draw();
  };

  const loadLayers = (
    serializedLayers: Layers,
    serializedBuffer: Record<string, Uint8Array<ArrayBuffer>>,
  ) => {
    loadTextureLayers(serializedLayers);
    layerHandler.load(serializedLayers, serializedBuffer);
  };

  return {
    loadTextureLayers,
    addLayer,
    setOpacity,
    removeLayer,
    duplicateLayer,
    setBrushColor,
    setBrushOpacity,
    setBrushThickness,
    draw,
    loadLayers,
  };
};
