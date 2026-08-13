import { BYTES_PER_PIXEL, RGBA_OFFSET } from "../constants";
import type { RGBA, Vec2 } from "./types";

export const DEFAULT_TILE_SIZE = 128;

export type TileKey = `${number},${number}`;

export type TiledLayerBuffer = {
	tileSize: number;
	tiles: Map<TileKey, Uint8Array<ArrayBuffer>>;
};

export type SerializedTiledLayerBuffer = {
	tileSize: number;
	tiles: Record<string, string>;
};

export type IndexedDBTiledLayerBuffer = {
	tileSize: number;
	tiles: Array<[TileKey, Uint8Array<ArrayBuffer>]>;
};

const createEmptyPixel = () => ({ r: 0, g: 0, b: 0, a: 0 });

const encodeTileKey = (tileX: number, tileY: number): TileKey =>
	`${tileX},${tileY}`;

const floorDiv = (value: number, divisor: number) => {
	return Math.floor(value / divisor);
};

const getLocalOffset = (value: number, tileSize: number) => {
	const remainder = value % tileSize;
	return remainder < 0 ? remainder + tileSize : remainder;
};

const getTileIndex = (localX: number, localY: number, tileSize: number) => {
	return (localY * tileSize + localX) * BYTES_PER_PIXEL;
};

const uint8ToBase64 = (uint8: Uint8Array) => {
	let binary = "";
	for (let i = 0; i < uint8.length; i++) {
		binary += String.fromCharCode(uint8[i]);
	}
	return btoa(binary);
};

const base64ToUint8 = (base64: string): Uint8Array<ArrayBuffer> => {
	const binary = atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes;
};

export const createTiledLayerBuffer = (
	tileSize: number = DEFAULT_TILE_SIZE,
): TiledLayerBuffer => {
	return {
		tileSize,
		tiles: new Map(),
	};
};

export const cloneTiledLayerBuffer = (
	buffer: TiledLayerBuffer,
): TiledLayerBuffer => {
	const copy = createTiledLayerBuffer(buffer.tileSize);

	for (const [key, tile] of buffer.tiles) {
		const nextTile = new Uint8Array(tile.length);
		nextTile.set(tile);
		copy.tiles.set(key, nextTile);
	}

	return copy;
};

const getTile = (
	buffer: TiledLayerBuffer,
	localX: number,
	localY: number,
): Uint8Array<ArrayBuffer> | undefined => {
	const tileX = floorDiv(localX, buffer.tileSize);
	const tileY = floorDiv(localY, buffer.tileSize);
	return buffer.tiles.get(encodeTileKey(tileX, tileY));
};

const getOrCreateTile = (
	buffer: TiledLayerBuffer,
	localX: number,
	localY: number,
): Uint8Array<ArrayBuffer> => {
	const tileX = floorDiv(localX, buffer.tileSize);
	const tileY = floorDiv(localY, buffer.tileSize);
	const key = encodeTileKey(tileX, tileY);
	const current = buffer.tiles.get(key);
	if (current) {
		return current;
	}

	const created = new Uint8Array(
		buffer.tileSize * buffer.tileSize * BYTES_PER_PIXEL,
	);
	buffer.tiles.set(key, created);
	return created;
};

export const getPixelAtLocal = (
	buffer: TiledLayerBuffer,
	localX: number,
	localY: number,
): RGBA => {
	const tile = getTile(buffer, localX, localY);
	if (!tile) {
		return createEmptyPixel();
	}

	const tileOffsetX = getLocalOffset(localX, buffer.tileSize);
	const tileOffsetY = getLocalOffset(localY, buffer.tileSize);
	const index = getTileIndex(tileOffsetX, tileOffsetY, buffer.tileSize);

	const rgba = {
		r: tile[index + RGBA_OFFSET.RED],
		g: tile[index + RGBA_OFFSET.GREEN],
		b: tile[index + RGBA_OFFSET.BLUE],
		a: tile[index + RGBA_OFFSET.ALPHA],
	};

	return rgba;
};

export const setPixelAtLocal = (
	buffer: TiledLayerBuffer,
	localX: number,
	localY: number,
	rgba: { r: number; g: number; b: number; a: number },
) => {
	const tile = getOrCreateTile(buffer, localX, localY);
	const tileOffsetX = getLocalOffset(localX, buffer.tileSize);
	const tileOffsetY = getLocalOffset(localY, buffer.tileSize);
	const index = getTileIndex(tileOffsetX, tileOffsetY, buffer.tileSize);

	tile[index + RGBA_OFFSET.RED] = rgba.r;
	tile[index + RGBA_OFFSET.GREEN] = rgba.g;
	tile[index + RGBA_OFFSET.BLUE] = rgba.b;
	tile[index + RGBA_OFFSET.ALPHA] = rgba.a;
};

export const serializeTiledLayerBuffer = (buffer: TiledLayerBuffer) => {
	const tiles: Record<string, string> = {};

	for (const [key, tile] of buffer.tiles) {
		tiles[key] = uint8ToBase64(tile);
	}

	const serialized: SerializedTiledLayerBuffer = {
		tileSize: buffer.tileSize,
		tiles,
	};

	return JSON.stringify(serialized);
};

export const serializeTiledLayerBufferForIndexedDB = (
	buffer: TiledLayerBuffer,
): IndexedDBTiledLayerBuffer => {
	return {
		tileSize: buffer.tileSize,
		tiles: Array.from(buffer.tiles.entries(), ([key, tile]) => {
			const copiedTile = new Uint8Array(tile.length);
			copiedTile.set(tile);
			return [key, copiedTile];
		}),
	};
};

export const deserializeTiledLayerBufferFromIndexedDB = (
	stored: IndexedDBTiledLayerBuffer,
): TiledLayerBuffer => {
	const buffer = createTiledLayerBuffer(stored.tileSize);

	for (const [key, tile] of stored.tiles) {
		const copiedTile = new Uint8Array(tile.length);
		copiedTile.set(tile);
		buffer.tiles.set(key, copiedTile);
	}

	return buffer;
};

export const deserializeTiledLayerBuffer = (
	serialized: string,
	gridSize?: Vec2,
): TiledLayerBuffer => {
	const trimmed = serialized.trim();

	if (trimmed.startsWith("{")) {
		const parsed = JSON.parse(trimmed) as SerializedTiledLayerBuffer;
		const buffer = createTiledLayerBuffer(parsed.tileSize);

		for (const [key, tile] of Object.entries(parsed.tiles)) {
			buffer.tiles.set(key as TileKey, base64ToUint8(tile));
		}

		return buffer;
	}

	if (!gridSize) {
		throw new Error("Grid size is required to load legacy layer buffers");
	}

	return createTiledLayerBufferFromFlat(base64ToUint8(serialized), gridSize);
};

export const createTiledLayerBufferFromFlat = (
	flatBuffer: Uint8Array<ArrayBuffer>,
	gridSize: Vec2,
	tileSize: number = DEFAULT_TILE_SIZE,
): TiledLayerBuffer => {
	const tiled = createTiledLayerBuffer(tileSize);

	for (let y = 0; y < gridSize.y; y++) {
		for (let x = 0; x < gridSize.x; x++) {
			const index = (y * gridSize.x + x) * BYTES_PER_PIXEL;
			const r = flatBuffer[index + RGBA_OFFSET.RED];
			const g = flatBuffer[index + RGBA_OFFSET.GREEN];
			const b = flatBuffer[index + RGBA_OFFSET.BLUE];
			const a = flatBuffer[index + RGBA_OFFSET.ALPHA];

			if (r === 0 && g === 0 && b === 0 && a === 0) {
				continue;
			}

			setPixelAtLocal(tiled, x, y, { r, g, b, a });
		}
	}

	return tiled;
};
