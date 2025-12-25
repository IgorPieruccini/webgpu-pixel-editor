import type { RGB, RGBA } from "./types";

export const bind = (device: GPUDevice, pipeline: GPURenderPipeline) => {
  const createBind = <
    T extends Float32Array<ArrayBuffer> | Uint32Array<ArrayBuffer>,
  >(
    label: string,
    buffer: T,
    layoutIndex: number,
  ) => {
    const storageBuffer = device.createBuffer({
      label,
      size: buffer.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(storageBuffer, 0, buffer);

    const groupLayout = pipeline.getBindGroupLayout(layoutIndex);

    const bindGroup = device.createBindGroup({
      label: label + "_bind_group",
      layout: groupLayout,
      entries: [{ binding: 0, resource: { buffer: storageBuffer } }],
    });

    return bindGroup;
  };

  return {
    createBind,
  };
};

export const percentToHexAlpha = (percent: number) => {
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  const alpha = Math.round((percent / 100) * 255);
  return "0x" + alpha.toString(16).padStart(2, "0").toUpperCase();
};

export const numberToRGBA = (argb: number): RGBA => {
  const hasAlpha = argb.toString(16).length > 6;

  if (hasAlpha) {
    return {
      a: ((argb >>> 24) & 0xff) / 255,
      r: (argb >> 16) & 0xff,
      g: (argb >> 8) & 0xff,
      b: argb & 0xff,
    };
  }

  return {
    a: 1,
    r: (argb >> 16) & 0xff,
    g: (argb >> 8) & 0xff,
    b: argb & 0xff,
  };
};

export const rgbaToHex = ({ r, g, b, a }: RGBA) => {
  return ((a * 255) << 24) | (r << 16) | (g << 8) | b;
};

export const alphaComposite = (src: RGBA, dst: RGBA) => {
  const outA = src.a + dst.a * (1 - src.a);

  const outR = (src.r * src.a + dst.r * dst.a * (1 - src.a)) / outA;
  const outG = (src.g * src.a + dst.g * dst.a * (1 - src.a)) / outA;
  const outB = (src.b * src.a + dst.b * dst.a * (1 - src.a)) / outA;

  return { r: outR, g: outG, b: outB, a: outA };
};
