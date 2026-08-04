import type { ProjectConfigHandler } from "./pixelPainter/handlers/projectConfigHandler";
import type { TiledLayerBuffer } from "./pixelPainter/tiledLayer";
import {
	createTiledLayerBuffer,
	deserializeTiledLayerBufferFromIndexedDB,
	type IndexedDBTiledLayerBuffer,
	serializeTiledLayerBufferForIndexedDB,
} from "./pixelPainter/tiledLayer";
import type { Vec2 } from "./pixelPainter/types";
import { serialization } from "./serialization";

function openDB(name: string): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(name, 1);

		// version change
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(`${name}`)) {
				db.createObjectStore(`layers`);
			}
		};

		request.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.onversionchange = () => {
				db.close();
			};
			resolve(db);
		};

		request.onerror = (event) => {
			reject((event.target as IDBOpenDBRequest).error);
		};
	});
}

function deleteDB(name: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.deleteDatabase(name);

		request.onsuccess = () => resolve();
		request.onerror = (event) => {
			reject((event.target as IDBOpenDBRequest).error);
		};
		request.onblocked = () => {
			reject(new Error(`Deletion of IndexedDB database "${name}" is blocked`));
		};
	});
}

export const localDataBase = async (
	name: string,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const db = await openDB(name);

	async function save(
		buffer: TiledLayerBuffer,
		layerId: string,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const tx = db.transaction(`layers`, "readwrite");
			const store = tx.objectStore(`layers`);
			const storedBuffer = serializeTiledLayerBufferForIndexedDB(buffer);
			store.put(storedBuffer, layerId);
			tx.oncomplete = () => resolve();
			tx.onerror = (e) => reject((e.target as IDBRequest).error);
		});
	}

	async function load(layerId: string): Promise<TiledLayerBuffer> {
		return new Promise((resolve, reject) => {
			const tx = db.transaction(`layers`, "readonly");
			const store = tx.objectStore(`layers`);
			const request = store.get(layerId);

			request.onsuccess = (e) => {
				const result = (e.target as IDBRequest).result as
					| string
					| IndexedDBTiledLayerBuffer
					| undefined;
				if (!result) {
					resolve(createTiledLayerBuffer());
					return;
				}

				if (typeof result === "string") {
					const gridSize = projectConfigHandler.getSize();
					resolve(serialization.layer.deserialize(result, gridSize));
					return;
				}

				resolve(deserializeTiledLayerBufferFromIndexedDB(result));
			};
			request.onerror = (e) => reject((e.target as IDBRequest).error);
		});
	}

	return {
		save,
		load,
	};
};

export const storageDB = {
	delete: deleteDB,
};
