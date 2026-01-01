import { createVertexBuffer } from "../createBufferLayout";
import { createPipeline } from "../createPipeline";
import { createLayerPreview } from "../layerPreview";
import { bind } from "../utils";
import { webGPUSetup } from "../webGPUSetup";
import type { BrushHandler } from "./brushHandler";
import type { LayerHandler } from "./layerHandler";

export const createRenderHandler = async (
  layerHandler: LayerHandler,
  brushHandler: BrushHandler,
  gridSize: number,
  canvasSize: { x: number; y: number },
) => {
  const { device, canvasFormat, context } = await webGPUSetup("main-canvas");

  const { drawPreview } = await createLayerPreview(gridSize);

  const { vertices, vertexBuffer, vertexBufferLayout } =
    createVertexBuffer(device);

  const gridPipeline = createPipeline(
    device,
    "grid",
    vertexBufferLayout,
    canvasFormat,
  );

  const uiPipeline = createPipeline(
    device,
    "ui",
    vertexBufferLayout,
    canvasFormat,
  );

  const gridBinder = bind(device, gridPipeline);
  const uiBinder = bind(device, uiPipeline);

  const render = (
    cellPos: { x: number; y: number },
    pan: { x: number; y: number },
    zoom: number,
    selectedCells: { x: number; y: number; z: number; w: number },
  ) => {
    const alphaLayer = new Uint32Array(gridSize * gridSize);

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

    const gridValues = new Float32Array([
      gridSize, // grid width in cells
      gridSize, // grid height in cells
      canvasSize.x, // canvas width
      canvasSize.y, // canvas height
      pan.x, // viewport offset x
      pan.y, // viewport offset y
      zoom, // viewport zoom
      1, // 1 = is first layer, 0 = not first layer
      1, // layer opacity (start with full opacity)
    ]);

    const uiValues = new Float32Array([
      gridSize, // grid width in cells
      gridSize, // grid height in cells
      cellPos.x, // the cell x position
      cellPos.y, // the cell y position
      canvasSize.x, // canvas width
      canvasSize.y, // canvas height
      pan.x, // viewport offset x
      pan.y, // viewport offset y
      zoom, // viewport zoom
      selectedCells.x, // square selection x
      selectedCells.y, // square selection y
      selectedCells.z, // selectedCells.z,
      selectedCells.w, // selectedCells.w
      brushHandler.getDefaultThickness() ?? brushHandler.getThickness(), // brush thickness
    ]);

    pass.setPipeline(gridPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    let index = 0;

    // DRAW ALPHA LAYER
    pass.setBindGroup(0, gridBinder.createBind("bindValues", gridValues, 0));
    pass.setBindGroup(1, gridBinder.createBind("colors", alphaLayer, 1));

    pass.draw(vertices.length / 2, gridSize * gridSize);

    gridValues[7] = 0;

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

      gridValues[8] = layer.opacity;

      pass.setBindGroup(0, gridBinder.createBind("bindValues", gridValues, 0));
      pass.setBindGroup(1, gridBinder.createBind("colors", buffer, 1));

      pass.draw(vertices.length / 2, gridSize * gridSize);
      index++;
    }

    pass.setPipeline(uiPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    // DRAW UI
    pass.setBindGroup(0, uiBinder.createBind("bindValues", uiValues, 0));
    pass.draw(vertices.length / 2, gridSize * gridSize);

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  return {
    render,
  };
};
