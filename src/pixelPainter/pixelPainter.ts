/// <reference types="@webgpu/types" />

import { localDataBase } from "../storage";
import { generateUUID } from "../utils";
import type { Layer, Layers, PixelPainterReturnType } from "./types";
import { bind } from "./utils";
import { createSignal } from "solid-js";
import { webGPUSetup } from "./webGPUSetup";
import { createVertexBuffer } from "./createBufferLayout";
import { createShadeModule } from "./createShaderModule";
import { createPipeline } from "./createPipeline";
import { createLayerPreview } from "./layerPreview";

export const pixelPainter = async (
  projectName: string,
  gridSize: number,
  canvasSize: { x: number; y: number },
): Promise<PixelPainterReturnType> => {
  const { device, canvasFormat, context } = await webGPUSetup("main-canvas");

  const { drawPreview } = await createLayerPreview(gridSize);

  let stringLayers = window.localStorage.getItem(`${projectName}-layers`);
  if (!stringLayers) {
    const l: Layers = [{ id: generateUUID(), name: "Layer", display: true }];
    stringLayers = JSON.stringify(l);
    window.localStorage.setItem(`${projectName}-layers`, stringLayers);
  }

  const [layers, setLayers] = createSignal<Layers>(JSON.parse(stringLayers));

  const firstLayer = layers().at(0);
  if (!firstLayer) {
    throw new Error(
      "Pixel Painter must be initialized at least with one layer",
    );
  }

  const [activeLayerId, setActiveLayerId] = createSignal<string>(firstLayer.id);

  let currentBufferLayer: Uint32Array<ArrayBuffer>;

  const db = await localDataBase(projectName);

  const layersBuffer: Map<string, Uint32Array<ArrayBuffer>> = new Map();

  for (const layer of layers()) {
    try {
      const layerBuffer = await db.load(layer.id);
      if (layerBuffer) {
        layersBuffer.set(layer.id, layerBuffer);
      } else {
        layersBuffer.set(layer.id, new Uint32Array(gridSize * gridSize));
      }
    } catch {
      layersBuffer.set(layer.id, new Uint32Array(gridSize * gridSize));
    }
  }

  const firstBuffer = layersBuffer.get(firstLayer.id);
  if (!firstBuffer) {
    throw new Error(
      "Something went wrong accessing the buffer from first layer",
    );
  }

  currentBufferLayer = firstBuffer;

  let currentColorSelected: number = 0xff00ff;
  const colorStore = createSignal("#ff00ff");

  const { vertices, vertexBuffer, vertexBufferLayout } =
    createVertexBuffer(device);

  const cellShadeModule = createShadeModule(device);

  const cellPipeline = createPipeline(
    device,
    cellShadeModule,
    vertexBufferLayout,
    canvasFormat,
  );

  const { createBind } = bind(device, cellPipeline);

  const drawFrame = (
    cellPos: { x: number; y: number },
    pan: { x: number; y: number },
    zoom: number,
    selectedCells: { x: number; y: number; z: number; w: number },
  ) => {
    if (layersBuffer.size === 0) {
      return;
    }

    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "Grid encoder",
    });

    //Render passes are when all drawing operations in WebGPU happen.
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.13, g: 0.13, b: 0.13, a: 0 },
        },
      ],
    });

    const bindValues = new Float32Array([
      // gridSize
      gridSize,
      gridSize,
      // mouseCellPos,
      cellPos.x,
      cellPos.y,
      // canvasSize
      canvasSize.x,
      canvasSize.y,
      // pan viewport
      pan.x,
      pan.y,
      zoom,
      selectedCells.x,
      selectedCells.y,
      selectedCells.z,
      selectedCells.w,
      1, // is first layer boolean
    ]);

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    let index = 0;

    for (const layer of layers()) {
      if (!layer.display) {
        continue;
      }

      const buffer = layersBuffer.get(layer.id);
      if (!buffer) {
        throw new Error(`Layer buffer with id ${layer.id} not found`);
      }

      if (layer.id === activeLayerId()) {
        drawPreview(buffer);
      }

      if (index !== 0) {
        // set to false if not the first layer
        bindValues[13] = 0;
      }

      pass.setBindGroup(0, createBind("bindValues", bindValues, 0));
      pass.setBindGroup(1, createBind("colors", buffer, 1));

      pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times
      index++;
    }

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  const setBrushColor = (_color: number | string) => {
    if (typeof _color === "string") {
      currentColorSelected = parseInt(_color.replace("#", ""), 16);
      colorStore[1](_color);
    }

    if (typeof _color === "number") {
      currentColorSelected = _color;
      colorStore[1]("#" + currentColorSelected.toString(16).padStart(6, "0"));
    }
  };

  const getColorFrom = (pos: { x: number; y: number }) => {
    const i = pos.x + pos.y * gridSize;
    const color = currentBufferLayer[i];
    return color;
  };

  const paintPixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    currentBufferLayer[arrayIndex] = currentColorSelected;
    db.save(currentBufferLayer, activeLayerId());
  };

  const deletePixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    currentBufferLayer[arrayIndex] = 0;
    db.save(currentBufferLayer, activeLayerId());
  };

  const addLayer = () => {
    const currentLayers = layers();

    const layer = {
      id: generateUUID(),
      name: `Layer`,
    };

    const _layers: Layers = [...currentLayers, layer];

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setLayers(_layers);

    setActiveLayerId(layer.id);
    const newBuffer = new Uint32Array(gridSize * gridSize);
    layersBuffer.set(layer.id, newBuffer);
    currentBufferLayer = newBuffer;
  };

  const removeLayer = (id: string) => {
    const _layers = [...layers()];

    if (_layers.length === 1) {
      // At least one layer per project needs to exist
      return;
    }

    const index = _layers.findIndex((layer) => layer.id === id);
    const newActiveLayerIndex = index >= 1 ? index - 1 : index + 1;
    const newActiveLayerId = _layers[newActiveLayerIndex].id;

    // re-assign current layer id
    if (activeLayerId() === id) {
      setActiveLayerId(newActiveLayerId);
      const newBuffer = layersBuffer.get(newActiveLayerId);
      if (!newBuffer) {
        throw new Error(
          `layer buffer with id ${newActiveLayerId} could not be found`,
        );
      }
      currentBufferLayer = newBuffer;
    }

    _layers.splice(index, 1);
    setLayers(_layers);
    layersBuffer.delete(id);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );
  };

  const sortLayers = (dragged: string, dropped: string) => {
    const _layers = [...layers()];

    let draggedIndex = 0;
    let droppedIndex = 0;

    for (let i = 0; i < _layers.length; i++) {
      const layer = _layers[i];
      if (layer.id === dragged) {
        draggedIndex = i;
      }
      if (layer.id == dropped) {
        droppedIndex = i;
      }
    }

    const draggedLayer = _layers.splice(draggedIndex, 1);

    const first = _layers.slice(0, droppedIndex);
    const second = _layers.slice(droppedIndex, _layers.length);
    const newLayers = [...first, ...draggedLayer, ...second];

    setLayers(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const renameLayer = (name: string) => {
    const _layers = layers().map((layer: Layer) => {
      if (layer.id === activeLayerId()) {
        return {
          ...layer,
          name,
        };
      }

      return layer;
    });

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setLayers(_layers);
  };

  const toggleLayerDisplay = (id: string) => {
    const _layers = [...layers()];

    const newLayers = _layers.map((layer) => {
      if (layer.id === id) {
        return {
          ...layer,
          display: !layer.display,
        };
      }
      return layer;
    });

    setLayers(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );
  };

  const selectLayer = (layerId: string) => {
    setActiveLayerId(layerId);
    const buffer = layersBuffer.get(layerId);
    if (!buffer) {
      throw new Error(`Could not find buffer corresponded to id: ${layerId}`);
    }
    currentBufferLayer = buffer;
  };

  return {
    drawFrame,
    paintPixel,
    deletePixel,
    setBrushColor,
    getColorFrom,
    getCurrentColor: colorStore[0],
    addLayer,
    sortLayers,
    removeLayer,
    renameLayer,
    toggleLayerDisplay,
    getLayers: layers,
    selectLayer,
    getActiveLayer: activeLayerId,
  };
};
