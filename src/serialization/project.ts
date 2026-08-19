import type { TiledLayerBuffer } from "../pixelPainter/tiledLayer";
import type { Layers, Vec2 } from "../pixelPainter/types";
import { serialization } from ".";
import { layer } from "./layer";

export type SerializedProject = {
	id: string;
	name: string;
	gridSize: Vec2;
	layers: Layers;
	buffers: Record<string, string>;
	colorPalette: string[];
	activeLayer?: string;
};

export type LoadedProject = Omit<SerializedProject, "buffers"> & {
	buffers: Record<string, TiledLayerBuffer>;
};

const normalizeLayers = (layers: Layers): Layers => {
	return layers.map((layer) => ({
		...layer,
		offset: layer.offset ?? { x: 0, y: 0 },
	}));
};

export const getSerializedBuffers = (
	buffers: Map<string, TiledLayerBuffer>,
): Record<string, string> => {
	const serialized: Record<string, string> = {};

	for (const [key, buffer] of buffers) {
		const serializedBuffer = serialization.layer.serialize(buffer);
		serialized[key] = serializedBuffer;
	}

	return serialized;
};

export const serialize = (
	id: string,
	name: string,
	gridSize: Vec2,
	layers: Layers,
	buffers: Map<string, TiledLayerBuffer>,
	colorPalette: string[],
	activeLayer?: string,
): SerializedProject => {
	const serializedBuffers = getSerializedBuffers(buffers);

	// Make sure to return a new object and not a reference to the original layers,
	// to avoid issues with mutable data when applying the project
	const copyLayer = normalizeLayers(JSON.parse(JSON.stringify(layers)));

	const project: SerializedProject = {
		id,
		name,
		gridSize,
		layers: copyLayer,
		buffers: serializedBuffers,
		activeLayer,
		colorPalette,
	};

	return project;
};

function deserializeProject(data: SerializedProject): SerializedProject {
	return {
		id: data.id,
		name: data.name,
		gridSize: data.gridSize,
		layers: normalizeLayers(data.layers),
		buffers: data.buffers,
		activeLayer: data.activeLayer,
		colorPalette: data.colorPalette,
	};
}

async function decompressToJSON(file: Blob): Promise<any> {
	const stream = file.stream().pipeThrough(new DecompressionStream("gzip"));
	const buffer = await new Response(stream).arrayBuffer();

	const json = new TextDecoder().decode(buffer);
	return JSON.parse(json);
}

async function loadProject(file: Blob): Promise<LoadedProject> {
	const projectJSON = await decompressToJSON(file);
	const project = deserializeProject(projectJSON);

	const buffers: Record<string, TiledLayerBuffer> = {};

	for (const [key, buffer] of Object.entries(project.buffers)) {
		const tiledBuffer = layer.deserialize(buffer, project.gridSize);
		buffers[key] = tiledBuffer;
	}

	return {
		...project,
		buffers,
	};
}

function saveBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

async function saveProject(project: SerializedProject): Promise<void> {
	const json = JSON.stringify(project);
	const encoder = new TextEncoder();
	const data = encoder.encode(json);

	const stream = new CompressionStream("gzip");
	const writer = stream.writable.getWriter();
	writer.write(data);
	writer.close();

	const compressed = await new Response(stream.readable).arrayBuffer();

	const blob = new Blob([compressed], { type: "application/gzip" });

	saveBlob(blob, `${project.name}.pxart`);
}

export const project = {
	serialize,
	saveProject,
	loadProject,
};
