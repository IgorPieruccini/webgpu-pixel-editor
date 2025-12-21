import { createVertexBuffer } from "./createBufferLayout";
import { createPipeline } from "./createPipeline";
import { createShadeModule } from "./createShaderModule";
import { bind } from "./utils";
import { webGPUSetup } from "./webGPUSetup";

export const createLayerPreview = async (gridSize: number) => {
  const canvasSize = { x: 300, y: 300 };

  const { device, canvasFormat, context } = await webGPUSetup("preview-canvas");

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

  const drawPreview = (buffer: Uint32Array<ArrayBuffer>) => {
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
      0, // cellPos.x,

      0, // cellPos.y,

      // canvasSize
      canvasSize.x,
      canvasSize.y,

      // pan viewport
      1, // pan.x,
      1, // pan.y,

      1, // zoom,
      0, // selectedCells.x,
      0, // selectedCells.y,
      0, // selectedCells.z,
      0, // selectedCells.w,
      1, // is first layer boolean
    ]);

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    pass.setBindGroup(0, createBind("bindValues", bindValues, 0));
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
