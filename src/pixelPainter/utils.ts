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
