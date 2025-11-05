import { localDataBase } from "../storage";
import gridShader from "./shaders/grid.wgsl";
import { bind } from "./utils";

const TEMP_PROJECT_NAME = "project_name";

const webGPUSetup = async () => {
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
  const canvas = document.querySelector<HTMLCanvasElement>("#main-canvas");

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

const createVertexBuffer = (device: GPUDevice) => {
  const vertices = new Float32Array([
    // Triangle 1
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
    // Triangle 2
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
  ]);

  // The GPU cannot draw vertices with data from a JavaScript array.
  // A buffer is a block of memory that's easily accessible to the GPU and flagged for certain purposes.
  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  // Specify the usage of the buffer.
  device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

  // You need to supply a little bit more information if you're going to draw anything with it.
  // You need to be able to tell WebGPU more about the structure of the vertex data.
  const vertexBufferLayout: GPUVertexBufferLayout = {
    // This is the number of bytes the GPU needs to skip forward in the buffer when it's looking for the next vertex
    //This is the number of bytes the GPU needs to skip forward in the buffer when it's looking for the next vertex.
    // Each vertex of your square is made up of two 32-bit floating point numbers. As mentioned earlier, a 32-bit float is 4 bytes, so two floats is 8 bytes
    arrayStride: 8,
    attributes: [
      {
        format: "float32x2",
        // The offset describes how many bytes into the vertex this particular attribute starts.
        // you really only have to worry about this if your buffer has more than one attribute in it.
        offset: 0,
        // This is an arbitrary number between 0 and 15 and must be unique for every attribute that you define. It links this attribute to a particular input in the vertex shader,
        shaderLocation: 0, // Position, see vertex shader
      },
    ],
  };

  return {
    vertices,
    vertexBuffer,
    vertexBufferLayout,
  };
};

const createShaderModule = (device: GPUDevice) => {
  // A vertex shader is defined as a function, and the GPU calls that function once for every vertex in your vertexBuffer. Since your vertexBuffer has six positions (vertices) in it,
  // the function you define gets called six times. Each time it is called, a different position from the vertexBuffer is passed to the function as an argument,
  // and it's the job of the vertex shader function to return a corresponding position in clip space.
  const cellShaderModule = device.createShaderModule({
    label: "Cell shader",
    code: gridShader,
  });

  return cellShaderModule;
};

const createPipeline = (
  device: GPUDevice,
  cellShaderModule: GPUShaderModule,
  vertexBufferLayout: GPUVertexBufferLayout,
  canvasFormat: GPUTextureFormat,
) => {
  // The render pipeline controls how geometry is drawn, including things like which shaders are used, how to interpret data in vertex buffers, which kind of geometry should be rendered (lines, points, triangles...), and more!
  const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    layout: "auto",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: canvasFormat,
        },
      ],
    },
  });

  return cellPipeline;
};

export const pixelPainter = async (
  gridSize: number,
  canvasSize: { x: number; y: number },
) => {
  const { device, canvasFormat, context } = await webGPUSetup();

  let colorBuffer: Uint32Array<ArrayBuffer>;
  const db = await localDataBase();

  try {
    colorBuffer = await db.load(TEMP_PROJECT_NAME);
    if (!colorBuffer) {
      colorBuffer = new Uint32Array(gridSize * gridSize);
    }
  } catch {
    throw "Error initializing DB";
  }

  const { vertices, vertexBuffer, vertexBufferLayout } =
    createVertexBuffer(device);

  const cellShaderModule = createShaderModule(device);

  const cellPipeline = createPipeline(
    device,
    cellShaderModule,
    vertexBufferLayout,
    canvasFormat,
  );

  const { createBind } = bind(device, cellPipeline);

  const drawFrame = (
    cellPos: { x: number; y: number },
    pan: { x: number; y: number },
    zoom: number,
  ) => {
    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "Grid encoder",
    });

    const binds: GPUBindGroup[] = [];

    const bindValues = new Float32Array([
      // gridSize
      gridSize,
      gridSize,
      // mouseCellPos,
      cellPos.x,
      cellPos.y,
      // canvasSize
      canvasSize.x,
      canvasSize.y,
      // pan viewport
      pan.x,
      pan.y,
      zoom,
    ]);

    binds.push(createBind("bindValues", bindValues, 0));
    binds.push(createBind("colors", colorBuffer, 1));

    //Render passes are when all drawing operations in WebGPU happen.
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          // The texture is given as the view property of a
          // colorAttachment.
          // Render passes require that you provide a
          // GPUTextureView instead of a GPUTexture,
          // which tells it which parts of the texture to render to.
          view: context.getCurrentTexture().createView(),
          // value of "clear" indicates that you want the texture to be cleared when the render pass starts.
          loadOp: "clear",
          // value of "store" indicates that once the render pass is finished you want the results of any drawing done during the render pass saved into the texture.
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
        },
      ],
    });

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    binds.forEach((bind, i) => {
      pass.setBindGroup(i, bind);
    });

    pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times

    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  const paintPixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    colorBuffer[arrayIndex] = 0xff0000;
    db.save(TEMP_PROJECT_NAME, colorBuffer);
  };

  return {
    drawFrame,
    paintPixel,
  };
};
