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
    historyChangeHandler.addAction();
    return id;
  };

  const removeLayer = (id: string) => {
    layerHandler.remove(id);
    renderHandler.removeLayerTexture(id);
    historyChangeHandler.addAction();
    return id;
  };

  const duplicateLayer = (id: string) => {
    const layerId = layerHandler.duplicate(id);
    renderHandler.addLayerTexture(layerId);
    historyChangeHandler.addAction();
    return layerId;
  };

  const setBrushThickness = (value: number) => {
    brushHandler.setThickness(value);
    uniformBufferHandler.updateBrushThickness(value);
  };

  return {
    loadTextureLayers,
    addLayer,
    removeLayer,
    duplicateLayer,
    setBrushThickness,
  };
};
