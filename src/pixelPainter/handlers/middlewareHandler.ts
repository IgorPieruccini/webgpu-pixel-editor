import type { UniformBufferHandler } from "../uniformBuffersHandler";
import type { BrushHandler } from "./brushHandler";
import type { LayerHandler } from "./layerHandler";
import type { RenderHandler } from "./renderHandler";

export const createMiddlewareHandler = (
  brushHandler: BrushHandler,
  uniformBufferHandler: UniformBufferHandler,
  renderHandler: RenderHandler,
  layerHandler: LayerHandler,
) => {
  const loadLayers = () => {
    const layersId = layerHandler.getList().map((layer) => layer.id);
    for (const id of layersId) {
      renderHandler.addLayerTexture(id);
    }
  };

  const addLayer = () => {
    const id = layerHandler.add();
    renderHandler.addLayerTexture(id);
    return id;
  };

  const removeLayer = (id: string) => {
    layerHandler.remove(id);
    renderHandler.removeLayerTexture(id);
    return id;
  };

  const duplicateLayer = (id: string) => {
    const layerId = layerHandler.duplicate(id);
    renderHandler.addLayerTexture(layerId);
    return layerId;
  };

  const setBrushThickness = (value: number) => {
    brushHandler.setThickness(value);
    uniformBufferHandler.updateBrushThickness(value);
  };

  return {
    loadLayers,
    addLayer,
    removeLayer,
    duplicateLayer,
    setBrushThickness,
  };
};
