/// <reference types="@webgpu/types" />

import { createSignal } from "solid-js";
import { createVertexBuffer } from "./createBufferLayout";
import { createPipeline } from "./createPipeline";
import { createShadeModule } from "./createShaderModule";
import { createLayerPreview } from "./layerPreview";
import { alphaComposite, bind, numberToRGBA, rgbaToHex } from "./utils";
import { webGPUSetup } from "./webGPUSetup";
import { createLayerHandler } from "./handlers/layerHandler";

export const pixelPainter = async (
  projectName: string,
  gridSize: number,
  canvasSize: { x: number; y: number },
) => {
  const alphaLayer = new Uint32Array(gridSize * gridSize);

  const { device, canvasFormat, context } = await webGPUSetup("main-canvas");
  const canvas = document.querySelector<HTMLCanvasElement>("#" + "main-canvas");
  if (!canvas) {
    throw new Error("Could not find main canvas");
  }

  const layerHandler = await createLayerHandler(projectName, gridSize);

  const { drawPreview } = await createLayerPreview(gridSize);

  const currentPaintedPixels = new Set<number>();
  canvas.addEventListener("mouseup", () => {
    currentPaintedPixels.clear();
  });

  // TODO: merge this two colors
  let currentColorSelected: number = 0xff00ff;
  const colorStore = createSignal("#ff00ff");

  const [getBrushOpacity, setBrushOpacity] = createSignal(100);

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
    if (layerHandler.buffers.size === 0) {
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
          clearValue: { r: 0.08, g: 0.08, b: 0.08, a: 0 },
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
      1, // opacity
    ]);

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    let index = 0;

    // DRAW ALPHA LAYER
    pass.setBindGroup(0, createBind("bindValues", bindValues, 0));
    pass.setBindGroup(1, createBind("colors", alphaLayer, 1));

    pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times

    bindValues[13] = 0;

    for (const layer of layerHandler.getList()) {
      const buffer = layerHandler.buffers.get(layer.id);
      if (!buffer) {
        throw new Error(`Layer buffer with id ${layer.id} not found`);
      }

      if (layer.id === layerHandler.getActive().id) {
        drawPreview(buffer, layer.opacity);
      }

      if (!layer.display) {
        continue;
      }

      bindValues[14] = layer.opacity;

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
    const color = layerHandler.getCurrentBuffer()[i];
    return color;
  };

  const paintPixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;

    if (currentPaintedPixels.has(arrayIndex)) {
      return;
    }

    let destColor =
      layerHandler.getCurrentBuffer().at(arrayIndex) ?? 0xffffffff;

    const destRGBA =
      destColor === 0
        ? { r: 255, g: 255, b: 255, a: 0 }
        : numberToRGBA(destColor);

    const sourceRGBA = numberToRGBA(currentColorSelected);
    sourceRGBA.a = getBrushOpacity() / 100;

    const blendedRGBA = alphaComposite(sourceRGBA, destRGBA);

    const blendedHex = rgbaToHex(blendedRGBA);

    layerHandler.getCurrentBuffer()[arrayIndex] = blendedHex;
    layerHandler.saveCurrentBuffer();

    currentPaintedPixels.add(arrayIndex);
  };

  const deletePixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    layerHandler.getCurrentBuffer()[arrayIndex] = 0;
    layerHandler.saveCurrentBuffer();
  };

  return {
    layer: {
      add: layerHandler.add,
      remove: layerHandler.remove,
      sort: layerHandler.sort,
      rename: layerHandler.rename,
      toggleDisplay: layerHandler.toggleDisplay,
      select: layerHandler.select,
      setOpacity: layerHandler.setOpacity,
      getList: layerHandler.getList,
      getActive: layerHandler.getActive,
    },
    drawFrame,
    paintPixel,
    deletePixel,
    setBrushColor,
    getColorFrom,
    getCurrentColor: colorStore[0],
    getBrushOpacity,
    setBrushOpacity,
  };
};
