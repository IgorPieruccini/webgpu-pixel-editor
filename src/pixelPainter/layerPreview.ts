import { LAYER_PREVIEW_SIZE } from "../constants";
import { createTexturePipeline } from "./createPipeline";
import type { LayerHandler } from "./handlers/layerHandler";
import { material } from "./material";
import type { Vec2 } from "./types";
import { webGPUSetup } from "./webGPUSetup";

export type LayerPreviewHandler = Awaited<
  ReturnType<typeof createLayerPreview>
>;

export const createLayerPreview = async (
  layerHandler: LayerHandler,
  gridSize: Vec2,
  zoom: number,
) => {
  const { device, context } = await webGPUSetup("preview-canvas");

  const pixelPipeline = createTexturePipeline(device, "pixel");
  const alphaPipeline = createTexturePipeline(device, "alpha");

  const layerTexture = material.pixel(device, pixelPipeline, gridSize);
  const GPUBindAlpha = material.alpha(device, alphaPipeline);

  const commonUniformBuffer = new Float32Array([
    0,
    0,
    LAYER_PREVIEW_SIZE.x,
    LAYER_PREVIEW_SIZE.y,
    gridSize.x,
    gridSize.y,
    zoom,
  ]);

  const drawPreview = (buffer: Uint8Array<ArrayBuffer>, opacity: number) => {
    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "preview",
    });

    //Render passes are when all drawing operations in WebGPU happen.
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
        },
      ],
    });

    // DRAW ALPHA
    pass.setPipeline(alphaPipeline);

    GPUBindAlpha.writeAlphaUniforms(commonUniformBuffer);
    pass.setBindGroup(0, GPUBindAlpha.bindGroup);
    pass.draw(6);

    // DRAW PIXEL LAYER
    pass.setPipeline(pixelPipeline);

    if (layerHandler.isCurrentLayerDirty()) {
      layerTexture.writeTexture(buffer);
    }

    layerTexture.writeUniforms(
      commonUniformBuffer,
      new Float32Array([opacity]),
    );

    pass.setBindGroup(0, layerTexture.bindGroup);
    pass.draw(6);
    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  return {
    drawPreview,
  };
};
