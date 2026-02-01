import ui from "./shaders/ui.wgsl";
import pixel from "./shaders/pixel.wgsl";
import alpha from "./shaders/alpha.wgsl";

const shaders = {
  ui,
  pixel,
  alpha,
};

import type { ShaderType } from "./types";

export const createShadeModule = (device: GPUDevice, type: ShaderType) => {
  const shaderCode = shaders[type];

  const cellShaderModule = device.createShaderModule({
    label: `${type}-shader`,
    code: shaderCode,
  });

  return cellShaderModule;
};
