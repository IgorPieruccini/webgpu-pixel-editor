import gridShader from "./shaders/grid.wgsl";

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
    // Triangle 1 (Blue)
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

    // Triangle 2 (Red)
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

const createGridBufferBindGroup = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  gridSize: number,
) => {
  // Create a uniform buffer that describes the grid.
  //A uniform is a value from a buffer that is the same for every invocation.
  const uniformArray = new Float32Array([gridSize, gridSize]);

  const uniformBuffer = device.createBuffer({
    label: "Grid Uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

  const bindGroup = device.createBindGroup({
    label: "Cell renderer bind group",
    // layout that describes which types of resources this bind group contains
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        // binding, which corresponds with the @binding() value you entered in the shader. In this case, 0
        binding: 0,
        // which is the actual resource that you want to expose to the variable at the specified binding index. In this case, your uniform buffer.
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  return bindGroup;
};

const createColorBufferBindGroup = (
  device: GPUDevice,
  buffer: Uint32Array<ArrayBuffer>,
  pipeline: GPURenderPipeline,
) => {
  // Create a uniform buffer that describes the mousePosition.
  //A uniform is a value from a buffer that is the same for every invocation.

  const storageBuffer = device.createBuffer({
    label: "Colors Storage",
    size: buffer.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(storageBuffer, 0, buffer);

  const groupLayout = pipeline.getBindGroupLayout(2);

  const bindGroup = device.createBindGroup({
    label: "Cell color",
    // layout that describes which types of resources this bind group contains
    layout: groupLayout,
    entries: [{ binding: 0, resource: { buffer: storageBuffer } }],
  });

  return bindGroup;
};

const createMousePositionBufferBindGroup = (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  cellPos: { x: number; y: number },
) => {
  // Create a uniform buffer that describes the mousePosition.
  //A uniform is a value from a buffer that is the same for every invocation.
  const uniformArray = new Float32Array([cellPos.x, cellPos.y]);

  const uniformBuffer = device.createBuffer({
    label: "Grid Uniforms",
    size: uniformArray.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

  const bindGroup = device.createBindGroup({
    label: "Cell renderer bind group",
    // layout that describes which types of resources this bind group contains
    layout: pipeline.getBindGroupLayout(1),
    entries: [
      {
        // binding, which corresponds with the @binding() value you entered in the shader. In this case, 0
        binding: 0,
        // which is the actual resource that you want to expose to the variable at the specified binding index. In this case, your uniform buffer.
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  return bindGroup;
};

export const pixelPainter = async (gridSize: number) => {
  const { device, canvasFormat, context } = await webGPUSetup();

  const colorBuffer = new Uint32Array(gridSize * gridSize);

  const { vertices, vertexBuffer, vertexBufferLayout } =
    createVertexBuffer(device);

  const cellShaderModule = createShaderModule(device);

  const cellPipeline = createPipeline(
    device,
    cellShaderModule,
    vertexBufferLayout,
    canvasFormat,
  );

  const drawFrame = (cellPos: { x: number; y: number }) => {
    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "Grid encoder",
    });

    const bindGroup = createGridBufferBindGroup(device, cellPipeline, gridSize);
    const bindMousePosition = createMousePositionBufferBindGroup(
      device,
      cellPipeline,
      cellPos,
    );

    const colorBindGroup = createColorBufferBindGroup(
      device,
      colorBuffer,
      cellPipeline,
    );

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

    pass.setBindGroup(0, bindGroup);
    pass.setBindGroup(1, bindMousePosition);
    pass.setBindGroup(2, colorBindGroup);

    pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times

    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    // Finish the command buffer and immediately submit it.
    // device.queue.submit([encoder.finish()]);
    //
  };

  const paintPixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    colorBuffer[arrayIndex] = 0xff0000;
  };

  return {
    drawFrame,
    paintPixel,
  };
};
