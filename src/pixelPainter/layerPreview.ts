import { createVertexBuffer } from "./createBufferLayout";
import { createPipeline } from "./createPipeline";
import { bind } from "./utils";
import { webGPUSetup } from "./webGPUSetup";

export const createLayerPreview = async (gridSize: number) => {
  const canvasSize = { x: 300, y: 300 };

  const { device, canvasFormat, context } = await webGPUSetup("preview-canvas");

  const { vertices, vertexBuffer, vertexBufferLayout } =
    createVertexBuffer(device);

  const cellPipeline = createPipeline(
    device,
    "grid",
    vertexBufferLayout,
    canvasFormat,
  );

  const { createBind } = bind(device, cellPipeline);

  const drawPreview = (buffer: Uint32Array<ArrayBuffer>, opacity: number) => {
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

    const gridValues = new Float32Array([
      gridSize, // grid width in cells
      gridSize, // grid height in cells
      canvasSize.x, // canvas width
      canvasSize.y, // canvas height
      1, // viewport offset x
      1, // viewport offset y
      1, // viewport zoom
      1, // 1 = is first layer, 0 = not first layer
      opacity, // layer opacity (start with full opacity)
    ]);

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    // DRAW ALPHA_LAYER
    pass.setBindGroup(0, createBind("bindValues", gridValues, 0));
    pass.setBindGroup(1, createBind("colors", buffer, 1));
    pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times
    gridValues[7] = 0;

    pass.setBindGroup(0, createBind("bindValues", gridValues, 0));
    pass.setBindGroup(1, createBind("colors", buffer, 1));

    pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  return {
    drawPreview,
  };
};
