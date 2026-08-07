import { storageLocal } from "../../storageLocal";
import { calculateZoomFromGridAndCanvasSize, debounce } from "../../utils";
import type { LayerPreviewHandler } from "../layerPreview";
import type { TiledLayerBuffer } from "../tiledLayer";
import type { Layers, Vec2 } from "../types";
import type { BrushHandler } from "./brushHandler";
import type { HistoryChangeHandler } from "./historyChangeHandler";
import type { LayerHandler } from "./layerHandler";
import type { ProjectConfigHandler } from "./projectConfigHandler";
import type { RenderHandler } from "./renderHandler";
import type { UniformBufferHandler } from "./uniformBuffersHandler";

export const createMiddlewareHandler = (
	canvas: HTMLCanvasElement,
	brushHandler: BrushHandler,
	uniformBufferHandler: UniformBufferHandler,
	renderHandler: RenderHandler,
	layerHandler: LayerHandler,
	historyChangeHandler: HistoryChangeHandler,
	layerPreview: LayerPreviewHandler,
	projectConfigHandler: ProjectConfigHandler,
) => {
	const debounceAddAction = debounce(
		() => historyChangeHandler.addAction(),
		100,
	);

	const loadTextureLayers = (layers?: Layers) => {
		const curLayers = layers ?? layerHandler.getList();

		for (const layer of curLayers) {
			renderHandler.addLayerTexture(layer.id);
		}
	};

	const addLayer = () => {
		const id = layerHandler.add();
		renderHandler.addLayerTexture(id);
		historyChangeHandler.addAction({ captureCurrentBuffer: true });
		return id;
	};

	const removeLayer = (id: string) => {
		layerHandler.remove(id);
		renderHandler.removeLayerTexture(id);
		historyChangeHandler.addAction({ captureCurrentBuffer: false });
		return id;
	};

	const duplicateLayer = (id: string) => {
		const layerId = layerHandler.duplicate(id);
		renderHandler.addLayerTexture(layerId);
		historyChangeHandler.addAction({ captureCurrentBuffer: true });
		return layerId;
	};

	const setBrushThickness = (value: number) => {
		brushHandler.setThickness(value);
		uniformBufferHandler.updateBrushThickness(value);
	};

	const setBrushColor = (color: number | string) => {
		brushHandler.setColor(color);
		uniformBufferHandler.updateSelectedColor(brushHandler.getSelectedColor());
	};

	const setBrushOpacity = (opacity: number) => {
		brushHandler.setOpacity(opacity);
		uniformBufferHandler.updateBrushOpacity(brushHandler.getOpacity());
	};

	const setOpacity = (
		layerId: string,
		opacity: number,
		registerHistoryChange: boolean = false,
	) => {
		layerHandler.setOpacity(layerId, opacity);
		if (registerHistoryChange) {
			historyChangeHandler.addAction({ captureCurrentBuffer: true });
		}
	};

	const draw = () => {
		// Draw preview first, because preview does not invalidate dirty layers,
		// and render handler does, so if render handlers draws firs, the preview will
		// always get clean layer and draw nothing
		const currentLayer = layerHandler.getActive();
		if (currentLayer) {
			const currentBuffer = layerHandler.getBufferById(currentLayer.id);
			if (currentBuffer) {
				layerPreview.drawPreview(currentLayer, currentBuffer);
			}
		}
		renderHandler.draw();
	};

	const loadLayers = (
		serializedLayers: Layers,
		serializedBuffer: Record<string, TiledLayerBuffer>,
	) => {
		loadTextureLayers(serializedLayers);
		layerHandler.load(serializedLayers, serializedBuffer);
	};

	const setGridSize = (gridSize: Vec2) => {
		projectConfigHandler.setSize(gridSize);
		uniformBufferHandler.refreshSize();
		layerPreview.refreshSize();

		const viewport = {
			width: canvas.clientWidth,
			height: canvas.clientHeight,
		};

		const zoom = calculateZoomFromGridAndCanvasSize(gridSize, {
			x: viewport.width,
			y: viewport.height,
		});

		uniformBufferHandler.updateZoom(zoom - zoom * 0.3);
		uniformBufferHandler.updatePan({
			x: 0,
			y: 0,
		});

		const activeProject = storageLocal.getActiveProject();
		if (!activeProject) {
			return;
		}

		activeProject.gridSize = gridSize;
		storageLocal.setActiveProject(activeProject);

		const projects = storageLocal.getProjects();
		const updatedProjects = projects.map((project) => {
			if (project.name === activeProject.name) {
				return activeProject;
			}
			return project;
		});

		storageLocal.setProjects(updatedProjects);
	};

	const moveLayer = (layerId: string, offset: Vec2) => {
		layerHandler.move(layerId, offset);
		debounceAddAction();
	};

	return {
		loadTextureLayers,
		addLayer,
		setOpacity,
		removeLayer,
		duplicateLayer,
		setBrushColor,
		setBrushOpacity,
		setBrushThickness,
		draw,
		loadLayers,
		setGridSize,
		moveLayer,
	};
};
