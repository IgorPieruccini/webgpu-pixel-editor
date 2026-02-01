import { createShadeModule } from "./createShaderModule";
import type { ShaderType } from "./types";

export const createPipeline = (
  device: GPUDevice,
  shader: ShaderType,
  vertexBufferLayout: GPUVertexBufferLayout,
  canvasFormat: GPUTextureFormat,
) => {
  const cellShadeModule = createShadeModule(device, shader);

  const cellPipeline = device.createRenderPipeline({
    label: shader,
    layout: "auto",
    vertex: {
      module: cellShadeModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShadeModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: canvasFormat,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
  });

  return cellPipeline;
};

export const createTexturePipeline = (
  device: GPUDevice,
  shader: ShaderType,
) => {
  const shaderModule = createShadeModule(device, shader);

  const pipeline = device.createRenderPipeline({
    label: "pixel texture",
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  return pipeline;
};
