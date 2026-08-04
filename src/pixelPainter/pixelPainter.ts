import { createBrushHandler } from "./handlers/brushHandler";
import { createColorPaletteHandler } from "./handlers/colorPaletteHandler";
import { createEyeDropperHandler } from "./handlers/EyeDropperHandler";
import { createExportHandler } from "./handlers/exportHandler";
import { createHistoryChangeHandler } from "./handlers/historyChangeHandler/historyChangeHandler";
import { createLayerHandler } from "./handlers/layerHandler";
import { createMiddlewareHandler } from "./handlers/middlewareHandler";
import { createProjectConfigHandler } from "./handlers/projectConfigHandler";
import { createRenderHandler } from "./handlers/renderHandler";
import { createBucketPaintHandler } from "./handlers/tools/bucketPaintHandler";
import { createLinePaintHandler } from "./handlers/tools/linePaintHanlder";
import { createUniformBufferHandler } from "./handlers/uniformBuffersHandler";
import { createLayerPreview } from "./layerPreview";
import type { Vec2 } from "./types";

export const pixelPainter = async (
	projectName: string,
	gridSize: Vec2,
	canvasSize: Vec2,
	canvas: HTMLCanvasElement,
) => {
	const projectConfigHandler = createProjectConfigHandler(
		gridSize,
		projectName,
	);

	const layerHandler = await createLayerHandler(
		projectName,
		projectConfigHandler,
	);

	const colorPaletteHandler = createColorPaletteHandler(layerHandler);

	const uniformBufferHandler = createUniformBufferHandler(
		canvasSize,
		projectConfigHandler,
	);

	const renderHandler = await createRenderHandler(
		layerHandler,
		uniformBufferHandler,
		canvas,
	);

	const layerPreview = await createLayerPreview(
		layerHandler,
		projectConfigHandler,
	);

	const historyChangeHandler = createHistoryChangeHandler(
		layerHandler,
		renderHandler,
		colorPaletteHandler,
		projectName,
		projectConfigHandler,
	);

	const brushHandler = createBrushHandler(
		layerHandler,
		historyChangeHandler,
		colorPaletteHandler,
		projectConfigHandler,
		canvas,
	);

	const eyeDropperHandler = createEyeDropperHandler(
		layerHandler,
		brushHandler,
		uniformBufferHandler,
		projectConfigHandler,
	);

	const lineHandler = createLinePaintHandler(
		projectConfigHandler,
		uniformBufferHandler,
		layerHandler,
		brushHandler,
	);

	const bucketPaint = createBucketPaintHandler(
		projectConfigHandler,
		layerHandler,
		brushHandler,
		historyChangeHandler,
	);

	const middlewareHandler = createMiddlewareHandler(
		brushHandler,
		uniformBufferHandler,
		renderHandler,
		layerHandler,
		historyChangeHandler,
		layerPreview,
		projectConfigHandler,
	);

	const exportHandler = createExportHandler(
		projectName,
		projectConfigHandler,
		layerHandler,
	);

	middlewareHandler.loadTextureLayers();
	historyChangeHandler.addSnapshot();
	colorPaletteHandler.calculateColorPalette();

	return {
		layer: {
			add: middlewareHandler.addLayer,
			remove: middlewareHandler.removeLayer,
			duplicate: middlewareHandler.duplicateLayer,
			sort: layerHandler.sort,
			rename: layerHandler.rename,
			toggleDisplay: layerHandler.toggleDisplay,
			select: layerHandler.select,
			setOpacity: middlewareHandler.setOpacity,
			setOffset: layerHandler.setOffset,
			move: layerHandler.move,
			getList: layerHandler.getList,
			getActive: layerHandler.getActive,
			getBufferById: layerHandler.getBufferById,
			setLayerBuffer: layerHandler.setLayerBuffer,
			buffers: layerHandler.buffers,
			load: middlewareHandler.loadLayers,
			set: layerHandler.set,
		},
		brush: {
			setColor: middlewareHandler.setBrushColor,
			getColor: brushHandler.getColor,
			paint: brushHandler.paint,
			erase: brushHandler.erase,
			getOpacity: brushHandler.getOpacity,
			setOpacity: middlewareHandler.setBrushOpacity,
			getSelectedColor: brushHandler.getSelectedColor,
			getThickness: brushHandler.getThickness,
			setThickness: middlewareHandler.setBrushThickness,
		},
		line: {
			setLineStartPosition: lineHandler.setStartLinePosition,
			resetLineStartPosition: lineHandler.resetStartLinePosition,
			draw: lineHandler.draw,
		},
		bucketPaint: {
			paint: bucketPaint.floodFill,
		},
		render: {
			draw: middlewareHandler.draw,
			setZoom: uniformBufferHandler.updateZoom,
			setPan: uniformBufferHandler.updatePan,
			setCanvasSize: uniformBufferHandler.updateCanvasSize,
			setCellPos: uniformBufferHandler.updateCellPos,
			setSelectedCellsSize: uniformBufferHandler.updateSelectedCellsSize,
			setSelectedCellsPosition:
				uniformBufferHandler.updateSelectedCellsPosition,
			getZoom: uniformBufferHandler.zoom,
			getCellPosition: uniformBufferHandler.cellPosition,
			getPan: uniformBufferHandler.pan,
			getSelectedCellsRect: uniformBufferHandler.selectedCellsRect,
			setSelectionTool: uniformBufferHandler.setSelectionTool,
			isSelectionToolEnabled: uniformBufferHandler.isSelectionToolEnabled,
		},
		history: {
			undo: historyChangeHandler.undo,
			redo: historyChangeHandler.redo,
		},
		export: {
			image: exportHandler.exportImage,
			getBlob: exportHandler.getBlob,
		},
		colorPalette: {
			getColors: colorPaletteHandler.getColors,
			isLoading: colorPaletteHandler.isLoadingColors,
			addColor: colorPaletteHandler.addColor,
			removeColor: colorPaletteHandler.removeColor,
			getColorPalette: colorPaletteHandler.getColorPalette,
			sortColorPalette: colorPaletteHandler.sortColorPalette,
			loadColorPalette: colorPaletteHandler.loadColorPalette,
		},
		tool: {
			set: uniformBufferHandler.setActiveTool,
			get: uniformBufferHandler.getActiveTool,
		},
		eyeDropper: {
			eyeDropAtCell: eyeDropperHandler.eyeDropAtCell,
		},
		projectConfig: {
			setSize: middlewareHandler.setGridSize,
			getSize: projectConfigHandler.getSize,
			getProjectName: projectConfigHandler.getProjectName,
			setProjectName: projectConfigHandler.setProjectName,
		},
	};
};
