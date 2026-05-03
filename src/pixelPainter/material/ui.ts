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
    size: 12 * 4,
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
