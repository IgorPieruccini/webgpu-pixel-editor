import type { Vec2 } from "../editor/types";
import type { RGBA } from "./types";

export type BindPixelTexture = ReturnType<typeof bindTexture>;

export const bindAlphaTexture = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
) => {
  // Create uniform buffer for grid values struct
  // Size must be multiple of 16 bytes for uniform buffer alignment
  const commonUniformBuffer = device.createBuffer({
    label: "alpha uniform buffer",
    size: 7 * 4, // GridValues struct: panX, panY, zoom, (4 floats * 4 bytes = 16 bytes)
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: "alpha texture",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: commonUniformBuffer } }],
  });

  const writeAlphaUniforms = (uniformData: Float32Array<ArrayBuffer>) => {
    device.queue.writeBuffer(commonUniformBuffer, 0, uniformData.buffer);
  };

  return {
    bindGroup,
    writeAlphaUniforms,
  };
};

export const bindTexture = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  gridSize: Vec2,
) => {
  const layerTexture = device.createTexture({
    size: { width: gridSize.x, height: gridSize.y },
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
    size: 1 * 4,
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
        bytesPerRow: buffer.byteLength / gridSize.y,
      },
      {
        width: gridSize.x,
        height: gridSize.y,
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

export const bind = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  label: string,
) => {
  const commonUniformBuffer = device.createBuffer({
    label: `${label} - common uniform buffer`,
    size: 7 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uiUniformBuffer = device.createBuffer({
    label: `${label} - ui uniform buffer`,
    size: 8 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: `${label} - bind group`,
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: commonUniformBuffer } },
      { binding: 1, resource: { buffer: uiUniformBuffer } },
    ],
  });

  const writeBuffer = (
    commonUniformData: Float32Array<ArrayBuffer>,
    uiUniformData: Float32Array<ArrayBuffer>,
  ) => {
    device.queue.writeBuffer(commonUniformBuffer, 0, commonUniformData);
    device.queue.writeBuffer(uiUniformBuffer, 0, uiUniformData);
  };

  return {
    writeBuffer,
    bindGroup,
  };
};

export const uintToRGBA = ([r, g, b, a]: Array<number>): RGBA => {
  return { r, g, b, a: a / 255 };
};

export const numberToRGBA = (argb: number): RGBA => {
  const hasAlpha = argb.toString(16).length > 6;

  if (hasAlpha) {
    return {
      // low byte is alpha (0-255) -> normalize to 0-1
      a: (argb & 0xff) / 255,
      // high bytes are R, G, B
      r: (argb >>> 24) & 0xff,
      g: (argb >>> 16) & 0xff,
      b: (argb >>> 8) & 0xff,
    };
  }

  return {
    a: 1,
    r: (argb >>> 16) & 0xff,
    g: (argb >>> 8) & 0xff,
    b: argb & 0xff,
  };
};

export const rgbaToHex = ({ r, g, b, a }: RGBA): number => {
  // Convert RGBA object to RGBA format (0xRRGGBBAA)
  // r, g, b are expected in 0-255 range; a is expected in 0-1 range
  const rByte = Math.round(Math.max(0, Math.min(255, r))) & 0xff;
  const gByte = Math.round(Math.max(0, Math.min(255, g))) & 0xff;
  const bByte = Math.round(Math.max(0, Math.min(255, b))) & 0xff;
  const aByte = Math.round(Math.max(0, Math.min(1, a)) * 255) & 0xff;

  // Compose into 0xRRGGBBAA using unsigned right shift to avoid negative numbers
  return (
    ((rByte << 24) >>> 0) |
    ((gByte << 16) >>> 0) |
    ((bByte << 8) >>> 0) |
    (aByte >>> 0)
  );
};

export const alphaComposite = (src: RGBA, dst: RGBA) => {
  const outA = src.a + dst.a * (1 - src.a);

  const outR = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / outA;
  const outG = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / outA;
  const outB = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / outA;

  return { r: outR, g: outG, b: outB, a: outA };
};
