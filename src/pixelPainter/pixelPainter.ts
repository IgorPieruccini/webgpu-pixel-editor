/// <reference types="@webgpu/types" />

import { localDataBase } from "../storage";
import { generateUUID } from "../utils";
import gridShader from "./shaders/grid.wgsl";
import type { Layer, Layers, PixelPainterReturnType } from "./types";
import { bind } from "./utils";
import { createSignal } from "solid-js";

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
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
  });

  return cellPipeline;
};

export const pixelPainter = async (
  projectName: string,
  gridSize: number,
  canvasSize: { x: number; y: number },
): Promise<PixelPainterReturnType> => {
  const { device, canvasFormat, context } = await webGPUSetup();

  let stringLayers = window.localStorage.getItem(`${projectName}-layers`);
  if (!stringLayers) {
    const l = [{ id: generateUUID(), name: "layer 0" }];
    stringLayers = JSON.stringify(l);
    window.localStorage.setItem(`${projectName}-layers`, stringLayers);
  }

  const [layers, setLayers] = createSignal<Layers>(JSON.parse(stringLayers));

  const firstLayer = layers().at(0);
  if (!firstLayer) {
    throw new Error(
      "Pixel Painter must be initialized at least with one layer",
    );
  }

  const [activeLayerId, setActiveLayerId] = createSignal<string>(firstLayer.id);

  let currentBufferLayer: Uint32Array<ArrayBuffer>;

  const db = await localDataBase(projectName);

  const layersBuffer: Map<string, Uint32Array<ArrayBuffer>> = new Map();

  for (const layer of layers()) {
    try {
      const layerBuffer = await db.load(layer.id);
      if (layerBuffer) {
        layersBuffer.set(layer.id, layerBuffer);
      } else {
        layersBuffer.set(layer.id, new Uint32Array(gridSize * gridSize));
      }
    } catch {
      layersBuffer.set(layer.id, new Uint32Array(gridSize * gridSize));
    }
  }

  const firstBuffer = layersBuffer.get(firstLayer.id);
  if (!firstBuffer) {
    throw new Error(
      "Something went wrong accessing the buffer from first layer",
    );
  }

  currentBufferLayer = firstBuffer;

  let currentColorSelected: number = 0xff00ff;
  const colorStore = createSignal("#ff00ff");

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
    selectedCells: { x: number; y: number; z: number; w: number },
  ) => {
    if (layersBuffer.size === 0) {
      return;
    }

    // Provides an interface for recording GPU commands.
    const encoder = device.createCommandEncoder({
      label: "Grid encoder",
    });

    //Render passes are when all drawing operations in WebGPU happen.
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.13, g: 0.13, b: 0.13, a: 0 },
        },
      ],
    });

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
      selectedCells.x,
      selectedCells.y,
      selectedCells.z,
      selectedCells.w,
      1, // is first layer boolean
    ]);

    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);

    const array = Array.from(layersBuffer);

    let index = 0;
    for (const [_id, buffer] of array) {
      if (index !== 0) {
        // set to false if not the first layer
        bindValues[13] = 0;
      }
      pass.setBindGroup(0, createBind("bindValues", bindValues, 0));
      pass.setBindGroup(1, createBind("colors", buffer, 1));

      pass.draw(vertices.length / 2, gridSize * gridSize); // 6 vertices and draw several times
      index++;
    }

    pass.end();
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  };

  const setBrushColor = (_color: number | string) => {
    if (typeof _color === "string") {
      currentColorSelected = parseInt(_color.replace("#", ""), 16);
      colorStore[1](_color);
    }

    if (typeof _color === "number") {
      currentColorSelected = _color;
      colorStore[1]("#" + currentColorSelected.toString(16).padStart(6, "0"));
    }
  };

  const getColorFrom = (pos: { x: number; y: number }) => {
    const i = pos.x + pos.y * gridSize;
    const color = currentBufferLayer[i];
    return color;
  };

  const paintPixel = (cellPos: { x: number; y: number }) => {
    const arrayIndex = cellPos.x + cellPos.y * gridSize;
    currentBufferLayer[arrayIndex] = currentColorSelected;
    db.save(currentBufferLayer, activeLayerId());
  };

  const addLayer = () => {
    const currentLayers = layers();

    const layer = {
      id: generateUUID(),
      name: `Layer`,
    };

    const _layers: Layers = [...currentLayers, layer];

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setLayers(_layers);

    setActiveLayerId(layer.id);
    const newBuffer = new Uint32Array(gridSize * gridSize);
    layersBuffer.set(layer.id, newBuffer);
    currentBufferLayer = newBuffer;
  };

  const removeLayer = (id: string) => {
    const _layers = [...layers()];

    if (_layers.length === 1) {
      // At least one layer per project needs to exist
      return;
    }

    const index = _layers.findIndex((layer) => layer.id === id);
    const newActiveLayerIndex = index >= 1 ? index - 1 : index + 1;
    const newActiveLayerId = _layers[newActiveLayerIndex].id;

    // re-assign current layer id
    if (activeLayerId() === id) {
      setActiveLayerId(newActiveLayerId);
      const newBuffer = layersBuffer.get(newActiveLayerId);
      if (!newBuffer) {
        throw new Error(
          `layer buffer with id ${newActiveLayerId} could not be found`,
        );
      }
      currentBufferLayer = newBuffer;
    }

    _layers.splice(index, 1);
    setLayers(_layers);
    layersBuffer.delete(id);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );
  };

  const sortLayers = (dragged: string, dropped: string) => {
    const _layers = [...layers()];

    let draggedIndex = 0;
    let droppedIndex = 0;

    for (let i = 0; i < _layers.length; i++) {
      const layer = _layers[i];
      if (layer.id === dragged) {
        draggedIndex = i;
      }
      if (layer.id == dropped) {
        droppedIndex = i;
      }
    }

    const draggedLayer = _layers.splice(draggedIndex, 1);

    const first = _layers.slice(0, droppedIndex);
    const second = _layers.slice(droppedIndex, _layers.length);
    const newLayers = [...first, ...draggedLayer, ...second];

    setLayers(newLayers);

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(newLayers),
    );

    layersBuffer.clear();
    for (const layer of layers()) {
      db.load(layer.id).then((layerBuffer) => {
        if (layerBuffer) {
          layersBuffer.set(layer.id, layerBuffer);
        } else {
          layersBuffer.set(layer.id, new Uint32Array(gridSize * gridSize));
        }
      });
    }
  };

  const renameLayer = (name: string) => {
    const _layers = layers().map((layer: Layer) => {
      if (layer.id === activeLayerId()) {
        return {
          ...layer,
          name,
        };
      }

      return layer;
    });

    window.localStorage.setItem(
      `${projectName}-layers`,
      JSON.stringify(_layers),
    );

    setLayers(_layers);
  };

  const selectLayer = (layerId: string) => {
    setActiveLayerId(layerId);
    const buffer = layersBuffer.get(layerId);
    if (!buffer) {
      throw new Error(`Could not find buffer corresponded to id: ${layerId}`);
    }
    currentBufferLayer = buffer;
  };

  return {
    drawFrame,
    paintPixel,
    setBrushColor,
    getColorFrom,
    getCurrentColor: colorStore[0],
    addLayer,
    sortLayers,
    removeLayer,
    renameLayer,
    getLayers: layers,
    selectLayer,
    getActiveLayer: activeLayerId,
  };
};
