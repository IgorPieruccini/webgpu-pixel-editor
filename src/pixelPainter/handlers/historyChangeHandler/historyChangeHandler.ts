import { serialization } from "../../../serialization";
import type { SerializedProject } from "../../../serialization/project";
import { storageLocal } from "../../../storageLocal";
import type { TiledLayerBuffer } from "../../tiledLayer";
import { cloneTiledLayerBuffer } from "../../tiledLayer";
import type { ColorPaletteHandler } from "../colorPaletteHandler";
import type { LayerHandler } from "../layerHandler";
import type { ProjectConfigHandler } from "../projectConfigHandler";
import type { RenderHandler } from "../renderHandler";

export type HistoryChangeHandler = ReturnType<
	typeof createHistoryChangeHandler
>;

type AddActionProps = {
	captureCurrentBuffer?: boolean;
	paintedPixels?: Set<number>;
};

type HistorySnapshot = {
	project: SerializedProject;
	buffers: Record<string, TiledLayerBuffer>;
};

const cloneBufferEntries = (
	entries: Iterable<[string, TiledLayerBuffer]>,
): Record<string, TiledLayerBuffer> => {
	const copy: Record<string, TiledLayerBuffer> = {};

	for (const [key, buffer] of entries) {
		copy[key] = cloneTiledLayerBuffer(buffer);
	}

	return copy;
};

const cloneProject = (project: SerializedProject): SerializedProject => {
	return structuredClone(project);
};

export const createHistoryChangeHandler = (
	layerHandler: LayerHandler,
	renderHandler: RenderHandler,
	colorPaletteHandler: ColorPaletteHandler,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const history: HistorySnapshot[] = [];
	let historyIndex = -1;

	const captureSnapshot = (): HistorySnapshot => {
		const activeLayer = layerHandler.getActive();
		const colorPalette = colorPaletteHandler.getColorPalette();
		const gridSize = projectConfigHandler.getSize();

		const id = projectConfigHandler.getId();
		const projectName = projectConfigHandler.getProjectName();

		return {
			project: serialization.project.serialize(
				id,
				projectName,
				gridSize,
				layerHandler.getList(),
				layerHandler.buffers,
				colorPalette,
				activeLayer?.id,
			),
			buffers: cloneBufferEntries(layerHandler.buffers.entries()),
		};
	};

	const restoreSnapshot = (snapshot: HistorySnapshot) => {
		const currentIds = new Set(layerHandler.getList().map((layer) => layer.id));
		const nextIds = new Set(snapshot.project.layers.map((layer) => layer.id));

		for (const id of currentIds) {
			if (!nextIds.has(id)) {
				renderHandler.removeLayerTexture(id);
			}
		}

		for (const id of nextIds) {
			renderHandler.addLayerTexture(id);
		}

		layerHandler.load(snapshot.project.layers, snapshot.buffers);

		const activeLayerId = snapshot.project.activeLayer;
		if (activeLayerId) {
			const activeLayer = layerHandler.getLayerById(activeLayerId);
			if (activeLayer) {
				layerHandler.setActive(activeLayer);
			}
		}

		const id = projectConfigHandler.getId();
		storageLocal.saveLayers(id, snapshot.project.layers);
	};

	const addSnapshot = () => {
		if (historyIndex < history.length - 1) {
			history.splice(historyIndex + 1);
		}

		const snapshot = captureSnapshot();
		history.push(snapshot);
		historyIndex = history.length - 1;
	};

	const addAction = (_props?: AddActionProps): void => {
		addSnapshot();
	};

	const undo = (): void => {
		if (historyIndex <= 0) {
			return;
		}

		historyIndex -= 1;
		const snapshot = history[historyIndex];
		if (!snapshot) {
			return;
		}

		restoreSnapshot({
			project: cloneProject(snapshot.project),
			buffers: cloneBufferEntries(Object.entries(snapshot.buffers)),
		});
	};

	const redo = (): void => {
		if (historyIndex >= history.length - 1) {
			return;
		}

		historyIndex += 1;
		const snapshot = history[historyIndex];
		if (!snapshot) {
			return;
		}

		restoreSnapshot({
			project: cloneProject(snapshot.project),
			buffers: cloneBufferEntries(Object.entries(snapshot.buffers)),
		});
	};

	return {
		addSnapshot,
		addAction,
		undo,
		redo,
	};
};
