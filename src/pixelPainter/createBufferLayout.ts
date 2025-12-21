export const createVertexBuffer = (device: GPUDevice) => {
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
