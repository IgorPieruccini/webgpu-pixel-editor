import gridShader from "./shaders/grid.wgsl";

export const createShadeModule = (device: GPUDevice) => {
  // A vertex shader is defined as a function, and the GPU calls that function once for every vertex in your vertexBuffer. Since your vertexBuffer has six positions (vertices) in it,
  // the function you define gets called six times. Each time it is called, a different position from the vertexBuffer is passed to the function as an argument,
  // and it's the job of the vertex shader function to return a corresponding position in clip space.
  const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: gridShader,
  });

  return cellShaderModule;
};
