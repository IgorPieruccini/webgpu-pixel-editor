import grid from "./shaders/grid.wgsl";
import ui from "./shaders/ui.wgsl";

export const createShadeModule = (device: GPUDevice, type: "grid" | "ui") => {
  const shaderCode = type === "grid" ? grid : ui;
  console.log({ shaderCode });

  const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: shaderCode,
  });

  return cellShaderModule;
};
