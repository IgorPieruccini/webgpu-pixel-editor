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
