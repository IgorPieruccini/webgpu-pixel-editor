import { BYTES_PER_PIXEL } from "../../constants";

export type BindPixelTexture = ReturnType<typeof bindTexture>;

export const bindTexture = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  tileSize: number,
) => {
  const layerTexture = device.createTexture({
    size: { width: tileSize, height: tileSize },
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const sampler = device.createSampler({
    magFilter: "nearest",
    minFilter: "nearest",
  });

  const commonBuffer = device.createBuffer({
    label: "pixel grid values uniform",
    size: 8 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const layerBuffer = device.createBuffer({
    label: "pixel grid values uniform",
    size: 8 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: "bind pixel texture",
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: sampler },
      { binding: 1, resource: layerTexture.createView() },
      { binding: 2, resource: { buffer: commonBuffer } },
      { binding: 3, resource: { buffer: layerBuffer } },
    ],
  });

  const writeTexture = (buffer: Uint8Array<ArrayBuffer>) => {
    device.queue.writeTexture(
      { texture: layerTexture },
      buffer,
      {
        bytesPerRow: tileSize * BYTES_PER_PIXEL,
      },
      {
        width: tileSize,
        height: tileSize,
      },
    );
  };

  const writeUniforms = (
    commonUniformData: Float32Array<ArrayBuffer>,
    layerUniformData: Float32Array<ArrayBuffer>,
  ) => {
    device.queue.writeBuffer(commonBuffer, 0, commonUniformData);
    device.queue.writeBuffer(layerBuffer, 0, layerUniformData);
  };

  return {
    writeTexture,
    writeUniforms,
    bindGroup,
  };
};
