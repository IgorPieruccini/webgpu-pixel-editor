import { serialization } from ".";
import type { Vec2 } from "../editor/types";
import type { Layers } from "../pixelPainter/types";
import { layer } from "./layer";

export type SerializedProject = {
  name: string;
  gridSize: Vec2;
  layers: Layers;
  buffers: Record<string, string>;
  activeLayer?: string
};

export type LoadedProject = Omit<SerializedProject, 'buffers'> & {
  buffers: Record<string, Uint8Array<ArrayBuffer>>
}

export const getSerializedBuffers = (
  buffers: Map<string, Uint8Array<ArrayBuffer>>,
): Record<string, string> => {
  let serialized: Record<string, string> = {};

  for (const [key, buffer] of buffers) {
    const serializedBuffer = serialization.layer.serialize(buffer);
    serialized[key] = serializedBuffer;
  }

  return serialized;
};

export const serialize = (
  name: string,
  gridSize: Vec2,
  layers: Layers,
  buffers: Map<string, Uint8Array<ArrayBuffer>>,
  activeLayer?: string
): SerializedProject => {
  const serializedBuffers = getSerializedBuffers(buffers);

  // Make sure to return a new object and not a reference to the original layers,
  // to avoid issues with mutable data when applying the project
  const copyLayer = JSON.parse(JSON.stringify(layers));

  const project: SerializedProject = {
    name,
    gridSize,
    layers: copyLayer,
    buffers: serializedBuffers,
    activeLayer
  };


  return project;
};



function deserializeProject(data: SerializedProject) {
  return {
    name: data.name,
    gridSize: data.gridSize,
    layers: data.layers,
    buffers: data.buffers,
    activeLayer: data.activeLayer
  };
}



async function decompressToJSON(file: Blob): Promise<any> {
  const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();

  const json = new TextDecoder().decode(buffer);
  return JSON.parse(json);
}


async function loadProject(file: Blob): Promise<LoadedProject> {
  const projectJSON = await decompressToJSON(file);
  const project = deserializeProject(projectJSON);

  const buffers: Record<string, Uint8Array<ArrayBuffer>> = {};


  for (const [key, buffer] of Object.entries(project.buffers)) {
    const uint8Array = layer.deserialize(buffer);
    buffers[key] = uint8Array;
  }

  return {
    ...project,
    buffers
  }
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function saveProject(project: SerializedProject): Promise<void> {
  const json = JSON.stringify(project);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(data);
  writer.close();

  const compressed = await new Response(stream.readable).arrayBuffer();

  const blob = new Blob([compressed], { type: 'application/gzip' });

  saveBlob(blob, `${project.name}.pxart`);

}

export const project = {
  serialize,
  saveProject,
  loadProject
};
