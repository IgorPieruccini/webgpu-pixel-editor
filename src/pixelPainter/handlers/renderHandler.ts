import type { Vec2 } from "../../editor/types";
import { createVertexBuffer } from "../createBufferLayout";
import { createPipeline, createTexturePipeline } from "../createPipeline";
import { material } from "../material";
import type { BindPixelTexture } from "../material/pixel";
import type { UniformBufferHandler } from "./uniformBuffersHandler";
import { webGPUSetup } from "../webGPUSetup";
import type { LayerHandler } from "./layerHandler";

export type RenderHandler = Awaited<ReturnType<typeof createRenderHandler>>;

export const createRenderHandler = async (
  layerHandler: LayerHandler,
  uniformBufferHandler: UniformBufferHandler,
  gridSize: Vec2,
  canvas?: HTMLCanvasElement,
  initialRenderUI = true,
) => {
  let renderUI: boolean = initialRenderUI;

  const setRenderUI = (value: boolean) => {
    renderUI = value;
  };

  const pixelBindTextureMap = new Map<string, BindPixelTexture>();

  const { device, canvasFormat, context } = await webGPUSetup(
    canvas ?? "main-canvas",
  );

  const { vertexBuffer, vertexBufferLayout } = createVertexBuffer(device);

  const uiPipeline = createPipeline(
    device,
    "ui",
    vertexBufferLayout,
    canvasFormat,
  );

  const pixelPipeline = createTexturePipeline(device, "pixel");
  const alphaPipeline = createTexturePipeline(device, "alpha");

  const GPUBindAlpha = material.alpha(device, alphaPipeline);

  const GPUBindUi = material.ui(device, uiPipeline, "UI");

  const addLayerTexture = (layerId: string) => {
    if (!pixelBindTextureMap.has(layerId)) {
      const _bindTexture = material.pixel(device, pixelPipeline, gridSize);
      pixelBindTextureMap.set(layerId, _bindTexture);
      return;
    }
  };

  const removeLayerTexture = (layerId: string) => {
    pixelBindTextureMap.delete(layerId);
  };

  const draw = () => {
    if (layerHandler.buffers.size === 0) {
      return;
    }

    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "Encoder",
    });

    //Render passes are when all drawing operations in WebGPU happen.
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: renderUI
            ? { r: 0.08, g: 0.08, b: 0.08, a: 0 }
            : { r: 0, g: 0, b: 0, a: 0 },
        },
      ],
    });

    // DRAW ALPHA LAYER
    if (renderUI) {
      pass.setPipeline(alphaPipeline);
      GPUBindAlpha.writeAlphaUniforms(uniformBufferHandler.commonUniforms);
      pass.setBindGroup(0, GPUBindAlpha.bindGroup);
      pass.draw(6);
    }

    // DRAW PIXEL LAYERS
    pass.setPipeline(pixelPipeline);

    for (const layer of layerHandler.getList()) {
      const buffer = layerHandler.buffers.get(layer.id);
      if (!buffer) {
        throw new Error(`Layer buffer with id ${layer.id} not found`);
      }

      const layerTexture = pixelBindTextureMap.get(layer.id);

      if (!layerTexture) {
        throw new Error(`Layer texture with id ${layer.id} not found`);
      }

      if (!layer.display) {
        continue;
      }

      // write texture if the layer buffer has been modified
      if (layerHandler.isLayerDirty(layer.id)) {
        layerTexture.writeTexture(buffer);
        layerHandler.makeLayerClean(layer.id);
      }

      // Write uniforms for this layer
      layerTexture.writeUniforms(
        uniformBufferHandler.commonUniforms,
        new Float32Array([layer.opacity]),
      );
      pass.setBindGroup(0, layerTexture.bindGroup);

      pass.draw(6);
    }

    // DRAW UI
    if (renderUI) {
      pass.setPipeline(uiPipeline);
      pass.setVertexBuffer(0, vertexBuffer);
      pass.setBindGroup(0, GPUBindUi.bindGroup);
      GPUBindUi.writeBuffer(
        uniformBufferHandler.commonUniforms,
        uniformBufferHandler.uiUniforms,
      );
      pass.draw(6);
    }

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  return {
    draw,
    addLayerTexture,
    removeLayerTexture,
    setRenderUI,
  };
};
