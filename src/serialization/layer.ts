import {
	deserializeTiledLayerBuffer,
	serializeTiledLayerBuffer,
	type TiledLayerBuffer,
} from "../pixelPainter/tiledLayer";
import type { Vec2 } from "../pixelPainter/types";

const serialize = (buffer: TiledLayerBuffer) => {
	return serializeTiledLayerBuffer(buffer);
};

const deserialize = (serialized: string, gridSize?: Vec2) => {
	return deserializeTiledLayerBuffer(serialized, gridSize);
};

export const layer = {
	serialize,
	deserialize,
};
