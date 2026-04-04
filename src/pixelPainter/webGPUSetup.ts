
export const webGPUSetup = async (canvasToUse: string | HTMLCanvasElement) => {
  const navigator = window.navigator;

  // adapter is as WebGPU's representation of a specific
  // piece of GPU hardware in your device.
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw "No GPU adapter found";
  }

  // The device is the main interface through which most
  // interaction with the GPU happens.
  const device = await adapter.requestDevice();

  //configure the canvas to be used with the device
  // you just created.
  const canvas = typeof canvasToUse === 'string' ?
    document.querySelector<HTMLCanvasElement>("#" + canvasToUse) :
    canvasToUse

  if (!canvas) {
    throw new Error("main canvas not found in the DOM");
  }

  const context = canvas.getContext("webgpu");

  if (!context) {
    throw new Error("Context is undefined");
  }

  // configures the texture type the gpu works with
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  return {
    device,
    context,
    canvasFormat,
  };
};
