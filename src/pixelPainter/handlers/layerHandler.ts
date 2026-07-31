import { createSignal } from "solid-js";
import { localDataBase } from "../../storageDB";
import { storageLocal } from "../../storageLocal";
import { generateUUID } from "../../utils";
import {
	cloneTiledLayerBuffer,
	createTiledLayerBuffer,
	type TiledLayerBuffer,
} from "../tiledLayer";
import type { Layer, Layers, Vec2 } from "../types";

export type LayerHandler = Awaited<ReturnType<typeof createLayerHandler>>;

const normalizeLayer = (layer: Layer): Layer => ({
	...layer,
	offset: layer.offset ?? { x: 0, y: 0 },
});

export const createLayerHandler = async (
	projectName: string,
	gridSize: Vec2,
) => {
	const stringLayers = storageLocal
		.createLayers(projectName)
		.map(normalizeLayer);

	const [getList, setList] = createSignal<Layers>(stringLayers);
	const dirtyStatus: Set<string> = new Set(
		stringLayers.map((layer) => layer.id),
	);

	const firstLayer = getList().at(0);
	if (!firstLayer) {
		throw new Error(
			"Pixel Painter must be initialized at least with one layer",
		);
	}

	const [getActive, setActive] = createSignal<Layer>(firstLayer);

	const buffers: Map<string, TiledLayerBuffer> = new Map();
	const db = await localDataBase(projectName, gridSize);

	for (const layer of getList()) {
		try {
			const layerBuffer = await db.load(layer.id);
			buffers.set(layer.id, layerBuffer);
		} catch {
			buffers.set(layer.id, createTiledLayerBuffer());
		}
	}

	const isLayerDirty = (id: string) => {
		return dirtyStatus.has(id);
	};

	const isCurrentLayerDirty = () => {
		const currentLayer = getActive();
		return isLayerDirty(currentLayer.id);
	};

	const makeCurrentLayerDirty = () => {
		const currentLayer = getActive();
		makeLayerDirty(currentLayer.id);
	};

	const makeLayerDirty = (id: string) => {
		dirtyStatus.add(id);
	};

	const makeLayerClean = (id: string) => {
		dirtyStatus.delete(id);
	};

	const saveLayers = (layers: Layers) => {
		const normalized = layers.map(normalizeLayer);
		storageLocal.saveLayers(projectName, normalized);
	};

	const add = (): string => {
		const layers = getList();

		const layer: Layer = {
			id: generateUUID(),
			name: "Layer",
			display: true,
			opacity: 1,
			offset: { x: 0, y: 0 },
		};

		const nextLayers: Layers = [...layers, layer];
		setList(nextLayers);
		saveLayers(nextLayers);
		setActive(layer);

		buffers.set(layer.id, createTiledLayerBuffer());
		dirtyStatus.add(layer.id);

		return layer.id;
	};

	const set = (layer: Layer) => {
		const layers = getList();
		const index = layers.findIndex((l) => l.id === layer.id);
		if (index === -1) {
			throw new Error(`Layer with id ${layer.id} not found`);
		}

		const nextLayers: Layers = [...layers];
		nextLayers[index] = normalizeLayer(layer);
		setList(nextLayers);
		saveLayers(nextLayers);
	};

	const remove = (id: string): string | null => {
		const layers = [...getList()];

		if (layers.length === 1) {
			return null;
		}

		const index = layers.findIndex((layer) => layer.id === id);
		const newActiveLayerIndex = index >= 1 ? index - 1 : index + 1;
		const newActiveLayer = layers[newActiveLayerIndex];

		if (getActive().id === id) {
			setActive(newActiveLayer);
		}

		layers.splice(index, 1);
		setList(layers);
		buffers.delete(id);
		saveLayers(layers);
		dirtyStatus.delete(id);

		return id;
	};

	const sort = (dragged: string, dropped: string) => {
		const layers = [...getList()];
		let draggedIndex = 0;
		let droppedIndex = 0;

		for (let i = 0; i < layers.length; i++) {
			const layer = layers[i];
			if (layer.id === dragged) {
				draggedIndex = i;
			}
			if (layer.id === dropped) {
				droppedIndex = i;
			}
		}

		const draggedLayer = layers.splice(draggedIndex, 1);
		const first = layers.slice(0, droppedIndex);
		const second = layers.slice(droppedIndex, layers.length);
		const newLayers = [...first, ...draggedLayer, ...second];

		setList(newLayers);
		saveLayers(newLayers);
	};

	const rename = (name: string) => {
		const layers = getList().map((layer) => {
			if (layer.id === getActive().id) {
				return { ...layer, name };
			}
			return layer;
		});

		setList(layers);
		saveLayers(layers);
	};

	const toggleDisplay = (id: string) => {
		const newLayers = getList().map((layer) => {
			if (layer.id === id) {
				return {
					...layer,
					display: !layer.display,
				};
			}
			return layer;
		});

		setList(newLayers);
		saveLayers(newLayers);
		dirtyStatus.add(id);
	};

	const select = (layerId: string) => {
		const layer = getList().find((item) => item.id === layerId);
		if (!layer) {
			throw new Error(`Could not find current layer by id ${layerId}`);
		}

		setActive(layer);
		makeCurrentLayerDirty();
	};

	const setOpacity = (layerId: string, opacity: number) => {
		const newLayers = getList().map((layer) => {
			if (layer.id === layerId) {
				return { ...layer, opacity };
			}
			return layer;
		});

		setList(newLayers);
		saveLayers(newLayers);

		if (layerId === getActive().id) {
			setActive({
				...getActive(),
				opacity,
			});
		}

		dirtyStatus.add(layerId);
	};

	const setOffset = (layerId: string, offset: Vec2) => {
		const newLayers = getList().map((layer) => {
			if (layer.id === layerId) {
				return { ...layer, offset };
			}
			return layer;
		});

		setList(newLayers);
		saveLayers(newLayers);

		if (layerId === getActive().id) {
			setActive({
				...getActive(),
				offset,
			});
		}

		dirtyStatus.add(layerId);
	};

	const move = (layerId: string, delta: Vec2) => {
		const layer = getList().find((item) => item.id === layerId);
		if (!layer) {
			throw new Error(`Layer with id ${layerId} not found`);
		}

		setOffset(layerId, {
			x: layer.offset.x + delta.x,
			y: layer.offset.y + delta.y,
		});
	};

	const saveCurrentBuffer = () => {
		const currentLayer = getActive();
		const buffer = buffers.get(currentLayer.id);
		if (!buffer) {
			throw new Error(`Layer buffer with id ${currentLayer.id} not found`);
		}
		db.save(buffer, currentLayer.id);
	};

	const duplicate = (layerId: string): string => {
		const layers = getList();
		const targetLayerIndex = layers.findIndex((layer) => layer.id === layerId);
		const targetLayer = layers[targetLayerIndex];

		if (!targetLayer) {
			throw new Error(`Could not find layer with id ${layerId} to duplicate`);
		}

		const newLayer: Layer = {
			...targetLayer,
			id: generateUUID(),
			name: `${targetLayer.name} (copy)`,
		};

		const targetBuffer = buffers.get(targetLayer.id);
		if (!targetBuffer) {
			throw new Error(
				`Could not find layer buffer linked to id ${layerId} to duplicate`,
			);
		}

		const newBuffer = cloneTiledLayerBuffer(targetBuffer);
		buffers.set(newLayer.id, newBuffer);
		db.save(newBuffer, newLayer.id);

		const first = layers.slice(0, targetLayerIndex);
		const second = layers.slice(targetLayerIndex, layers.length);
		const newLayers = [...first, newLayer, ...second];

		setList(newLayers);
		sort(newLayer.id, targetLayer.id);
		saveLayers(newLayers);
		setActive(newLayer);
		dirtyStatus.add(newLayer.id);

		return newLayer.id;
	};

	const getBufferById = (layerId: string): TiledLayerBuffer | undefined => {
		return buffers.get(layerId);
	};

	const setLayerBuffer = (layerId: string, buffer: TiledLayerBuffer) => {
		const copiedBuffer = cloneTiledLayerBuffer(buffer);
		buffers.set(layerId, copiedBuffer);
		db.save(copiedBuffer, layerId);
		dirtyStatus.add(layerId);
	};

	const load = (
		serializedLayers: Layers,
		serializedBuffer: Record<string, TiledLayerBuffer>,
	): string[] => {
		const layerCopy = JSON.parse(JSON.stringify(serializedLayers)).map(
			normalizeLayer,
		) as Layers;
		setList(layerCopy);

		buffers.clear();
		for (const layer of layerCopy) {
			const buffer = serializedBuffer[layer.id] ?? createTiledLayerBuffer();
			buffers.set(layer.id, cloneTiledLayerBuffer(buffer));
			dirtyStatus.add(layer.id);
			db.save(buffers.get(layer.id) as TiledLayerBuffer, layer.id);
		}

		saveLayers(layerCopy);

		const activeLayer = layerCopy.find((layer) => layer.id === getActive().id);
		setActive(activeLayer ?? layerCopy[0]);

		return layerCopy.map((layer) => layer.id);
	};

	const getLayerById = (id: string) => {
		return getList().find((layer) => layer.id === id);
	};

	return {
		add,
		set,
		remove,
		duplicate,
		sort,
		rename,
		toggleDisplay,
		select,
		setOpacity,
		setOffset,
		move,
		getList,
		setList,
		getLayerById,
		setLayerBuffer,
		getActive,
		setActive,
		saveCurrentBuffer,
		buffers,
		getBufferById,
		load,
		isLayerDirty,
		isCurrentLayerDirty,
		makeLayerDirty,
		makeCurrentLayerDirty,
		makeLayerClean,
	};
};
