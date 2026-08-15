import type { createTiledLayerBuffer } from "./tiledLayer";
import type { PixelPainterMethods, RGBA } from "./types";

function getSelectedColor(): number;
function getSelectedColor(format: "number"): number;
function getSelectedColor(format: "rgba"): RGBA;
function getSelectedColor(format: "string"): string;
function getSelectedColor(
	format: "number" | "string" | "rgba" = "number",
): number | string | RGBA {
	if (format === "string") {
		return "#ffffffff";
	}

	if (format === "rgba") {
		return { r: 255, g: 255, b: 244, a: 1 };
	}
	return 0xffffffff;
}

export const INITIAL_PIXEL_PAINTER: PixelPainterMethods = {
	layer: {
		add: () => "",
		remove: (id: string) => id,
		toggleDisplay: () => {},
		sort: () => {},
		rename: () => {},
		getList: () => [],
		select: () => {},
		getActive: () => ({
			name: "",
			opacity: 1,
			display: true,
			id: "",
			offset: { x: 0, y: 0 },
		}),
		setOpacity: () => {},
		setOffset: () => {},
		move: () => {},
		getBufferById: () => undefined,
		duplicate: (id: string) => id,
		setLayerBuffer: () => {},
		buffers: new Map<string, ReturnType<typeof createTiledLayerBuffer>>(),
		load: () => [],
		set: () => {},
	},
	brush: {
		setColor: () => {},
		paint: () => false,
		erase: () => {},
		getOpacity: () => 1,
		setOpacity: () => {},
		getSelectedColor,
		getThickness: () => 1,
		setThickness: () => {},
	},
	line: {
		setLineStartPosition: () => {},
		resetLineStartPosition: () => {},
		draw: () => {},
	},
	bucketPaint: {
		paint: () => {},
	},
	render: {
		draw: () => {},
		setCanvasSize: () => {},
		setPan: () => {},
		setZoom: () => {},
		setCellPos: () => {},
		setSelectedCellsPosition: () => {},
		setSelectedCellsSize: () => {},
		getZoom: () => 1,
		getCellPosition: () => ({ x: 0, y: 0 }),
		getPan: () => ({ x: 0, y: 0 }),
		getSelectedCellsRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
		setSelectionTool: () => {},
		isSelectionToolEnabled: () => false,
	},
	history: {
		undo: () => {},
		redo: () => {},
	},
	export: {
		image: async () => {},
		getBlob: async () => new Blob(),
	},
	colorPalette: {
		getColors: () => [],
		isLoading: false,
		addColor: () => {},
		removeColor: () => {},
		getColorPalette: () => [],
		sortColorPalette: () => {},
		loadColorPalette: () => {},
	},
	tool: {
		set: () => {},
		get: () => 0,
	},
	eyeDropper: {
		eyeDropAtCell: () => {},
	},
	projectConfig: {
		setSize: () => {},
		getSize: () => ({ x: 128, y: 128 }),
		getProjectName: () => "project not initialized",
		setProjectName: () => {},
	},
	eventHandler: {
		tick: () => {},
		startListening: () => {},
		stopListening: () => {},
		unsubscribeAll: () => {},
		subscribe: {
			mouseDown: () => () => {},
			mouseUp: () => () => {},
			mouseMove: () => () => {},
			mouseWheel: () => () => {},
			keyDown: () => () => {},
			keyUp: () => () => {},
		},
	},
};
